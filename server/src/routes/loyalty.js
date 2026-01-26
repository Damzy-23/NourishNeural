const express = require('express');
const router = express.Router();
const loyaltyService = require('../services/loyaltyService');

/**
 * @route GET /api/loyalty/programs
 * @desc Get available loyalty programs
 * @access Public
 */
router.get('/programs', (req, res) => {
  try {
    const programs = loyaltyService.getPrograms();

    res.json({
      success: true,
      data: {
        programs,
        total: programs.length
      }
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty programs'
    });
  }
});

/**
 * @route GET /api/loyalty/programs/:id
 * @desc Get a specific loyalty program
 * @access Public
 */
router.get('/programs/:id', (req, res) => {
  try {
    const { id } = req.params;
    const program = loyaltyService.getProgramById(id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Loyalty program not found'
      });
    }

    res.json({
      success: true,
      data: program
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty program'
    });
  }
});

/**
 * @route GET /api/loyalty/accounts
 * @desc Get user's loyalty accounts
 * @access Private
 */
router.get('/accounts', (req, res) => {
  try {
    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const accounts = loyaltyService.getAccounts(userId);

    res.json({
      success: true,
      data: {
        accounts,
        total: accounts.length
      }
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty accounts'
    });
  }
});

/**
 * @route POST /api/loyalty/accounts
 * @desc Add a loyalty account
 * @access Private
 */
router.post('/accounts', (req, res) => {
  try {
    const { programId, cardNumber } = req.body;

    if (!programId || !cardNumber) {
      return res.status(400).json({
        success: false,
        message: 'Program ID and card number are required'
      });
    }

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const result = loyaltyService.addAccount(userId, programId, cardNumber);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.status(201).json({
      success: true,
      message: 'Loyalty card added successfully',
      data: result.account
    });
  } catch (error) {
    console.error('Error adding account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add loyalty account'
    });
  }
});

/**
 * @route PUT /api/loyalty/accounts/:id
 * @desc Update a loyalty account
 * @access Private
 */
router.put('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const result = loyaltyService.updateAccount(userId, id, updates);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Loyalty card updated successfully',
      data: result.account
    });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loyalty account'
    });
  }
});

/**
 * @route DELETE /api/loyalty/accounts/:id
 * @desc Remove a loyalty account
 * @access Private
 */
router.delete('/accounts/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const result = loyaltyService.removeAccount(userId, id);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error
      });
    }

    res.json({
      success: true,
      message: 'Loyalty card removed successfully'
    });
  } catch (error) {
    console.error('Error removing account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove loyalty account'
    });
  }
});

/**
 * @route POST /api/loyalty/validate
 * @desc Validate a card number format
 * @access Public
 */
router.post('/validate', (req, res) => {
  try {
    const { programId, cardNumber } = req.body;

    if (!programId || !cardNumber) {
      return res.status(400).json({
        success: false,
        message: 'Program ID and card number are required'
      });
    }

    const validation = loyaltyService.validateCardNumber(programId, cardNumber);

    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating card:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate card number'
    });
  }
});

/**
 * @route GET /api/loyalty/store/:storeName
 * @desc Get user's loyalty card for a specific store
 * @access Private
 */
router.get('/store/:storeName', (req, res) => {
  try {
    const { storeName } = req.params;

    // Get user ID from auth header
    const authHeader = req.headers.authorization;
    const userId = authHeader ? authHeader.replace('Bearer ', '').substring(0, 20) : 'anonymous';

    const account = loyaltyService.getAccountByStore(userId, storeName);

    res.json({
      success: true,
      data: {
        hasCard: !!account,
        account
      }
    });
  } catch (error) {
    console.error('Error fetching store account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loyalty account for store'
    });
  }
});

/**
 * @route GET /api/loyalty/health
 * @desc Check loyalty service health
 * @access Public
 */
router.get('/health', (req, res) => {
  try {
    const programs = loyaltyService.getPrograms();

    res.json({
      success: true,
      message: 'Loyalty service is healthy',
      data: {
        status: 'operational',
        programsAvailable: programs.length
      }
    });
  } catch (error) {
    console.error('Loyalty service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Loyalty service is not responding properly',
      error: error.message
    });
  }
});

module.exports = router;
