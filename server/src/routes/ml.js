const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mlService = require('../services/mlService');

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `food_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  }
});

/**
 * @route POST /api/ml/classify-image
 * @desc Classify food from an uploaded image using the trained MobileNetV3 model
 * @access Public
 */
router.post('/classify-image', upload.single('file'), async (req, res) => {
  let imagePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    imagePath = req.file.path;
    const mlModelsDir = path.join(__dirname, '../../../ml-models');
    const scriptPath = path.join(mlModelsDir, 'classify_image.py');

    // Check if model exists
    const modelPath = path.join(mlModelsDir, 'models', 'best_food_classifier.pth');
    if (!fs.existsSync(modelPath)) {
      return res.status(503).json({
        success: false,
        message: 'Food recognition model not available. Train the model first.'
      });
    }

    // Find Python — prefer PYTHON_PATH env var, then venv, then system
    const pythonCmd = process.env.PYTHON_PATH || (() => {
      const isWin = process.platform === 'win32';
      const venvPython = path.join(mlModelsDir, '..', '.venv', isWin ? 'Scripts/python.exe' : 'bin/python');
      return fs.existsSync(venvPython) ? venvPython : 'python';
    })();

    const result = await new Promise((resolve, reject) => {
      const proc = spawn(pythonCmd, [scriptPath, imagePath], {
        cwd: mlModelsDir,
        timeout: 60000
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => { stdout += data.toString(); });
      proc.stderr.on('data', (data) => { stderr += data.toString(); });

      proc.on('close', (code) => {
        if (code === 0 && stdout.trim()) {
          try {
            resolve(JSON.parse(stdout.trim()));
          } catch (e) {
            reject(new Error(`Invalid JSON from classifier: ${stdout}`));
          }
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      proc.on('error', reject);
    });

    if (result.error) {
      throw new Error(result.error);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error classifying image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to classify image',
      error: error.message
    });
  } finally {
    // Clean up uploaded file
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlink(imagePath, () => {});
    }
  }
});

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
 * @desc Classify food item by name (keyword-based fallback)
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
    const testItem = {
      category: 'Dairy',
      storage_type: 'fridge',
      purchase_date: new Date().toISOString()
    };

    const prediction = await mlService.predictExpiry(testItem);
    const mlModelsDir = path.join(__dirname, '../../../ml-models');
    const modelExists = fs.existsSync(path.join(mlModelsDir, 'models', 'best_food_classifier.pth'));

    res.json({
      success: true,
      message: 'ML service is healthy',
      data: {
        status: 'operational',
        food_recognition_model: modelExists ? 'available' : 'not_trained',
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
