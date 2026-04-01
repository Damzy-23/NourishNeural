const express = require('express');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const { supabase } = require('../config/supabase');
const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');

const router = express.Router();

/**
 * Middleware: authenticate a smart appliance via Bearer token
 * Tokens are hashed with SHA-256 before storage, so we hash the incoming
 * token and look it up in appliance_tokens.
 */
async function authenticateAppliance(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const rawToken = authHeader.slice(7);
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const { data: tokenRow, error } = await supabase
      .from('appliance_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('is_active', true)
      .single();

    if (error || !tokenRow) {
      return res.status(401).json({ error: 'Invalid or revoked device token' });
    }

    req.appliance = tokenRow;
    next();
  } catch (err) {
    console.error('Appliance auth error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// ---------------------------------------------------------------------------
// Token management (authenticated users)
// ---------------------------------------------------------------------------

/**
 * POST /api/appliance/tokens
 * Generate a new device token for smart appliance pairing.
 * The raw token is returned ONCE — it cannot be retrieved again.
 */
router.post('/tokens', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceName, deviceType } = req.body;

    if (!deviceName || !deviceType) {
      return res.status(400).json({ error: 'deviceName and deviceType are required' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const { data: tokenRow, error } = await supabase
      .from('appliance_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        device_name: deviceName,
        device_type: deviceType,
        is_active: true
      })
      .select('id, device_name, device_type, created_at')
      .single();

    if (error) {
      console.error('Error creating appliance token:', error);
      throw error;
    }

    res.status(201).json({
      ...tokenRow,
      token: rawToken,
      message: 'Store this token securely — it will not be shown again.'
    });
  } catch (err) {
    console.error('POST /tokens error:', err);
    res.status(500).json({ error: 'Failed to generate device token' });
  }
});

/**
 * GET /api/appliance/tokens
 * List all device tokens for the authenticated user.
 * Token hashes are never returned.
 */
router.get('/tokens', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: tokens, error } = await supabase
      .from('appliance_tokens')
      .select('id, device_name, device_type, last_sync_at, is_active, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error listing appliance tokens:', error);
      throw error;
    }

    res.json({ tokens: tokens || [] });
  } catch (err) {
    console.error('GET /tokens error:', err);
    res.status(500).json({ error: 'Failed to list device tokens' });
  }
});

/**
 * DELETE /api/appliance/tokens/:id
 * Deactivate (soft-delete) a device token.
 */
router.delete('/tokens/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const tokenId = req.params.id;

    const { data: existing, error: fetchErr } = await supabase
      .from('appliance_tokens')
      .select('id')
      .eq('id', tokenId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const { error: updateErr } = await supabase
      .from('appliance_tokens')
      .update({ is_active: false })
      .eq('id', tokenId)
      .eq('user_id', userId);

    if (updateErr) {
      console.error('Error deactivating token:', updateErr);
      throw updateErr;
    }

    res.json({ message: 'Token deactivated successfully' });
  } catch (err) {
    console.error('DELETE /tokens/:id error:', err);
    res.status(500).json({ error: 'Failed to deactivate token' });
  }
});

// ---------------------------------------------------------------------------
// Appliance sync (authenticated via device token)
// ---------------------------------------------------------------------------

/**
 * POST /api/appliance/sync
 * Receive an inventory delta from a smart device (fridge, scale, etc.).
 *
 * Body: { action: 'add'|'remove'|'update', items: [{ name, quantity, unit, category, barcode }] }
 */
