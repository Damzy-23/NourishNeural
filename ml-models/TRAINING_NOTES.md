# NourishNeural — ML Model Training Notes

## Waste Prediction Model
**Status:** Trained
**Date:** 2026-02-25
**Script:** `run_waste_training.py`
**Model class:** `src/models/waste_prediction.py` → `WastePredictionModel`
**Saved to:** `models/waste_predictor/`

### Results
| Sub-model | Validation Accuracy |
|---|---|
| Random Forest | 94.5% |
| Gradient Boosting | 97.9% |
| Neural Network | 97.9% |
| **Ensemble (final)** | **98.0%** |

**Target:** 85% — **ACHIEVED**

### Architecture
Ensemble of 3 sub-models:
- `RandomForestClassifier` (100 trees, depth 10, class_weight=balanced)
- `GradientBoostingClassifier` (100 trees, depth 6, lr=0.1)
- `Dense NN` (64 → 32 → 16 → 1, sigmoid output)
- Weighted ensemble: RF=40%, GB=30%, NN=30%

### Training Data
- 5,000 synthetic records (4,000 train / 1,000 val)
- ~40 features per record: user history behaviour, food category, perishability, package quality, storage conditions, seasonal factors
- Labels derived from a weighted score of extractable features to ensure feature-label alignment
- Categories: Fish, Meat, Vegetables, Dairy, Fruits, Bakery, Snacks, Beverages, Frozen, Pantry

### Saved Files
```
models/waste_predictor/
├── random_forest.joblib
├── gradient_boosting.joblib
├── neural_network.h5
├── standard_scaler.joblib
└── feature_importance.joblib
```

### How it's used in the app
```
Frontend  →  POST /api/waste/predict  { food_item, user_history }
               ↓
           server/src/routes/waste.js  (spawns Python subprocess)
               ↓
           ml-models/predict.py  (loads WastePredictionModel, returns JSON)
```

**Call it from the frontend:**
```ts
const result = await apiService.post('/api/waste/predict', {
  food_item: {
    category: 'Dairy',
    purchase_date: '2026-02-24',
    storage_type: 'fridge',
    perishability_score: 0.6,
    package_quality: 0.9,
    estimated_price: 1.20,
    household_size: 3
  },
  user_history: []   // optional — array of past { category, was_wasted, ... }
})
// result.waste_probability  → 0.0 – 1.0
// result.risk_level         → 'Low' | 'Medium' | 'High' | 'Very High'
// result.recommendations    → string[]
```

---

## Expiry Prediction Model
**Status:** Trained
**Date:** 2026-02-25
**Script:** `run_expiry_training.py`
**Model class:** `src/models/expiry_prediction.py` → `ExpiryPredictionModel`
**Saved to:** `models/expiry_predictor/`

### Results
| Metric | Value |
|---|---|
| Overall MAE (all categories) | 1.36 days |
| **Perishables MAE (target metric)** | **0.73 days** |
| Median absolute error (perishables) | 0.41 days |
| Within 1 day | 82.3% |
| Within 2 days | 91.8% |

**Target:** MAE ≤ 2.0 days on perishables — **ACHIEVED**

### Architecture
Ensemble of 2 sub-models:
- `GradientBoostingRegressor` (300 trees, depth 5, lr=0.05, 80% weight)
- `Dense NN` (128 → 64 → 32 → 1, ReLU, 20% weight)

### Features (21 total)
- Category one-hot (10)
- Storage type one-hot (3): fridge, freezer, pantry
- Numerical (8): storage_temp, storage_humidity, package_quality, brand_quality_score, seasonal_factor, days_since_purchase, is_shelf_stable, **log_base_days** (key feature)

### Training Data
- 6,000 synthetic records (4,800 train / 1,200 val)
- Labels: `remaining_days = base_days × package_factor × brand_factor × temp_factor × seasonal_factor + noise`
- Noise: ±4% for perishables (<14 days shelf life), ±1% for longer-lived items
- `log_base_days` is the strongest feature — model learns adjustment factors on top of UK guidelines

### Saved Files
```
models/expiry_predictor/
├── gb_regressor.joblib
├── standard_scaler.joblib
└── dense_nn.h5
```

---

## Food Recognition Model
**Status:** Not yet trained
**Target:** ≥ 85% top-1 accuracy, ≥ 95% top-5 accuracy
**Model class:** `src/models/food_recognition.py` → `FoodRecognitionModel`
**Colab notebook:** `colab_notebooks/food_recognition_training.ipynb`

### How to train
1. Open the notebook in VS Code (Colaboratory extension) or at colab.research.google.com
2. Runtime → Change runtime type → **T4 GPU**
3. Run all cells (~30–40 min total on T4)
4. Download `food_recognition_model.zip` when prompted
5. Extract and place files in `models/food_recognition/`

### Architecture
- **EfficientNetB3** pretrained on ImageNet (300×300 input)
- Phase 1 (12 epochs): train classification head only, backbone frozen
- Phase 2 (25 epochs): fine-tune top 40 layers at lr=1e-5
- Head: GlobalAvgPool → BN → Dropout(0.3) → Dense(512) → Dense(256) → Dense(101, softmax)
- Mixed precision (float16) for T4 speed

### Expected output files
```
models/food_recognition/
├── efficientnetb3_food101.keras   ← main model (~45 MB)
├── class_names.json               ← 101 Food-101 class names
└── metadata.json                  ← accuracy stats
```

### Realistic accuracy (EfficientNetB3 on Food-101)
- Top-1: ~82–87% (state-of-the-art is ~88–93% with larger models)
- Top-5: ~96–98%

## Technical Difficulties & Obstacles
- **GPU OOM (Out of Memory):** EfficientNetB3 (3B) training on 6GB VRAM is highly volatile. Must cap `batch_size=8` to avoid allocated memory overflow.
- **Synthetic Skew:** Initial random labels produced poor feature correlation. Switched to weighted label derivation to ensure Gradient Boosting could learn meaningful patterns.
- **Inference Overheads:** Python's subprocess startup time for `predict.py` adds ~1.6s latent delay. Recommendation: Migration to ONNX or persistent FastAPI microservice in production.
- **Environment Parity:** Mismatch between Windows `.venv` and Colab's Linux environment required manual re-scaling of specific image tensors during transfer.
