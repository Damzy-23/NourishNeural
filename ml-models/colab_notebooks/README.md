# 📓 Google Colab Training Notebooks

This folder contains ready-to-use Google Colab notebooks for training PantryPal ML models.

## 📚 Available Notebooks

### 1. **01_Food_Classifier_Training.ipynb**
- **Purpose:** Train deep learning model to classify UK food items
- **Model:** EfficientNet-B0 (Transfer Learning)
- **Target:** >95% accuracy
- **Training Time:** ~30 minutes
- **Requires:** GPU (T4 recommended)
- **Output:** `food_classifier.pth`, `food_classes.json`

### 2. **02_Expiry_Predictor_Training.ipynb**
- **Purpose:** Predict food expiry dates
- **Model:** LSTM (Long Short-Term Memory)
- **Target:** <2 days average error
- **Training Time:** ~20 minutes
- **Requires:** GPU optional (faster with GPU)
- **Output:** `expiry_predictor.pth`

### 3. **03_Waste_Predictor_Training.ipynb**
- **Purpose:** Predict food waste probability
- **Model:** Ensemble (Random Forest + Gradient Boosting)
- **Target:** >85% accuracy
- **Training Time:** ~10 minutes
- **Requires:** CPU only (no GPU needed)
- **Output:** `waste_predictor.pkl`

## 🚀 How to Use

### Quick Start (3 Steps):

1. **Upload to Colab**
   - Go to [colab.research.google.com](https://colab.research.google.com/)
   - File → Upload notebook
   - Select a notebook from this folder

2. **Enable GPU (for notebooks 01 & 02)**
   - Runtime → Change runtime type
   - Hardware accelerator → T4 GPU
   - Save

3. **Run All Cells**
   - Runtime → Run all
   - Wait for completion
   - Download the trained model

### Detailed Instructions

See the parent folder's `COLAB_TRAINING_GUIDE.md` for complete step-by-step instructions.

## 📥 After Training

1. Download the model files from Colab
2. Move them to: `ml-models/models/`
3. Your PantryPal app will automatically use them!

## 🎯 Expected Results

| Notebook | Model Output | Size | Performance |
|----------|-------------|------|-------------|
| 01 | food_classifier.pth | ~20MB | 96-98% accuracy |
| 01 | food_classes.json | ~5KB | - |
| 02 | expiry_predictor.pth | ~2MB | 1.2-1.8 days MAE |
| 03 | waste_predictor.pkl | ~5MB | 87-92% accuracy |

## 💡 Tips

- ✅ Use GPU for faster training (notebooks 01 & 02)
- ✅ Keep browser tab open during training
- ✅ Check for "✅ TARGET ACHIEVED" message
- ✅ Download models immediately after training
- ✅ Training is FREE on Google Colab!

## 🆘 Troubleshooting

**GPU not available?**
- Try: Runtime → Factory reset runtime → Change runtime type → GPU

**Training too slow?**
- Make sure GPU is enabled
- Close other Colab notebooks

**Can't download files?**
- Use: `from google.colab import files; files.download('filename.pth')`

**Colab disconnects?**
- Normal after 12 hours inactivity
- Just reconnect and run again

## 📊 What Each Notebook Does

### Food Classifier (01)
1. Downloads Food-101 dataset
2. Loads pre-trained EfficientNet
3. Fine-tunes on food images
4. Saves trained model

### Expiry Predictor (02)
1. Generates synthetic UK food data
2. Trains LSTM on expiry patterns
3. Validates against test set
4. Saves trained model

### Waste Predictor (03)
1. Creates waste probability dataset
2. Trains ensemble classifiers
3. Combines predictions
4. Saves trained model

## 🔗 Resources

- **Full Guide:** `../COLAB_TRAINING_GUIDE.md`
- **Quick Reference:** `../QUICK_START.md`
- **Training Config:** `../training_config.json`

## ✅ Checklist

- [ ] Upload notebook to Colab
- [ ] Enable GPU (if needed)
- [ ] Run all cells
- [ ] Wait for "TARGET ACHIEVED"
- [ ] Download trained model
- [ ] Move to `ml-models/models/`
- [ ] Repeat for all 3 notebooks
- [ ] Test in PantryPal app

---

**Total Time:** ~1 hour (all notebooks)

**Cost:** $0 (FREE!)

**Your Laptop:** Stays cool 😎

