"""
Expiry Prediction Model
Predicts remaining shelf life (days) for a food item given its category,
storage conditions, and package quality.

Architecture: Ensemble of GradientBoostingRegressor + small Dense NN.
Target: MAE <= 2.0 days.
"""

import numpy as np
import os
import joblib
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Feature / label constants
# ---------------------------------------------------------------------------
CATEGORIES = ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits',
              'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks']

STORAGE_TYPES = ['fridge', 'freezer', 'pantry']   # 'room' is mapped to 'pantry'

# UK food safety base shelf life (days) by category × storage type
# fmt: off
BASE_DAYS = {
    'Dairy':      {'fridge': 7,   'freezer': 90,  'pantry': 2},
    'Meat':       {'fridge': 3,   'freezer': 270, 'pantry': 0},
    'Fish':       {'fridge': 2,   'freezer': 180, 'pantry': 0},
    'Vegetables': {'fridge': 7,   'freezer': 365, 'pantry': 3},
    'Fruits':     {'fridge': 5,   'freezer': 365, 'pantry': 7},
    'Bakery':     {'fridge': 5,   'freezer': 90,  'pantry': 3},
    'Pantry':     {'fridge': 365, 'freezer': 365, 'pantry': 365},
    'Frozen':     {'fridge': 1,   'freezer': 365, 'pantry': 0},
    'Beverages':  {'fridge': 30,  'freezer': 365, 'pantry': 365},
    'Snacks':     {'fridge': 90,  'freezer': 365, 'pantry': 90},
}
# fmt: on

SHELF_STABLE = {'Pantry', 'Beverages', 'Snacks', 'Frozen'}

N_FEATURES = len(CATEGORIES) + len(STORAGE_TYPES) + 8  # = 21  (includes log_base_days)


