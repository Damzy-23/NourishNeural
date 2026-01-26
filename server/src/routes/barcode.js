const express = require('express');
const router = express.Router();
const barcodeService = require('../services/barcodeService');

// In-memory storage for barcode scan history (replace with database in production)
const scanHistory = new Map(); // userId -> Array of scans

/**
 * @route POST /api/barcode/validate
 * @desc Validate barcode format and check digit
 * @access Public
 */
router.post('/validate', (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    const validation = barcodeService.validateBarcode(barcode);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Barcode validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate barcode'
    });
  }
});

/**
 * @route POST /api/barcode/lookup
 * @desc Look up product by barcode via Open Food Facts
 * @access Public
 */
router.post('/lookup', async (req, res) => {
  try {
    const { barcode, validateFirst = true } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    // Optionally validate barcode format first
    if (validateFirst) {
      const validation = barcodeService.validateBarcode(barcode);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.message || 'Invalid barcode format',
          data: { validation }
        });
      }
    }

    // Look up product
    const result = await barcodeService.lookupBarcode(barcode);

    if (result.found) {
      // Add estimated price and expiry if not provided
      const product = result.product;
      if (!product.estimatedPrice) {
        product.estimatedPrice = barcodeService.estimatePrice(product.category);
      }
      if (!product.estimatedExpiryDays) {
        product.estimatedExpiryDays = barcodeService.estimateExpiryDays(product.category);
      }

      res.json({
        success: true,
        data: {
          found: true,
          product
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          found: false,
          error: result.error
        }
      });
    }
  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to look up barcode'
    });
  }
});

/**
 * @route GET /api/barcode/history
 * @desc Get user's barcode scan history
 * @access Private (requires auth header)
 */
router.get('/history', (req, res) => {
  try {
    // Get user ID from auth header (simplified - in production use proper auth middleware)
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const history = scanHistory.get(userId) || [];

    // Sort by most recent first
    const sortedHistory = [...history].sort((a, b) =>
      new Date(b.scannedAt) - new Date(a.scannedAt)
    );

    res.json({
      success: true,
      data: {
        scans: sortedHistory,
        total: sortedHistory.length
      }
    });
  } catch (error) {
    console.error('Error fetching scan history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scan history'
    });
  }
});

/**
 * @route POST /api/barcode/save
 * @desc Save barcode scan to history
 * @access Private (requires auth header)
 */
router.post('/save', (req, res) => {
  try {
    const { barcode, productName, productData, addedToPantry = false } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    // Create scan record
    const scan = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      barcode,
      productName: productName || 'Unknown Product',
      productData: productData || null,
      scannedAt: new Date().toISOString(),
      addedToPantry
    };

    // Get or create user's history
    if (!scanHistory.has(userId)) {
      scanHistory.set(userId, []);
    }

    const userHistory = scanHistory.get(userId);

    // Check for duplicate (same barcode scanned in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDuplicate = userHistory.find(s =>
      s.barcode === barcode && new Date(s.scannedAt) > fiveMinutesAgo
    );

    if (recentDuplicate) {
      return res.json({
        success: true,
        data: {
          scan: recentDuplicate,
          isDuplicate: true,
          message: 'This barcode was scanned recently'
        }
      });
    }

    // Add to history (keep last 100 scans)
    userHistory.unshift(scan);
    if (userHistory.length > 100) {
      userHistory.pop();
    }

    res.json({
      success: true,
      data: {
        scan,
        isDuplicate: false
      }
    });
  } catch (error) {
    console.error('Error saving scan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save scan'
    });
  }
});

/**
 * @route DELETE /api/barcode/history/:scanId
 * @desc Delete a scan from history
 * @access Private
 */
router.delete('/history/:scanId', (req, res) => {
  try {
    const { scanId } = req.params;

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    if (!scanHistory.has(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    const userHistory = scanHistory.get(userId);
    const index = userHistory.findIndex(s => s.id === scanId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    userHistory.splice(index, 1);

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scan'
    });
  }
});

/**
 * @route POST /api/barcode/check-duplicate
 * @desc Check if barcode already exists in user's pantry
 * @access Private
 */
router.post('/check-duplicate', (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    // Check scan history for items added to pantry with this barcode
    const userHistory = scanHistory.get(userId) || [];
    const existingItem = userHistory.find(s =>
      s.barcode === barcode && s.addedToPantry
    );

    res.json({
      success: true,
      data: {
        exists: !!existingItem,
        existingItem: existingItem || null
      }
    });
  } catch (error) {
    console.error('Error checking duplicate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check for duplicate'
    });
  }
});

/**
 * @route GET /api/barcode/health
 * @desc Check barcode service health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    // Test validation
    const validation = barcodeService.validateBarcode('5901234123457');

    // Test lookup with a known product (Nutella)
    const lookup = await barcodeService.lookupBarcode('3017620422003');

    res.json({
      success: true,
      message: 'Barcode service is healthy',
      data: {
        status: 'operational',
        validation: {
          working: validation.valid,
          format: validation.format
        },
        lookup: {
          working: lookup.found,
          apiResponsive: !lookup.error?.includes('Failed')
        }
      }
    });
  } catch (error) {
    console.error('Barcode service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Barcode service is not responding properly',
      error: error.message
    });
  }
});

module.exports = router;
