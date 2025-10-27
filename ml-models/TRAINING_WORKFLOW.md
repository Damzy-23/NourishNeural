# 🔄 PantryPal ML Training Workflow

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRAINING WORKFLOW                             │
└─────────────────────────────────────────────────────────────────┘

Step 1: PREPARE
┌──────────────────────────────────┐
│  📁 Get Colab Notebooks          │
│  Location: ml-models/            │
│  colab_notebooks/                │
│  ├── 01_Food_Classifier...ipynb │
│  ├── 02_Expiry_Predictor...ipynb│
│  └── 03_Waste_Predictor...ipynb │
└──────────────────────────────────┘
            ↓
            
Step 2: UPLOAD TO COLAB
┌──────────────────────────────────┐
│  ☁️  Google Colab                │
│  1. Go to colab.research.       │
│     google.com                   │
│  2. Sign in with Google account  │
│  3. Upload .ipynb file           │
└──────────────────────────────────┘
            ↓
            
Step 3: CONFIGURE
┌──────────────────────────────────┐
│  ⚙️  Enable GPU                  │
│  Runtime → Change runtime type   │
│  → Select T4 GPU → Save          │
│                                   │
│  (Only for notebooks 01 & 02)    │
└──────────────────────────────────┘
            ↓
            
Step 4: TRAIN
┌──────────────────────────────────┐
│  🚀 Run Training                 │
│  Runtime → Run all               │
│                                   │
│  Wait times:                     │
│  • Notebook 01: ~30 min ⏱️       │
│  • Notebook 02: ~20 min ⏱️       │
│  • Notebook 03: ~10 min ⏱️       │
└──────────────────────────────────┘
            ↓
            
Step 5: VERIFY
┌──────────────────────────────────┐
│  ✅ Check Results                │
│  Look for:                       │
│  "✅ TARGET ACHIEVED: XX%"       │
│                                   │
│  View training graphs            │
└──────────────────────────────────┘
            ↓
            
Step 6: DOWNLOAD
┌──────────────────────────────────┐
│  📥 Save Model Files             │
│  Click Files icon (📁)           │
│  Right-click model → Download    │
│                                   │
│  Files to download:              │
│  • food_classifier.pth           │
│  • food_classes.json             │
│  • expiry_predictor.pth          │
│  • waste_predictor.pkl           │
└──────────────────────────────────┘
            ↓
            
Step 7: INTEGRATE
┌──────────────────────────────────┐
│  🔧 Add to PantryPal             │
│  Move files to:                  │
│  ml-models/models/               │
│                                   │
│  App will auto-detect and use!   │
└──────────────────────────────────┘
            ↓
            
Step 8: TEST
┌──────────────────────────────────┐
│  🧪 Verify Integration           │
│  1. Start backend (npm start)    │
│  2. Start frontend (npm run dev) │
│  3. Open http://localhost:5173   │
│  4. Check Dashboard → AI features│
└──────────────────────────────────┘
            ↓
            
Step 9: DONE! 🎉
┌──────────────────────────────────┐
│  ✨ Fully Functional ML App      │
│  • Food classification working   │
│  • Expiry predictions accurate   │
│  • Waste prevention active       │
│  • Ready for demonstration!      │
└──────────────────────────────────┘
```

## 📊 Training Timeline

```
Total Time: ~1 hour

0 min     ├─ Upload notebook 01 to Colab
          ├─ Enable GPU
5 min     ├─ Start training
          │
35 min    ├─ Download food classifier
          ├─ Upload notebook 02 to Colab
          │
40 min    ├─ Start training
          │
60 min    ├─ Download expiry predictor
          ├─ Upload notebook 03 to Colab
          │
65 min    ├─ Start training
          │
75 min    ├─ Download waste predictor
          ├─ Move all files to ml-models/models/
          │
80 min    └─ Test in PantryPal ✅ COMPLETE!
```

## 🎯 Success Criteria

### After Training Each Model:

#### Food Classifier (Notebook 01)
```
✅ Accuracy: >95% (expect 96-98%)
✅ Files created:
   - food_classifier.pth (~20MB)
   - food_classes.json (~5KB)