# ---------------------------------------------------------------------------
class ExpiryPredictionModel:
    """
    Ensemble regression model for food shelf-life prediction.

    Sub-models
    ----------
    - GradientBoostingRegressor  (80 % weight)
    - Small Dense neural network (20 % weight)

    Save / load
    -----------
    save_model(path) / load_model(path)  — uses joblib for everything.
    """

    def __init__(self):
        self.gb_model   = None
        self.nn_model   = None
        self.scaler     = None
        self.gb_weight  = 0.80
        self.nn_weight  = 0.20

    # ------------------------------------------------------------------
    # Feature engineering
    # ------------------------------------------------------------------
    def _normalise_storage_type(self, storage_type: str) -> str:
        st = str(storage_type).lower()
        if st in ('freezer',):          return 'freezer'
        if st in ('fridge', 'frig'):    return 'fridge'
        return 'pantry'

    def _get_base_days(self, category: str, storage_type: str) -> float:
        cat_data = BASE_DAYS.get(category, BASE_DAYS['Pantry'])
        return float(cat_data.get(storage_type, cat_data['pantry']))

    def _make_feature_vector(self, food_item: dict) -> np.ndarray:
        """Convert a food_item dict into a fixed-length feature vector."""
        # 1. Category one-hot (10)
        cat   = food_item.get('category', 'Pantry')
        cat_vec = [1.0 if cat == c else 0.0 for c in CATEGORIES]

        # 2. Storage type one-hot (3)
        st    = self._normalise_storage_type(food_item.get('storage_type', 'fridge'))
        st_vec = [1.0 if st == s else 0.0 for s in STORAGE_TYPES]

        # 3. Numerical features (8)
        # log1p(base_days) normalised to [0,1] is the single strongest feature —
        # the model only needs to learn adjustment factors on top of it.
        st_n     = self._normalise_storage_type(food_item.get('storage_type', 'fridge'))
        base     = self._get_base_days(cat, st_n)
        log_base = float(np.log1p(base) / np.log1p(365))   # 0.0 – 1.0

        num_vec = [
            float(food_item.get('storage_temp',        4.0)),
            float(food_item.get('storage_humidity',    60.0)),
            float(food_item.get('package_quality',     0.9)),
            float(food_item.get('brand_quality_score', 0.7)),
            float(food_item.get('seasonal_factor',     1.0)),
            float(food_item.get('days_since_purchase', 0)),
            1.0 if cat in SHELF_STABLE else 0.0,       # is_shelf_stable
            log_base,                                  # encoded base shelf life
        ]

        return np.array(cat_vec + st_vec + num_vec, dtype=np.float32)

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------
    def train_model(self, train_data: list, val_data: list):
        """
        Train the ensemble on pre-generated records.

        Each record: {'food_item': {...}, 'actual_remaining_days': float}
        """
        from sklearn.ensemble import GradientBoostingRegressor
        from sklearn.preprocessing import StandardScaler
        import tensorflow as tf
        from tensorflow import keras
        from tensorflow.keras import layers

        # --- Build feature matrices ---
        X_train = np.array([self._make_feature_vector(r['food_item']) for r in train_data])
        y_train = np.array([r['actual_remaining_days']               for r in train_data], dtype=np.float32)
        X_val   = np.array([self._make_feature_vector(r['food_item']) for r in val_data])
        y_val   = np.array([r['actual_remaining_days']               for r in val_data],  dtype=np.float32)

        # --- Scale features ---
        self.scaler = StandardScaler()
        X_train_s = self.scaler.fit_transform(X_train)
        X_val_s   = self.scaler.transform(X_val)

        # --- 1. Gradient Boosting ---
        print("  [GB]  Training GradientBoostingRegressor...")
        self.gb_model = GradientBoostingRegressor(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.05,
            subsample=0.8,
            min_samples_leaf=5,
            random_state=42,
        )
        self.gb_model.fit(X_train_s, y_train)
        gb_val_preds = self.gb_model.predict(X_val_s)
        gb_mae = float(np.mean(np.abs(gb_val_preds - y_val)))
        print(f"         Val MAE: {gb_mae:.2f} days")

        # --- 2. Dense Neural Network ---
        print("  [NN]  Training Dense Neural Network...")
        inp = keras.Input(shape=(N_FEATURES,))
        x   = layers.Dense(128, activation='relu')(inp)
        x   = layers.Dropout(0.2)(x)
        x   = layers.Dense(64, activation='relu')(x)
        x   = layers.Dropout(0.2)(x)
        x   = layers.Dense(32, activation='relu')(x)
        out = layers.Dense(1, activation='linear')(x)
        nn  = keras.Model(inp, out)
        nn.compile(optimizer=keras.optimizers.Adam(0.001), loss='mse', metrics=['mae'])

        nn.fit(
            X_train_s, y_train,
            validation_data=(X_val_s, y_val),
            epochs=80,
            batch_size=64,
            callbacks=[
                keras.callbacks.EarlyStopping(monitor='val_mae', patience=10, restore_best_weights=True),
                keras.callbacks.ReduceLROnPlateau(monitor='val_mae', factor=0.5, patience=5, min_lr=1e-6),
            ],
            verbose=0,
        )
        self.nn_model = nn
        nn_val_preds = nn.predict(X_val_s, verbose=0).flatten()
        nn_mae = float(np.mean(np.abs(nn_val_preds - y_val)))
        print(f"         Val MAE: {nn_mae:.2f} days")

        # --- 3. Ensemble MAE ---
        ens_preds = self.gb_weight * gb_val_preds + self.nn_weight * nn_val_preds
        ens_mae   = float(np.mean(np.abs(ens_preds - y_val)))
        print(f"  [ENS] Ensemble Val MAE: {ens_mae:.2f} days")
        return ens_mae

    # ------------------------------------------------------------------
    # Save / Load
    # ------------------------------------------------------------------
    def save_model(self, model_dir: str):
        os.makedirs(model_dir, exist_ok=True)
        joblib.dump(self.gb_model, os.path.join(model_dir, 'gb_regressor.joblib'))
        joblib.dump(self.scaler,   os.path.join(model_dir, 'standard_scaler.joblib'))
        self.nn_model.save(os.path.join(model_dir, 'dense_nn.h5'))
        print(f"  Saved to: {model_dir}/")

    def load_model(self, model_dir: str):
        import tensorflow as tf
        from tensorflow import keras
        self.gb_model  = joblib.load(os.path.join(model_dir, 'gb_regressor.joblib'))
        self.scaler    = joblib.load(os.path.join(model_dir, 'standard_scaler.joblib'))
        self.nn_model  = keras.models.load_model(os.path.join(model_dir, 'dense_nn.h5'))

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------
    def predict_expiry(self, food_item: dict) -> dict:
        """
        Predict remaining shelf life for a food item.

        Returns
        -------
        {
            'predicted_days': int,
            'expiry_date': 'YYYY-MM-DD',
            'confidence': float,
            'method': 'ml' | 'rule_based',
            'recommendations': list[str]
        }
        """
        if self.gb_model is None:
            return self._rule_based_prediction(food_item)

        fv     = self._make_feature_vector(food_item).reshape(1, -1)
        fv_s   = self.scaler.transform(fv)

        gb_pred = float(self.gb_model.predict(fv_s)[0])
        nn_pred = float(self.nn_model.predict(fv_s, verbose=0)[0][0])
        days    = max(0.0, self.gb_weight * gb_pred + self.nn_weight * nn_pred)
        days_int = int(round(days))

        # Calculate expiry date
        purchase_date_str = food_item.get('purchase_date', datetime.today().strftime('%Y-%m-%d'))
        days_since = int(food_item.get('days_since_purchase', 0))
        purchase_date = datetime.strptime(purchase_date_str[:10], '%Y-%m-%d')
        expiry_date   = purchase_date + timedelta(days=days_since + days_int)

        return {
            'predicted_days': days_int,
            'expiry_date':    expiry_date.strftime('%Y-%m-%d'),
            'confidence':     self._calculate_confidence(food_item),
            'method':         'ml',
            'recommendations': self._get_storage_recommendations(food_item),
        }

    def _rule_based_prediction(self, food_item: dict) -> dict:
        """Fallback: UK food safety guidelines."""
        category = food_item.get('category', 'Pantry')
        st       = self._normalise_storage_type(food_item.get('storage_type', 'fridge'))
        base     = self._get_base_days(category, st)

        pq   = food_item.get('package_quality', 0.9)
        bq   = food_item.get('brand_quality_score', 0.7)
        adj  = (0.65 + 0.35 * pq) * (0.8 + 0.2 * bq)
        days = max(0, int(round(base * adj)))

        purchase_date_str = food_item.get('purchase_date', datetime.today().strftime('%Y-%m-%d'))
        days_since = int(food_item.get('days_since_purchase', 0))
        purchase_date = datetime.strptime(purchase_date_str[:10], '%Y-%m-%d')
        expiry_date   = purchase_date + timedelta(days=days_since + days)

        return {
            'predicted_days': days,
            'expiry_date':    expiry_date.strftime('%Y-%m-%d'),
            'confidence':     0.65,
            'method':         'rule_based',
            'recommendations': self._get_storage_recommendations(food_item),
        }

    def _calculate_confidence(self, food_item: dict) -> float:
        score = 0.60
        for key in ('storage_temp', 'storage_humidity', 'brand_quality_score', 'package_quality'):
            if food_item.get(key) is not None:
                score += 0.07
        if food_item.get('category') in ('Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits'):
            score += 0.05
        return min(round(score, 2), 0.95)

    def _get_storage_recommendations(self, food_item: dict) -> list:
        cat = food_item.get('category', '')
        recs = []
        if cat in ('Dairy', 'Meat', 'Fish'):
            recs = ["Store in refrigerator at 4°C or below",
                    "Keep in original packaging until use",
                    "Use within 1–2 days of opening"]
        elif cat in ('Vegetables', 'Fruits'):
            recs = ["Store in cool, dry place or refrigerate",
                    "Check regularly for signs of spoilage",
                    "Keep away from ethylene-producing fruits"]
        elif cat == 'Bakery':
            recs = ["Store at room temperature in a bread bin",
                    "Freeze if not using within 3 days",
                    "Keep away from moisture to prevent mould"]
        elif cat == 'Frozen':
            recs = ["Keep frozen at -18°C or below",
                    "Do not refreeze once thawed",
                    "Consume within 24 hours of thawing"]
        else:
            recs = ["Store in a cool, dry place",
                    "Keep in airtight containers after opening",
                    "Check best-before date before use"]
        return recs
