const express = require('express');
const router = express.Router();
const mlService = require('../services/mlService');

/**
 * @route POST /api/ml/predict-expiry
 * @desc Predict food expiry date
 * @access Private
 */
router.post('/predict-expiry', async (req, res) => {
  try {
    const { foodItem } = req.body;

    if (!foodItem) {
      return res.status(400).json({
        success: false,
        message: 'Food item data is required'
      });
    }

    const prediction = await mlService.predictExpiry(foodItem);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error predicting expiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict expiry date'
    });
  }
});

/**
 * @route POST /api/ml/predict-waste
 * @desc Predict food waste probability
 * @access Private
 */
router.post('/predict-waste', async (req, res) => {
  try {
    const { userHistory, foodItem } = req.body;

    if (!foodItem) {
      return res.status(400).json({
        success: false,
        message: 'Food item data is required'
      });
    }

    const prediction = await mlService.predictWaste(userHistory || [], foodItem);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error predicting waste:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to predict waste probability'
    });
  }
});

/**
 * @route POST /api/ml/classify-food
 * @desc Classify food item into category
 * @access Private
 */
router.post('/classify-food', async (req, res) => {
  try {
    const { foodName } = req.body;

    if (!foodName) {
      return res.status(400).json({
        success: false,
        message: 'Food name is required'
      });
    }

    const classification = await mlService.classifyFood(foodName);

    res.json({
      success: true,
      data: classification
    });
  } catch (error) {
    console.error('Error classifying food:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify food item'
    });
  }
});

/**
 * @route GET /api/ml/health
 * @desc Check ML service health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    // Test with a simple prediction
    const testItem = {
      category: 'Dairy',
      storage_type: 'fridge',
      purchase_date: new Date().toISOString()
    };

    const prediction = await mlService.predictExpiry(testItem);

    res.json({
      success: true,
      message: 'ML service is healthy',
      data: {
        status: 'operational',
        test_prediction: prediction
      }
    });
  } catch (error) {
    console.error('ML service health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'ML service is not responding properly',
      error: error.message
    });
  }
});

module.exports = router;