router.post('/sync', authenticateAppliance, async (req, res) => {
  try {
    const { action, items } = req.body;
    const userId = req.appliance.user_id;
    const tokenId = req.appliance.id;

    if (!action || !['add', 'remove', 'update'].includes(action)) {
      return res.status(400).json({ error: "action must be 'add', 'remove', or 'update'" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required and must not be empty' });
    }

    const results = [];
    let synced = 0;

    for (const item of items) {
      try {
        if (action === 'add') {
          const { data, error } = await supabase
            .from('pantry_items')
            .insert({
              user_id: userId,
              name: item.name,
              quantity: parseFloat(item.quantity) || 1,
              unit: item.unit || 'pcs',
              category: item.category || 'General',
              barcode: item.barcode || null,
              purchase_date: new Date().toISOString().split('T')[0],
              is_archived: false
            })
            .select('id, name')
            .single();

          if (error) throw error;
          results.push({ name: item.name, status: 'added', id: data.id });
          synced++;

        } else if (action === 'remove') {
          // Archive matching pantry items rather than hard-deleting
          let query = supabase
            .from('pantry_items')
            .update({ is_archived: true })
            .eq('user_id', userId)
            .eq('is_archived', false);

          if (item.barcode) {
            query = query.eq('barcode', item.barcode);
          } else {
            query = query.ilike('name', item.name);
          }

          const { data, error } = await query.select('id, name');

          if (error) throw error;
          const count = data ? data.length : 0;
          results.push({ name: item.name, status: 'removed', count });
          synced += count;

        } else if (action === 'update') {
          let query = supabase
            .from('pantry_items')
            .update({ quantity: parseFloat(item.quantity) || 1 })
            .eq('user_id', userId)
            .eq('is_archived', false);

          if (item.barcode) {
            query = query.eq('barcode', item.barcode);
          } else {
            query = query.ilike('name', item.name);
          }

          const { data, error } = await query.select('id, name, quantity');

          if (error) throw error;
          const count = data ? data.length : 0;
          results.push({ name: item.name, status: 'updated', count });
          synced += count;
        }
      } catch (itemErr) {
        console.error(`Sync item error (${item.name}):`, itemErr);
        results.push({ name: item.name, status: 'error', error: itemErr.message });
      }
    }

    // Log the sync action
    await supabase
      .from('appliance_sync_log')
      .insert({
        token_id: tokenId,
        action,
        item_data: items,
        synced_at: new Date().toISOString()
      });

    // Update last_sync_at on the token
    await supabase
      .from('appliance_tokens')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', tokenId);

    res.json({ synced, results });
  } catch (err) {
    console.error('POST /sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ---------------------------------------------------------------------------
// CV classification extension point
// ---------------------------------------------------------------------------

/**
 * POST /api/appliance/classify
 * Accept a base64 image and return a food classification.
 * Tries the Python CV model first; falls back to a stub response.
 */
router.post('/classify', authenticateJWT, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'base64 image is required' });
    }

    const scriptPath = path.join(__dirname, '../../../ml-models/classify_image.py');
    const pythonExe = process.env.PYTHON_PATH || 'python';

    // Attempt Python CV model
    try {
      const result = await new Promise((resolve, reject) => {
        const pythonProcess = spawn(pythonExe, [scriptPath]);

        let dataString = '';
        let errorString = '';

        pythonProcess.stdin.write(JSON.stringify({ image }));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorString += data.toString();
        });

        const timeout = setTimeout(() => {
          pythonProcess.kill();
          reject(new Error('CV model timed out'));
        }, 30000);

        pythonProcess.on('close', (code) => {
          clearTimeout(timeout);
          if (code !== 0) {
            reject(new Error(errorString || `Process exited with code ${code}`));
          } else {
            try {
              resolve(JSON.parse(dataString));
            } catch {
              reject(new Error('Invalid JSON from CV model'));
            }
          }
        });

        pythonProcess.on('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      return res.json(result);
    } catch (cvErr) {
      console.warn('CV model unavailable, returning fallback:', cvErr.message);
    }

    // Fallback when the CV model is not available
    res.json({
      category: 'Unknown',
      confidence: 0,
      suggested_name: 'Unknown item',
      note: 'CV model not loaded'
    });
  } catch (err) {
    console.error('POST /classify error:', err);
    res.status(500).json({ error: 'Classification failed' });
  }
});

module.exports = router;