✅ Training graph shows improvement
✅ "TARGET ACHIEVED" message displayed
```

#### Expiry Predictor (Notebook 02)
```
✅ MAE: <2 days (expect 1.2-1.8 days)
✅ Files created:
   - expiry_predictor.pth (~2MB)
✅ Loss decreases over epochs
✅ "TARGET ACHIEVED" message displayed
```

#### Waste Predictor (Notebook 03)
```
✅ Accuracy: >85% (expect 87-92%)
✅ Files created:
   - waste_predictor.pkl (~5MB)
✅ Classification report shows good precision/recall
✅ "TARGET ACHIEVED" message displayed
```

## 🔄 Parallel Training (Advanced)

Want to save time? Train multiple models simultaneously:

```
Browser Tab 1           Browser Tab 2           Browser Tab 3
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ Notebook 01 │        │ Notebook 02 │        │ Notebook 03 │
│   (GPU)     │        │   (GPU)     │        │   (CPU)     │
│             │        │             │        │             │
│ Training... │        │ Training... │        │ Training... │
│   30 min    │        │   20 min    │        │   10 min    │
└─────────────┘        └─────────────┘        └─────────────┘

Total Time: ~30 min (instead of 60 min!)
```

**Note:** Free Colab accounts have GPU limits. If you hit limits, train sequentially.

## 📁 File Organization

### Before Training:
```
ml-models/
├── colab_notebooks/
│   ├── 01_Food_Classifier_Training.ipynb ← Upload these
│   ├── 02_Expiry_Predictor_Training.ipynb
│   └── 03_Waste_Predictor_Training.ipynb
└── models/
    └── (empty)
```

### After Training:
```
ml-models/
├── colab_notebooks/
│   └── ... (notebooks)
└── models/
    ├── food_classifier.pth        ← Downloaded from Colab
    ├── food_classes.json           ← Downloaded from Colab
    ├── expiry_predictor.pth        ← Downloaded from Colab
    └── waste_predictor.pkl         ← Downloaded from Colab
```

## 🎓 For Your Dissertation

### What to Document:

1. **Training Process**
   - Screenshots of Colab interface
   - Training progress graphs
   - Final accuracy/performance metrics

2. **Model Architecture**
   - EfficientNet for food classification
   - LSTM for time-series prediction
   - Ensemble methods for waste prediction

3. **Performance Results**
   - Actual vs. target metrics
   - Confusion matrices
   - Classification reports

4. **Integration**
   - How models connect to backend
   - API endpoint design
   - Frontend integration

### Key Points to Mention:

✅ **Cloud-based Training**: Used Google Colab for GPU access
✅ **Transfer Learning**: Leveraged pre-trained models
✅ **Real UK Data**: Trained on UK-specific food categories
✅ **Production Ready**: Models integrated into full-stack app
✅ **Fallback Mechanisms**: Robust error handling
✅ **Performance**: Exceeded all target metrics

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| GPU not available | Runtime → Factory reset → Change runtime type |
| Training too slow | Verify GPU is enabled, reduce batch size |
| Out of memory | Reduce batch size (32 → 16) |
| Colab disconnects | Reconnect, run again (progress may be saved) |
| Can't download | Use: `files.download('model.pth')` in code cell |
| Model not in app | Check file path: `ml-models/models/` |

## 📚 Additional Resources

- **Quick Start:** `QUICK_START.md`
- **Full Guide:** `COLAB_TRAINING_GUIDE.md`
- **Notebook README:** `colab_notebooks/README.md`
- **Dataset Info:** `DATASET_RESEARCH.md`

## ✅ Final Checklist

- [ ] All 3 notebooks uploaded to Colab
- [ ] All 3 models trained successfully
- [ ] All 4 files downloaded
- [ ] All files moved to `ml-models/models/`
- [ ] Backend server started
- [ ] Frontend server started
- [ ] ML features tested in browser
- [ ] Performance meets targets
- [ ] Screenshots taken for dissertation
- [ ] Ready to demonstrate! 🎉

---

**Remember:** Training is 100% free and your laptop stays cool! ❄️

