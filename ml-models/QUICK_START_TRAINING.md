# PantryPal Model Training - Quick Start Guide

## Overview
This guide will help you train all PantryPal models to achieve the performance targets:
- **Food Recognition**: >95% accuracy on common UK foods
- **Expiry Prediction**: <2 days average error for perishables  
- **Waste Prediction**: >85% accuracy in identifying waste-prone items
- **AI Chat**: >80% user satisfaction rate

## Prerequisites

### 1. Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Or install minimal dependencies first
pip install -r requirements-minimal.txt
```

### 2. Verify Setup
```bash
# Run setup script
python setup.py

# Check if data directories exist
ls -la data/
```

## Quick Training (Recommended)

### Option 1: Run Full Pipeline
```bash
# Run the complete training pipeline
python training_pipeline.py
```

This will:
1. ✅ Collect UK food data from supermarkets
2. ✅ Train food recognition model
3. ✅ Train expiry prediction model  
4. ✅ Train waste prediction model
5. ✅ Generate AI chat training data
6. ✅ Evaluate all models against targets

### Option 2: Individual Model Training

#### Food Recognition Model
```bash
python training/food_classifier_trainer.py
```

#### AI Chat Assistant
```bash
python training/ai_chat_trainer.py
```

#### Data Collection
```bash
python data_collection/uk_food_scraper.py
```

## Training Configuration

### Edit Configuration
Modify `training_config.json` to adjust:
- Target accuracy thresholds
- Training parameters (epochs, batch size, learning rate)
- Data collection settings
- Model architectures

### Key Settings
```json
{
  "food_classifier": {
    "target_accuracy": 95.0,
    "epochs": 100,
    "batch_size": 32
  },
  "expiry_predictor": {
    "target_mae": 2.0,
    "epochs": 50
  },
  "waste_predictor": {
    "target_accuracy": 85.0,
    "n_estimators": 1000
  },
  "ai_chat": {
    "target_satisfaction": 80.0,
    "num_training_examples": 1000
  }
}
```

## Expected Training Time

| Model | Time Estimate | Hardware |
|-------|---------------|----------|
| Data Collection | 30-60 minutes | CPU |
| Food Recognition | 2-4 hours | GPU recommended |
| Expiry Prediction | 1-2 hours | CPU/GPU |
| Waste Prediction | 30-60 minutes | CPU |
| AI Chat Training | 15-30 minutes | CPU |

**Total**: 4-8 hours (depending on hardware)

## Monitoring Training Progress

### Logs
Training progress is logged to:
- `training.log` - Detailed training logs
- Console output - Real-time progress

### Checkpoints
Models are saved to `models/` directory:
- `best_model_epoch_X.pth` - Best performing model
- `final_food_classifier.pth` - Final trained model

### Results
Results saved to `results/` directory:
- `training_results_TIMESTAMP.json` - Detailed results
- `performance_summary_TIMESTAMP.txt` - Human-readable summary

## Performance Targets

### Food Recognition Model
- **Target**: >95% accuracy on UK food categories
- **Architecture**: EfficientNet-B4 with multi-task learning
- **Features**: Storage prediction, supermarket prediction, quality assessment

### Expiry Prediction Model  
- **Target**: <2 days mean absolute error
- **Architecture**: Transformer + LSTM hybrid
- **Features**: Food type, storage conditions, environmental factors

### Waste Prediction Model
- **Target**: >85% accuracy in waste prediction
- **Architecture**: XGBoost ensemble
- **Features**: User behavior, household size, meal planning

### AI Chat Assistant
- **Target**: >80% user satisfaction
- **Training Data**: UK-specific food knowledge, supermarket info
- **Features**: Recipe suggestions, nutrition advice, shopping tips

## Troubleshooting

### Common Issues

#### 1. "ModuleNotFoundError"
```bash
# Ensure you're in the ml-models directory
cd ml-models

# Add src to Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src"
```

#### 2. "CUDA out of memory"
```bash
# Reduce batch size in training_config.json
"batch_size": 16  # Instead of 32

# Or disable GPU
export CUDA_VISIBLE_DEVICES=""
```

#### 3. "Data not found"
```bash
# Run data collection first
python data_collection/uk_food_scraper.py
```

#### 4. "Permission denied"
```bash
# Make scripts executable
chmod +x training_pipeline.py
chmod +x data_collection/uk_food_scraper.py
```

### Performance Issues

#### Slow Training
- Reduce batch size
- Use fewer epochs for testing
- Enable mixed precision training
- Use smaller model architectures

#### Low Accuracy
- Increase training data
- Adjust learning rate
- Enable data augmentation
- Try different architectures

## Advanced Training

### Custom Datasets
1. Add your data to `data/raw/`
2. Update data loading in training scripts
3. Adjust model configurations

### Hyperparameter Tuning
1. Edit `training_config.json`
2. Run training pipeline
3. Compare results in `results/` directory

### Model Architecture Changes
1. Modify model classes in `src/models/`
2. Update training scripts
3. Adjust configuration parameters

## Integration with PantryPal

After training, models are automatically integrated into PantryPal:

1. **Backend Integration**: Models are loaded in `server/src/services/mlService.js`
2. **API Endpoints**: Available at `/api/ml/*`
3. **Frontend Integration**: Used by smart components in `client/src/components/`

### Test Integration
```bash
# Start PantryPal servers
cd ../server && npm start &
cd ../client && npm run dev &

# Test ML endpoints
curl http://localhost:3001/api/ml/health
```

## Next Steps

After successful training:

1. **Deploy Models**: Move models to production environment
2. **Monitor Performance**: Set up monitoring and logging
3. **Continuous Learning**: Implement user feedback loops
4. **Model Updates**: Regular retraining with new data

## Support

For issues or questions:
1. Check logs in `training.log`
2. Review configuration in `training_config.json`
3. Verify data in `data/training/`
4. Check model outputs in `results/`

Happy Training! 🚀
