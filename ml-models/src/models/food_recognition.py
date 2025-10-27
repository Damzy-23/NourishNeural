"""
Food Recognition Model using Computer Vision
This model identifies food items from images for PantryPal.
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import cv2
from typing import List, Tuple, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FoodRecognitionModel:
    """
    CNN-based model for food recognition.
    Optimized for UK supermarket foods and common household items.
    """
    
    def __init__(self, num_classes: int = 101, input_shape: Tuple[int, int, int] = (224, 224, 3)):
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.model = None
        self.class_names = []
        
    def build_model(self) -> keras.Model:
        """
        Build the CNN architecture for food recognition.
        Uses EfficientNet backbone for better performance on food images.
        """
        # Use EfficientNetB0 as backbone
        base_model = keras.applications.EfficientNetB0(
            weights='imagenet',
            include_top=False,
            input_shape=self.input_shape
        )
        
        # Freeze early layers, fine-tune later layers
        base_model.trainable = True
        fine_tune_at = len(base_model.layers) - 20
        
        for layer in base_model.layers[:fine_tune_at]:
            layer.trainable = False
        
        # Add custom classification head
        inputs = keras.Input(shape=self.input_shape)
        
        # Data augmentation
        x = layers.RandomFlip("horizontal")(inputs)
        x = layers.RandomRotation(0.1)(x)
        x = layers.RandomZoom(0.1)(x)
        
        # Base model
        x = base_model(x, training=False)
        
        # Global average pooling
        x = layers.GlobalAveragePooling2D()(x)
        
        # Dropout for regularization
        x = layers.Dropout(0.2)(x)
        
        # Dense layers
        x = layers.Dense(512, activation='relu')(x)
        x = layers.Dropout(0.3)(x)
        x = layers.Dense(256, activation='relu')(x)
        x = layers.Dropout(0.2)(x)
        
        # Output layer
        outputs = layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = keras.Model(inputs, outputs)
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='categorical_crossentropy',
            metrics=['accuracy', 'top_3_accuracy']
        )
        
        self.model = model
        logger.info(f"Built food recognition model with {model.count_params()} parameters")
        return model
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """
        Preprocess image for model input.
        """
        # Load image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize to model input shape
        image = cv2.resize(image, (self.input_shape[0], self.input_shape[1]))
        
        # Normalize to [0, 1]
        image = image.astype(np.float32) / 255.0
        
        # Add batch dimension
        image = np.expand_dims(image, axis=0)
        
        return image
    
    def preprocess_batch(self, image_paths: List[str]) -> np.ndarray:
        """
        Preprocess batch of images.
        """
        images = []
        for path in image_paths:
            image = self.preprocess_image(path)
            images.append(image[0])  # Remove batch dimension
        
        return np.array(images)
    
    def train(self, train_data, val_data, epochs: int = 50, batch_size: int = 32):
        """
        Train the food recognition model.
        """
        if self.model is None:
            self.build_model()
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_accuracy',
                patience=5,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3,
                min_lr=1e-7
            ),
            keras.callbacks.ModelCheckpoint(
                'models/food_recognition_best.h5',
                monitor='val_accuracy',
                save_best_only=True,
                save_weights_only=False
            )
        ]
        
        # Train model
        history = self.model.fit(
            train_data,
            validation_data=val_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        logger.info("Training completed!")
        return history
    
    def predict(self, image_path: str) -> Dict[str, float]:
        """
        Predict food category from image.
        Returns dictionary with class probabilities.
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")
        
        # Preprocess image
        image = self.preprocess_image(image_path)
        
        # Make prediction
        predictions = self.model.predict(image, verbose=0)
        
        # Get top predictions
        top_indices = np.argsort(predictions[0])[-5:][::-1]
        
        results = {}
        for idx in top_indices:
            if idx < len(self.class_names):
                class_name = self.class_names[idx]
                confidence = float(predictions[0][idx])
                results[class_name] = confidence
        
        return results
    
    def predict_batch(self, image_paths: List[str]) -> List[Dict[str, float]]:
        """
        Predict food categories for batch of images.
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")
        
        # Preprocess images
        images = self.preprocess_batch(image_paths)
        
        # Make predictions
        predictions = self.model.predict(images, verbose=0)
        
        results = []
        for pred in predictions:
            top_indices = np.argsort(pred)[-5:][::-1]
            
            result = {}
            for idx in top_indices:
                if idx < len(self.class_names):
                    class_name = self.class_names[idx]
                    confidence = float(pred[idx])
                    result[class_name] = confidence
            
            results.append(result)
        
        return results
    
    def load_model(self, model_path: str):
        """
        Load pre-trained model.
        """
        self.model = keras.models.load_model(model_path)
        logger.info(f"Loaded model from {model_path}")
    
    def save_model(self, model_path: str):
        """
        Save trained model.
        """
        if self.model is None:
            raise ValueError("No model to save. Please train a model first.")
        
        self.model.save(model_path)
        logger.info(f"Saved model to {model_path}")
    
    def set_class_names(self, class_names: List[str]):
        """
        Set class names for predictions.
        """
        self.class_names = class_names
        logger.info(f"Set {len(class_names)} class names")

class BarcodeScanner:
    """
    Barcode scanning functionality for product identification.
    """
    
    def __init__(self):
        self.product_database = {}
        self.load_uk_product_database()
    
    def load_uk_product_database(self):
        """
        Load UK supermarket product database.
        This would typically connect to supermarket APIs.
        """
        # Mock UK product database
        self.product_database = {
            "5000159461125": {  # Example Tesco barcode
                "name": "Tesco Whole Milk 1L",
                "brand": "Tesco",
                "category": "Dairy",
                "price": 1.20,
                "nutritional_info": {
                    "calories_per_100ml": 64,
                    "protein": 3.4,
                    "fat": 3.6,
                    "carbs": 4.7
                }
            },
            "5010037000123": {  # Example Sainsbury's barcode
                "name": "Sainsbury's White Bread",
                "brand": "Sainsbury's",
                "category": "Bakery",
                "price": 1.50,
                "nutritional_info": {
                    "calories_per_100g": 247,
                    "protein": 8.2,
                    "fat": 2.4,
                    "carbs": 47.2
                }
            }
        }
    
    def scan_barcode(self, barcode: str) -> Dict:
        """
        Look up product information from barcode.
        """
        if barcode in self.product_database:
            return self.product_database[barcode]
        else:
            return {
                "error": "Product not found",
                "barcode": barcode,
                "suggestion": "Try manual entry or photo recognition"
            }

# Example usage and testing
if __name__ == "__main__":
    # Initialize model
    model = FoodRecognitionModel(num_classes=101)
    
    # Build model architecture
    model.build_model()
    
    # Print model summary
    model.model.summary()
    
    # Example prediction (would need actual image)
    # results = model.predict("path/to/image.jpg")
    # print(f"Prediction results: {results}")
    
    print("Food Recognition Model initialized successfully!")
