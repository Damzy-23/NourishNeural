const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateJWT } = require('../middleware/supabaseAuth');
const crypto = require('crypto');

// All routes require authentication
router.use(authenticateJWT);

/**
 * Helper: get user's household membership
 */
async function getUserMembership(userId) {
  const { data, error } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching membership:', error);
  }
  return data;
}

// ─── CREATE HOUSEHOLD ────────────────────────────────
// POST /api/households
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Household name is required' });
    }

    // Check if user already belongs to a household
    const existing = await getUserMembership(userId);
    if (existing) {
      return res.status(409).json({ error: 'You already belong to a household. Leave it first to create a new one.' });
    }

    // Create household
    const inviteCode = crypto.randomBytes(6).toString('hex');
    const { data: household, error: createError } = await supabase
      .from('households')
      .insert({
        name: name.trim(),
        created_by: userId,
        invite_code: inviteCode
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating household:', createError);
      return res.status(500).json({ error: 'Failed to create household' });
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) {
      // Rollback household creation
      await supabase.from('households').delete().eq('id', household.id);
      console.error('Error adding admin member:', memberError);
      return res.status(500).json({ error: 'Failed to create household' });
    }

    res.status(201).json({
      message: 'Household created successfully',
      household: {
        id: household.id,
        name: household.name,
        inviteCode: household.invite_code,
        createdAt: household.created_at
      }
    });
  } catch (error) {
    console.error('Create household error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET MY HOUSEHOLD ────────────────────────────────
// GET /api/households/mine
router.get('/mine', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's membership
    const membership = await getUserMembership(userId);
    if (!membership) {
      return res.json({ household: null });
    }

    // Get household details
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('*')
      .eq('id', membership.household_id)
      .single();

    if (householdError) {
      console.error('Error fetching household:', householdError);
      return res.status(500).json({ error: 'Failed to fetch household' });
    }

    // Get all members with profile info
    const { data: members, error: membersError } = await supabase
      .from('household_members')
      .select('user_id, role, joined_at')
      .eq('household_id', membership.household_id);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return res.status(500).json({ error: 'Failed to fetch household members' });
    }

    // Get profile info for each member
    const memberProfiles = await Promise.all(
      members.map(async (member) => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', member.user_id)
          .single();

        return {
          userId: member.user_id,
          firstName: profile?.first_name || 'Unknown',
          lastName: profile?.last_name || 'User',
          avatarUrl: profile?.avatar_url || null,
          role: member.role,
          joinedAt: member.joined_at
        };
      })
    );

    res.json({
      household: {
        id: household.id,
        name: household.name,
        inviteCode: household.invite_code,
        createdBy: household.created_by,
        createdAt: household.created_at,
        role: membership.role,
        members: memberProfiles
      }
    });
  } catch (error) {
    console.error('Get household error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── JOIN HOUSEHOLD ──────────────────────────────────
// POST /api/households/join
router.post('/join', async (req, res) => {
  try {
    const userId = req.user.id;
    const { inviteCode } = req.body;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    // Check if user already belongs to a household
    const existing = await getUserMembership(userId);
    if (existing) {
      return res.status(409).json({ error: 'You already belong to a household. Leave it first to join another.' });
    }

    // Find household by invite code
    const { data: household, error: findError } = await supabase
      .from('households')
      .select('id, name')
      .eq('invite_code', inviteCode.trim())
      .single();

    if (findError || !household) {
      return res.status(404).json({ error: 'Invalid invite code. Please check and try again.' });
    }

    // Add user as member
    const { error: joinError } = await supabase
      .from('household_members')
      .insert({
        household_id: household.id,
        user_id: userId,
        role: 'member'
      });

    if (joinError) {
      console.error('Error joining household:', joinError);
      if (joinError.code === '23505') {
        return res.status(409).json({ error: 'You are already a member of this household' });
      }
      return res.status(500).json({ error: 'Failed to join household' });
    }

    res.json({
      message: `Successfully joined "${household.name}"`,
      householdId: household.id,
      householdName: household.name
    });
  } catch (error) {
    console.error('Join household error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── UPDATE HOUSEHOLD ────────────────────────────────
// PUT /api/households
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Household name is required' });
    }

    const membership = await getUserMembership(userId);
    if (!membership) {
      return res.status(404).json({ error: 'No household found' });
    }
    if (membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update the household' });
    }

    const { error } = await supabase
      .from('households')
      .update({ name: name.trim() })
      .eq('id', membership.household_id);

    if (error) {
      console.error('Error updating household:', error);
      return res.status(500).json({ error: 'Failed to update household' });
    }

    res.json({ message: 'Household updated successfully' });
  } catch (error) {
    console.error('Update household error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── REGENERATE INVITE CODE ──────────────────────────
// POST /api/households/regenerate-invite
router.post('/regenerate-invite', async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await getUserMembership(userId);
    if (!membership) {
      return res.status(404).json({ error: 'No household found' });
    }
    if (membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can regenerate invite codes' });
    }

    const newCode = crypto.randomBytes(6).toString('hex');
    const { error } = await supabase
      .from('households')
      .update({ invite_code: newCode })
      .eq('id', membership.household_id);

    if (error) {
      console.error('Error regenerating invite code:', error);
      return res.status(500).json({ error: 'Failed to regenerate invite code' });
    }

    res.json({ message: 'Invite code regenerated', inviteCode: newCode });
  } catch (error) {
    console.error('Regenerate invite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── REMOVE MEMBER / LEAVE ───────────────────────────
// DELETE /api/households/members/:userId
router.delete('/members/:userId', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    const membership = await getUserMembership(currentUserId);
    if (!membership) {
      return res.status(404).json({ error: 'No household found' });
    }

    const isSelf = currentUserId === targetUserId;
    const isAdmin = membership.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Only admins can remove other members' });
    }

    // If admin is leaving, check if they're the last admin
    if (isSelf && isAdmin) {
      const { data: otherAdmins } = await supabase
        .from('household_members')
        .select('user_id')
        .eq('household_id', membership.household_id)
        .eq('role', 'admin')
        .neq('user_id', currentUserId);

      if (!otherAdmins || otherAdmins.length === 0) {
        // Check if there are other members at all
        const { data: otherMembers } = await supabase
          .from('household_members')
          .select('user_id')
          .eq('household_id', membership.household_id)
          .neq('user_id', currentUserId);

        if (otherMembers && otherMembers.length > 0) {
          return res.status(400).json({
            error: 'You are the only admin. Promote another member to admin before leaving, or delete the household.'
          });
        }

        // Last member — delete the entire household (cascade deletes members)
        await supabase.from('households').delete().eq('id', membership.household_id);
        return res.json({ message: 'Household deleted (you were the last member)' });
      }
    }

    // Remove the member
    const { error } = await supabase
      .from('household_members')
      .delete()
      .eq('household_id', membership.household_id)
      .eq('user_id', targetUserId);

    if (error) {
      console.error('Error removing member:', error);
      return res.status(500).json({ error: 'Failed to remove member' });
    }

    res.json({
      message: isSelf ? 'You have left the household' : 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE HOUSEHOLD ────────────────────────────────
// DELETE /api/households
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const membership = await getUserMembership(userId);
    if (!membership) {
      return res.status(404).json({ error: 'No household found' });
    }
    if (membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete the household' });
    }

    // Clear household_id from all shared items first (set to null = personal)
    await Promise.all([
      supabase.from('pantry_items').update({ household_id: null }).eq('household_id', membership.household_id),
      supabase.from('grocery_lists').update({ household_id: null }).eq('household_id', membership.household_id),
      supabase.from('meal_plans').update({ household_id: null }).eq('household_id', membership.household_id),
    ]);

    // Delete household (cascades to household_members)
    const { error } = await supabase
      .from('households')
      .delete()
      .eq('id', membership.household_id);

    if (error) {
      console.error('Error deleting household:', error);
      return res.status(500).json({ error: 'Failed to delete household' });
    }

    res.json({ message: 'Household deleted successfully' });
  } catch (error) {
    console.error('Delete household error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── MOVE ITEM BETWEEN PERSONAL / HOUSEHOLD ─────────
// PATCH /api/households/items/:id/move
router.patch('/items/:id/move', async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.id;
    const { target, scope, table = 'pantry_items' } = req.body;
    const finalTarget = target || scope;

    const allowedTables = ['pantry_items', 'grocery_lists', 'meal_plans'];
    if (!allowedTables.includes(table)) {
      return res.status(400).json({ error: 'Invalid table' });
    }
    if (!['personal', 'household'].includes(finalTarget)) {
      return res.status(400).json({ error: 'Target must be "personal" or "household"' });
    }

    // Verify the item belongs to this user
    const { data: item, error: itemError } = await supabase
      .from(table)
      .select('id, user_id')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: 'Item not found or not owned by you' });
    }

    let newHouseholdId = null;

    if (finalTarget === 'household') {
      const membership = await getUserMembership(userId);
      if (!membership) {
        return res.status(400).json({ error: 'You are not in a household' });
      }
      newHouseholdId = membership.household_id;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update({ household_id: newHouseholdId })
      .eq('id', itemId);

    if (updateError) {
      console.error('Error moving item:', updateError);
      return res.status(500).json({ error: 'Failed to move item' });
    }

    res.json({
      message: finalTarget === 'household'
        ? 'Item moved to household'
        : 'Item moved to personal'
    });
  } catch (error) {
    console.error('Move item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
