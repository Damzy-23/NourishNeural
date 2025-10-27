"""
Waste Prediction Model
Predicts likelihood of food waste based on user behavior patterns and food characteristics.
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WastePredictionModel:
    """
    Ensemble model for predicting food waste likelihood.
    Combines user behavior patterns, food characteristics, and environmental factors.
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_importance = {}
        
    def create_features(self, user_data: List[Dict], food_item: Dict) -> np.ndarray:
        """
        Create feature vector for waste prediction.
        
        Features:
        - User behavior patterns
        - Food characteristics
        - Environmental factors
        - Seasonal patterns
        - Household demographics
        """
        features = []
        
        # User behavior features
        user_features = self._extract_user_features(user_data)
        features.extend(user_features)
        
        # Food characteristics
        food_features = self._extract_food_features(food_item)
        features.extend(food_features)
        
        # Environmental factors
        env_features = self._extract_environmental_features(food_item)
        features.extend(env_features)
        
        # Seasonal patterns
        seasonal_features = self._extract_seasonal_features(food_item)
        features.extend(seasonal_features)
        
        return np.array(features)
    
    def _extract_user_features(self, user_data: List[Dict]) -> List[float]:
        """
        Extract user behavior features from historical data.
        """
        features = []
        
        if not user_data:
            # Default values if no user data
            return [0.0] * 10
        
        # Calculate user statistics
        total_items = len(user_data)
        wasted_items = sum(1 for item in user_data if item.get('was_wasted', False))
        waste_rate = wasted_items / total_items if total_items > 0 else 0.0
        
        # Average consumption time
        consumption_times = []
        for item in user_data:
            if 'purchase_date' in item and 'consumption_date' in item:
                purchase = datetime.strptime(item['purchase_date'], '%Y-%m-%d')
                consumption = datetime.strptime(item['consumption_date'], '%Y-%m-%d')
                consumption_times.append((consumption - purchase).days)
        
        avg_consumption_time = np.mean(consumption_times) if consumption_times else 7.0
        
        # Category preferences
        categories = [item.get('category', 'Unknown') for item in user_data]
        category_counts = pd.Series(categories).value_counts()
        
        # User features
        features.extend([
            waste_rate,  # Overall waste rate
            avg_consumption_time,  # Average time to consume
            len(set(categories)),  # Number of different categories tried
            category_counts.get('Dairy', 0) / total_items,  # Dairy preference
            category_counts.get('Vegetables', 0) / total_items,  # Vegetable preference
            category_counts.get('Meat', 0) / total_items,  # Meat preference
            category_counts.get('Fruits', 0) / total_items,  # Fruit preference
            np.std(consumption_times) if consumption_times else 0.0,  # Consumption time variance
            user_data[-1].get('household_size', 2) if user_data else 2,  # Household size
            user_data[-1].get('budget_constraint', 0.5) if user_data else 0.5  # Budget constraint
        ])
        
        return features
    
    def _extract_food_features(self, food_item: Dict) -> List[float]:
        """
        Extract food-specific features.
        """
        features = []
        
        # Categorical features (one-hot encoded)
        category = food_item.get('category', 'Unknown')
        category_features = self._encode_category(category)
        features.extend(category_features)
        
        # Numerical features
        features.extend([
            food_item.get('estimated_price', 2.0),
            food_item.get('package_size', 1.0),
            food_item.get('perishability_score', 0.5),  # 0-1 scale
            food_item.get('nutritional_density', 0.5),  # 0-1 scale
            food_item.get('preparation_effort', 0.5),  # 0-1 scale
            food_item.get('versatility_score', 0.5),  # 0-1 scale
            food_item.get('brand_familiarity', 0.5),  # 0-1 scale
        ])
        
        return features
    
    def _extract_environmental_features(self, food_item: Dict) -> List[float]:
        """
        Extract environmental and storage features.
        """
        features = [
            food_item.get('storage_temp', 4.0),
            food_item.get('storage_humidity', 60.0),
            food_item.get('storage_quality', 0.8),  # 0-1 scale
            food_item.get('package_integrity', 0.9),  # 0-1 scale
            food_item.get('exposure_to_light', 0.2),  # 0-1 scale
            food_item.get('air_circulation', 0.5),  # 0-1 scale
        ]
        
        return features
    
    def _extract_seasonal_features(self, food_item: Dict) -> List[float]:
        """
        Extract seasonal and temporal features.
        """
        purchase_date = datetime.strptime(food_item.get('purchase_date', '2024-01-01'), '%Y-%m-%d')
        
        features = [
            purchase_date.month / 12.0,  # Month (0-1)
            purchase_date.day / 31.0,  # Day of month (0-1)
            purchase_date.weekday() / 7.0,  # Day of week (0-1)
            np.sin(2 * np.pi * purchase_date.month / 12),  # Seasonal sine
            np.cos(2 * np.pi * purchase_date.month / 12),  # Seasonal cosine
            food_item.get('holiday_proximity', 0.0),  # Days to nearest holiday
            food_item.get('weekend_purchase', 0.0),  # 1 if weekend purchase
        ]
        
        return features
    
    def _encode_category(self, category: str) -> List[float]:
        """
        One-hot encode food category.
        """
        categories = ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 
                     'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks']
        
        encoding = [0.0] * len(categories)
        if category in categories:
            encoding[categories.index(category)] = 1.0
        
        return encoding
    
    def prepare_training_data(self, historical_data: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from historical user behavior.
        """
        X, y = [], []
        
        for record in historical_data:
            # Extract features
            user_data = record.get('user_history', [])
            food_item = record.get('food_item', {})
            was_wasted = record.get('was_wasted', False)
            
            features = self.create_features(user_data, food_item)
            X.append(features)
            y.append(1 if was_wasted else 0)
        
        return np.array(X), np.array(y)
    
    def train_ensemble(self, training_data: List[Dict], validation_data: List[Dict] = None):
        """
        Train ensemble of models for waste prediction.
        """
        # Prepare training data
        X_train, y_train = self.prepare_training_data(training_data)
        
        if validation_data:
            X_val, y_val = self.prepare_training_data(validation_data)
        else:
            # Split training data for validation
            X_train, X_val, y_train, y_val = train_test_split(
                X_train, y_train, test_size=0.2, random_state=42, stratify=y_train
            )
        
        # Scale features
        self.scalers['standard'] = StandardScaler()
        X_train_scaled = self.scalers['standard'].fit_transform(X_train)
        X_val_scaled = self.scalers['standard'].transform(X_val)
        
        # Train Random Forest
        logger.info("Training Random Forest model...")
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        self.models['random_forest'].fit(X_train_scaled, y_train)
        
        # Train Gradient Boosting
        logger.info("Training Gradient Boosting model...")
        self.models['gradient_boosting'] = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        self.models['gradient_boosting'].fit(X_train_scaled, y_train)
        
        # Train Neural Network
        logger.info("Training Neural Network model...")
        self.models['neural_network'] = self._build_neural_network(X_train_scaled.shape[1])
        self.models['neural_network'].fit(
            X_train_scaled, y_train,
            validation_data=(X_val_scaled, y_val),
            epochs=50,
            batch_size=32,
            verbose=0
        )
        
        # Evaluate models
        self._evaluate_models(X_val_scaled, y_val)
        
        logger.info("Ensemble training completed!")
    
    def _build_neural_network(self, input_dim: int) -> keras.Model:
        """
        Build neural network for waste prediction.
        """
        model = keras.Sequential([
            layers.Dense(64, activation='relu', input_shape=(input_dim,)),
            layers.Dropout(0.3),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.2),
            layers.Dense(16, activation='relu'),
            layers.Dropout(0.1),
            layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def _evaluate_models(self, X_val: np.ndarray, y_val: np.ndarray):
        """
        Evaluate all models on validation data.
        """
        logger.info("Evaluating models...")
        
        for name, model in self.models.items():
            if name == 'neural_network':
                y_pred = (model.predict(X_val) > 0.5).astype(int).flatten()
            else:
                y_pred = model.predict(X_val)
            
            # Calculate feature importance for tree-based models
            if hasattr(model, 'feature_importances_'):
                self.feature_importance[name] = model.feature_importances_
            
            logger.info(f"{name} - Validation Accuracy: {np.mean(y_pred == y_val):.3f}")
    
    def predict_waste_probability(self, user_data: List[Dict], food_item: Dict) -> Dict:
        """
        Predict waste probability using ensemble of models.
        """
        # Create features
        features = self.create_features(user_data, food_item)
        
        # Scale features
        if 'standard' not in self.scalers:
            raise ValueError("Model not trained. Please train the model first.")
        
        features_scaled = self.scalers['standard'].transform(features.reshape(1, -1))
        
        # Get predictions from all models
        predictions = {}
        for name, model in self.models.items():
            if name == 'neural_network':
                pred = model.predict(features_scaled, verbose=0)[0][0]
            else:
                pred = model.predict_proba(features_scaled)[0][1]
            
            predictions[name] = pred
        
        # Ensemble prediction (weighted average)
        weights = {'random_forest': 0.4, 'gradient_boosting': 0.3, 'neural_network': 0.3}
        ensemble_pred = sum(weights[name] * pred for name, pred in predictions.items())
        
        # Generate recommendations
        recommendations = self._generate_recommendations(user_data, food_item, ensemble_pred)
        
        return {
            'waste_probability': float(ensemble_pred),
            'risk_level': self._get_risk_level(ensemble_pred),
            'individual_predictions': predictions,
            'recommendations': recommendations,
            'confidence': self._calculate_confidence(user_data, food_item)
        }
    
    def _get_risk_level(self, probability: float) -> str:
        """
        Categorize waste risk level.
        """
        if probability < 0.3:
            return 'Low'
        elif probability < 0.6:
            return 'Medium'
        elif probability < 0.8:
            return 'High'
        else:
            return 'Very High'
    
    def _generate_recommendations(self, user_data: List[Dict], food_item: Dict, probability: float) -> List[str]:
        """
        Generate personalized recommendations to reduce waste.
        """
        recommendations = []
        
        # High-level recommendations based on probability
        if probability > 0.7:
            recommendations.append("Consider buying smaller quantity or sharing with others")
            recommendations.append("Plan specific meals using this item")
        
        if probability > 0.5:
            recommendations.append("Store in optimal conditions (proper temperature/humidity)")
            recommendations.append("Set reminder to use within recommended timeframe")
        
        # Category-specific recommendations
        category = food_item.get('category', '')
        if category in ['Dairy', 'Meat', 'Fish']:
            recommendations.append("Store in coldest part of refrigerator")
            recommendations.append("Use within 2-3 days of purchase")
        elif category in ['Vegetables', 'Fruits']:
            recommendations.append("Store in cool, dry place with good air circulation")
            recommendations.append("Check daily for spoilage signs")
        elif category == 'Pantry':
            recommendations.append("Store in airtight containers")
            recommendations.append("Use FIFO (First In, First Out) method")
        
        # User behavior-based recommendations
        if user_data:
            waste_rate = sum(1 for item in user_data if item.get('was_wasted', False)) / len(user_data)
            if waste_rate > 0.3:
                recommendations.append("Consider meal planning to reduce impulse purchases")
                recommendations.append("Create shopping list based on planned meals")
        
        return recommendations[:5]  # Limit to top 5 recommendations
    
    def _calculate_confidence(self, user_data: List[Dict], food_item: Dict) -> float:
        """
        Calculate prediction confidence based on data quality and model agreement.
        """
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on user data availability
        if len(user_data) > 10:
            confidence += 0.2
        elif len(user_data) > 5:
            confidence += 0.1
        
        # Increase confidence based on food item data completeness
        required_fields = ['category', 'purchase_date', 'storage_type']
        completeness = sum(1 for field in required_fields if food_item.get(field) is not None) / len(required_fields)
        confidence += completeness * 0.2
        
        return min(confidence, 0.95)
    
    def save_models(self, model_path: str):
        """
        Save all trained models and preprocessing objects.
        """
        import os
        os.makedirs(model_path, exist_ok=True)
        
        # Save models
        for name, model in self.models.items():
            if name == 'neural_network':
                model.save(f"{model_path}/{name}.h5")
            else:
                joblib.dump(model, f"{model_path}/{name}.joblib")
        
        # Save scalers and encoders
        for name, scaler in self.scalers.items():
            joblib.dump(scaler, f"{model_path}/{name}_scaler.joblib")
        
        # Save feature importance
        if self.feature_importance:
            joblib.dump(self.feature_importance, f"{model_path}/feature_importance.joblib")
        
        logger.info(f"Saved all models to {model_path}")
    
    def load_models(self, model_path: str):
        """
        Load pre-trained models and preprocessing objects.
        """
        # Load models
        self.models['random_forest'] = joblib.load(f"{model_path}/random_forest.joblib")
        self.models['gradient_boosting'] = joblib.load(f"{model_path}/gradient_boosting.joblib")
        self.models['neural_network'] = keras.models.load_model(f"{model_path}/neural_network.h5")
        
        # Load scalers
        self.scalers['standard'] = joblib.load(f"{model_path}/standard_scaler.joblib")
        
        # Load feature importance
        try:
            self.feature_importance = joblib.load(f"{model_path}/feature_importance.joblib")
        except FileNotFoundError:
            logger.warning("Feature importance file not found")
        
        logger.info(f"Loaded all models from {model_path}")

# Example usage
if __name__ == "__main__":
    # Initialize model
    model = WastePredictionModel()
    
    # Example user data
    user_history = [
        {'category': 'Dairy', 'purchase_date': '2024-01-01', 'consumption_date': '2024-01-05', 'was_wasted': False},
        {'category': 'Vegetables', 'purchase_date': '2024-01-02', 'consumption_date': '2024-01-08', 'was_wasted': True},
        {'category': 'Meat', 'purchase_date': '2024-01-03', 'consumption_date': '2024-01-06', 'was_wasted': False},
    ]
    
    # Example food item
    food_item = {
        'category': 'Dairy',
        'purchase_date': '2024-01-10',
        'estimated_price': 2.50,
        'storage_type': 'fridge',
        'storage_temp': 4.0,
        'perishability_score': 0.8,
        'household_size': 3
    }
    
    # Predict waste probability
    prediction = model.predict_waste_probability(user_history, food_item)
    print(f"Waste prediction: {prediction}")
    
    print("Waste Prediction Model initialized successfully!")
