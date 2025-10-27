"""
Expiry Prediction Model
Predicts food expiry dates based on purchase date, storage conditions, and food type.
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from typing import Dict, List, Tuple, Optional
import logging
from datetime import datetime, timedelta
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ExpiryPredictionModel:
    """
    LSTM-based model for predicting food expiry dates.
    Considers multiple factors: food type, storage conditions, purchase date, etc.
    """
    
    def __init__(self):
        self.model = None
        self.feature_scalers = {}
        self.label_encoder = None
        self.expiry_guidelines = self.load_expiry_guidelines()
        
    def load_expiry_guidelines(self) -> pd.DataFrame:
        """
        Load UK food safety expiry guidelines.
        """
        guidelines = [
            {'category': 'Dairy', 'fridge_days': 7, 'freezer_days': 90, 'room_temp_days': 2, 'shelf_stable': False},
            {'category': 'Meat', 'fridge_days': 3, 'freezer_days': 270, 'room_temp_days': 0, 'shelf_stable': False},
            {'category': 'Fish', 'fridge_days': 2, 'freezer_days': 180, 'room_temp_days': 0, 'shelf_stable': False},
            {'category': 'Vegetables', 'fridge_days': 7, 'freezer_days': 365, 'room_temp_days': 3, 'shelf_stable': False},
            {'category': 'Fruits', 'fridge_days': 5, 'freezer_days': 365, 'room_temp_days': 7, 'shelf_stable': False},
            {'category': 'Bakery', 'fridge_days': 5, 'freezer_days': 90, 'room_temp_days': 3, 'shelf_stable': False},
            {'category': 'Pantry', 'fridge_days': 365, 'freezer_days': 365, 'room_temp_days': 365, 'shelf_stable': True},
            {'category': 'Frozen', 'fridge_days': 1, 'freezer_days': 365, 'room_temp_days': 0, 'shelf_stable': False},
            {'category': 'Beverages', 'fridge_days': 30, 'freezer_days': 365, 'room_temp_days': 365, 'shelf_stable': True},
            {'category': 'Snacks', 'fridge_days': 90, 'freezer_days': 365, 'room_temp_days': 90, 'shelf_stable': True}
        ]
        
        return pd.DataFrame(guidelines)
    
    def build_model(self, input_shape: Tuple[int, int]) -> keras.Model:
        """
        Build LSTM model for expiry prediction.
        """
        inputs = keras.Input(shape=input_shape, name='sequence_input')
        
        # LSTM layers for temporal patterns
        x = layers.LSTM(64, return_sequences=True, dropout=0.2)(inputs)
        x = layers.LSTM(32, return_sequences=False, dropout=0.2)(x)
        
        # Dense layers for final prediction
        x = layers.Dense(64, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(32, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layer - days until expiry
        outputs = layers.Dense(1, activation='linear', name='expiry_days')(x)
        
        model = keras.Model(inputs, outputs)
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae', 'mape']
        )
        
        self.model = model
        logger.info(f"Built expiry prediction model with {model.count_params()} parameters")
        return model
    
    def create_features(self, food_items: List[Dict]) -> np.ndarray:
        """
        Create feature vectors for expiry prediction.
        
        Features:
        - Food category (one-hot encoded)
        - Storage temperature
        - Storage humidity
        - Purchase date (days ago)
        - Package type
        - Brand quality score
        - Seasonal factor
        - User handling patterns
        """
        features = []
        
        for item in food_items:
            feature_vector = []
            
            # Categorical features (one-hot encoded)
            category = item.get('category', 'Unknown')
            category_features = self._encode_category(category)
            feature_vector.extend(category_features)
            
            # Numerical features
            feature_vector.extend([
                item.get('storage_temp', 4.0),  # Celsius
                item.get('storage_humidity', 60.0),  # Percentage
                item.get('days_since_purchase', 0),
                item.get('package_quality', 1.0),  # 0-1 scale
                item.get('brand_quality_score', 0.5),  # 0-1 scale
                item.get('seasonal_factor', 1.0),  # 0-2 scale
                item.get('user_handling_score', 0.5),  # 0-1 scale
            ])
            
            features.append(feature_vector)
        
        return np.array(features)
    
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
    
    def create_sequence_data(self, user_history: List[Dict], sequence_length: int = 30) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create time series data for LSTM training.
        """
        X, y = [], []
        
        # Sort by date
        user_history.sort(key=lambda x: x['purchase_date'])
        
        for i in range(sequence_length, len(user_history)):
            # Input sequence
            sequence = user_history[i-sequence_length:i]
            features = self.create_features(sequence)
            X.append(features)
            
            # Target (actual days until expiry)
            target_item = user_history[i]
            days_until_expiry = target_item.get('actual_days_until_expiry', 0)
            y.append(days_until_expiry)
        
        return np.array(X), np.array(y)
    
    def predict_expiry(self, food_item: Dict) -> Dict:
        """
        Predict expiry date for a single food item.
        """
        if self.model is None:
            # Use rule-based prediction if model not trained
            return self._rule_based_prediction(food_item)
        
        # Create features
        features = self.create_features([food_item])
        
        # Reshape for LSTM (add sequence dimension)
        features = np.expand_dims(features, axis=0)
        
        # Predict
        days_until_expiry = self.model.predict(features, verbose=0)[0][0]
        
        # Calculate expiry date
        purchase_date = datetime.strptime(food_item['purchase_date'], '%Y-%m-%d')
        expiry_date = purchase_date + timedelta(days=int(days_until_expiry))
        
        return {
            'predicted_days': int(days_until_expiry),
            'expiry_date': expiry_date.strftime('%Y-%m-%d'),
            'confidence': self._calculate_confidence(food_item),
            'recommendations': self._get_storage_recommendations(food_item)
        }
    
    def _rule_based_prediction(self, food_item: Dict) -> Dict:
        """
        Fallback rule-based prediction using UK guidelines.
        """
        category = food_item.get('category', 'Unknown')
        storage_type = food_item.get('storage_type', 'fridge')
        
        # Get guidelines for category
        guidelines = self.expiry_guidelines[self.expiry_guidelines['category'] == category]
        
        if guidelines.empty:
            # Default to 7 days if category not found
            days = 7
        else:
            if storage_type == 'fridge':
                days = guidelines.iloc[0]['fridge_days']
            elif storage_type == 'freezer':
                days = guidelines.iloc[0]['freezer_days']
            else:
                days = guidelines.iloc[0]['room_temp_days']
        
        # Adjust based on package quality and handling
        package_quality = food_item.get('package_quality', 1.0)
        handling_score = food_item.get('user_handling_score', 0.5)
        
        # Reduce days based on quality factors
        quality_factor = (package_quality + handling_score) / 2
        adjusted_days = int(days * quality_factor)
        
        purchase_date = datetime.strptime(food_item['purchase_date'], '%Y-%m-%d')
        expiry_date = purchase_date + timedelta(days=adjusted_days)
        
        return {
            'predicted_days': adjusted_days,
            'expiry_date': expiry_date.strftime('%Y-%m-%d'),
            'confidence': 0.7,  # Lower confidence for rule-based
            'method': 'rule_based',
            'recommendations': self._get_storage_recommendations(food_item)
        }
    
    def _calculate_confidence(self, food_item: Dict) -> float:
        """
        Calculate prediction confidence based on available data quality.
        """
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on data completeness
        if food_item.get('storage_temp') is not None:
            confidence += 0.1
        if food_item.get('storage_humidity') is not None:
            confidence += 0.1
        if food_item.get('brand_quality_score') is not None:
            confidence += 0.1
        if food_item.get('user_handling_score') is not None:
            confidence += 0.1
        
        # Increase confidence for common categories
        common_categories = ['Dairy', 'Meat', 'Vegetables', 'Fruits']
        if food_item.get('category') in common_categories:
            confidence += 0.1
        
        return min(confidence, 0.95)  # Cap at 95%
    
    def _get_storage_recommendations(self, food_item: Dict) -> List[str]:
        """
        Get storage recommendations based on food type.
        """
        category = food_item.get('category', '')
        recommendations = []
        
        if category in ['Dairy', 'Meat', 'Fish']:
            recommendations.extend([
                "Store in refrigerator at 4°C or below",
                "Keep in original packaging",
                "Use within recommended timeframe"
            ])
        elif category in ['Vegetables', 'Fruits']:
            recommendations.extend([
                "Store in cool, dry place",
                "Some items can be refrigerated",
                "Check regularly for spoilage"
            ])
        elif category == 'Pantry':
            recommendations.extend([
                "Store in cool, dry place",
                "Keep in airtight containers",
                "Check for pests regularly"
            ])
        
        return recommendations
    
    def train(self, training_data: List[Dict], validation_data: List[Dict] = None, 
              epochs: int = 100, batch_size: int = 32):
        """
        Train the expiry prediction model.
        """
        # Prepare training data
        X_train, y_train = self.create_sequence_data(training_data)
        
        if validation_data:
            X_val, y_val = self.create_sequence_data(validation_data)
        else:
            X_val, y_val = None, None
        
        # Build model if not already built
        if self.model is None:
            self.build_model(input_shape=(X_train.shape[1], X_train.shape[2]))
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss' if validation_data else 'loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss' if validation_data else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7
            )
        ]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val) if validation_data else None,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        logger.info("Expiry prediction model training completed!")
        return history
    
    def save_model(self, model_path: str):
        """
        Save trained model and scalers.
        """
        if self.model is None:
            raise ValueError("No model to save")
        
        # Save model
        self.model.save(model_path)
        
        # Save scalers and metadata
        metadata = {
            'expiry_guidelines': self.expiry_guidelines.to_dict('records'),
            'feature_scalers': self.feature_scalers
        }
        
        with open(f"{model_path}_metadata.json", 'w') as f:
            json.dump(metadata, f)
        
        logger.info(f"Saved model and metadata to {model_path}")
    
    def load_model(self, model_path: str):
        """
        Load pre-trained model and metadata.
        """
        self.model = keras.models.load_model(model_path)
        
        # Load metadata
        try:
            with open(f"{model_path}_metadata.json", 'r') as f:
                metadata = json.load(f)
                self.expiry_guidelines = pd.DataFrame(metadata['expiry_guidelines'])
                self.feature_scalers = metadata['feature_scalers']
        except FileNotFoundError:
            logger.warning("Metadata file not found, using defaults")
        
        logger.info(f"Loaded model from {model_path}")

# Example usage
if __name__ == "__main__":
    # Initialize model
    model = ExpiryPredictionModel()
    
    # Example food item
    food_item = {
        'category': 'Dairy',
        'purchase_date': '2024-01-10',
        'storage_type': 'fridge',
        'storage_temp': 4.0,
        'storage_humidity': 60.0,
        'package_quality': 0.9,
        'brand_quality_score': 0.8,
        'user_handling_score': 0.7
    }
    
    # Predict expiry
    prediction = model.predict_expiry(food_item)
    print(f"Expiry prediction: {prediction}")
    
    print("Expiry Prediction Model initialized successfully!")
