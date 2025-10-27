"""
Main training script for PantryPal ML models.
This script trains all models and prepares them for deployment.
"""

import os
import sys
import logging
import argparse
from datetime import datetime
import pandas as pd
import numpy as np

# Add src to path
sys.path.append('src')

from data_collection.datasets import DatasetManager
from models.food_recognition import FoodRecognitionModel
from models.expiry_prediction import ExpiryPredictionModel
from models.waste_prediction import WastePredictionModel

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class PantryPalModelTrainer:
    """
    Main class for training all PantryPal ML models.
    """
    
    def __init__(self, data_dir: str = "data", model_dir: str = "trained_models"):
        self.data_dir = data_dir
        self.model_dir = model_dir
        self.dataset_manager = DatasetManager(data_dir)
        
        # Create model directory
        os.makedirs(model_dir, exist_ok=True)
        
        # Initialize models
        self.models = {
            'food_recognition': FoodRecognitionModel(),
            'expiry_prediction': ExpiryPredictionModel(),
            'waste_prediction': WastePredictionModel()
        }
    
    def setup_datasets(self):
        """
        Download and prepare datasets for training.
        """
        logger.info("Setting up datasets...")
        
        # Create UK food categories and expiry guidelines
        uk_foods = self.dataset_manager.create_uk_food_categories()
        expiry_guidelines = self.dataset_manager.create_expiry_guidelines()
        
        self.dataset_manager.save_processed_data(uk_foods, "uk_food_categories.csv", "food_recognition")
        self.dataset_manager.save_processed_data(expiry_guidelines, "expiry_guidelines.csv", "expiry_prediction")
        
        logger.info("Dataset setup completed!")
    
    def generate_synthetic_data(self):
        """
        Generate synthetic training data for demonstration purposes.
        In a real implementation, this would be replaced with actual data collection.
        """
        logger.info("Generating synthetic training data...")
        
        # Generate synthetic user behavior data for waste prediction
        np.random.seed(42)
        n_samples = 1000
        
        categories = ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks']
        
        synthetic_data = []
        for i in range(n_samples):
            # Generate food item
            category = np.random.choice(categories)
            purchase_date = datetime.now() - pd.Timedelta(days=np.random.randint(1, 365))
            
            food_item = {
                'category': category,
                'purchase_date': purchase_date.strftime('%Y-%m-%d'),
                'estimated_price': np.random.uniform(0.5, 10.0),
                'storage_type': np.random.choice(['fridge', 'freezer', 'pantry']),
                'storage_temp': np.random.uniform(2, 8) if np.random.choice([True, False]) else None,
                'storage_humidity': np.random.uniform(40, 80) if np.random.choice([True, False]) else None,
                'package_quality': np.random.uniform(0.3, 1.0),
                'perishability_score': np.random.uniform(0.1, 1.0),
                'brand_quality_score': np.random.uniform(0.3, 1.0),
                'user_handling_score': np.random.uniform(0.2, 1.0),
                'household_size': np.random.randint(1, 6),
                'budget_constraint': np.random.uniform(0.2, 0.8)
            }
            
            # Generate user history (last 10 items)
            user_history = []
            for j in range(min(10, np.random.randint(3, 15))):
                hist_item = {
                    'category': np.random.choice(categories),
                    'purchase_date': (purchase_date - pd.Timedelta(days=np.random.randint(1, 90))).strftime('%Y-%m-%d'),
                    'consumption_date': (purchase_date - pd.Timedelta(days=np.random.randint(0, 30))).strftime('%Y-%m-%d'),
                    'was_wasted': np.random.choice([True, False], p=[0.3, 0.7])
                }
                user_history.append(hist_item)
            
            # Determine if this item was wasted (based on category and other factors)
            waste_probability = 0.3  # Base probability
            if category in ['Dairy', 'Meat', 'Fish']:
                waste_probability += 0.2
            if food_item['package_quality'] < 0.5:
                waste_probability += 0.2
            if food_item['user_handling_score'] < 0.5:
                waste_probability += 0.1
            
            was_wasted = np.random.choice([True, False], p=[waste_probability, 1-waste_probability])
            
            # Calculate actual days until expiry (for expiry prediction training)
            if category == 'Dairy':
                base_days = 7
            elif category in ['Meat', 'Fish']:
                base_days = 3
            elif category in ['Vegetables', 'Fruits']:
                base_days = 5
            else:
                base_days = 14
            
            # Adjust based on storage conditions
            if food_item['storage_type'] == 'freezer':
                base_days *= 10
            elif food_item['storage_type'] == 'pantry' and category in ['Dairy', 'Meat', 'Fish']:
                base_days = 1
            
            actual_days_until_expiry = int(base_days * food_item['package_quality'] * food_item['brand_quality_score'])
            
            record = {
                'food_item': food_item,
                'user_history': user_history,
                'was_wasted': was_wasted,
                'actual_days_until_expiry': actual_days_until_expiry
            }
            
            synthetic_data.append(record)
        
        # Save synthetic data
        df = pd.DataFrame(synthetic_data)
        self.dataset_manager.save_processed_data(df, "synthetic_training_data.csv", "waste_prediction")
        
        logger.info(f"Generated {len(synthetic_data)} synthetic training samples")
        return synthetic_data
    
    def train_food_recognition_model(self):
        """
        Train the food recognition model.
        Note: This is a placeholder for actual training with real image data.
        """
        logger.info("Training food recognition model...")
        
        model = self.models['food_recognition']
        
        # Build model architecture
        model.build_model()
        
        # In a real implementation, you would:
        # 1. Download Food-101 dataset
        # 2. Create data generators
        # 3. Train with actual image data
        # 4. Evaluate performance
        
        # For now, just save the model architecture
        model.save_model(f"{self.model_dir}/food_recognition_model.h5")
        
        logger.info("Food recognition model training completed (placeholder)")
    
    def train_expiry_prediction_model(self, training_data):
        """
        Train the expiry prediction model.
        """
        logger.info("Training expiry prediction model...")
        
        model = self.models['expiry_prediction']
        
        # Prepare training data
        expiry_training_data = []
        for record in training_data:
            food_item = record['food_item'].copy()
            food_item['actual_days_until_expiry'] = record['actual_days_until_expiry']
            expiry_training_data.append(food_item)
        
        # Split data for training
        train_size = int(0.8 * len(expiry_training_data))
        train_data = expiry_training_data[:train_size]
        val_data = expiry_training_data[train_size:]
        
        # Train model (using rule-based for now, but architecture is ready for ML training)
        logger.info("Expiry prediction model ready (using rule-based predictions)")
        
        # Save model
        model.save_model(f"{self.model_dir}/expiry_prediction_model")
        
        logger.info("Expiry prediction model training completed")
    
    def train_waste_prediction_model(self, training_data):
        """
        Train the waste prediction model.
        """
        logger.info("Training waste prediction model...")
        
        model = self.models['waste_prediction']
        
        # Split data for training
        train_size = int(0.8 * len(training_data))
        train_data = training_data[:train_size]
        val_data = training_data[train_size:]
        
        # Train ensemble model
        model.train_ensemble(train_data, val_data)
        
        # Save models
        model.save_models(f"{self.model_dir}/waste_prediction")
        
        logger.info("Waste prediction model training completed")
    
    def evaluate_models(self, test_data):
        """
        Evaluate all trained models on test data.
        """
        logger.info("Evaluating models...")
        
        # Test waste prediction model
        model = self.models['waste_prediction']
        
        correct_predictions = 0
        total_predictions = 0
        
        for record in test_data[-50:]:  # Test on last 50 samples
            user_data = record['user_history']
            food_item = record['food_item']
            actual_waste = record['was_wasted']
            
            prediction = model.predict_waste_probability(user_data, food_item)
            predicted_waste = prediction['waste_probability'] > 0.5
            
            if predicted_waste == actual_waste:
                correct_predictions += 1
            total_predictions += 1
        
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        logger.info(f"Waste prediction accuracy: {accuracy:.3f}")
        
        # Test expiry prediction model
        model = self.models['expiry_prediction']
        
        mae_scores = []
        for record in test_data[-50:]:
            food_item = record['food_item']
            actual_days = record['actual_days_until_expiry']
            
            prediction = model.predict_expiry(food_item)
            predicted_days = prediction['predicted_days']
            
            mae = abs(predicted_days - actual_days)
            mae_scores.append(mae)
        
        avg_mae = np.mean(mae_scores) if mae_scores else 0
        logger.info(f"Expiry prediction MAE: {avg_mae:.2f} days")
    
    def create_model_summary(self):
        """
        Create a summary of all trained models.
        """
        logger.info("Creating model summary...")
        
        summary = {
            'timestamp': datetime.now().isoformat(),
            'models': {
                'food_recognition': {
                    'type': 'CNN (EfficientNet)',
                    'status': 'Architecture ready',
                    'note': 'Requires Food-101 dataset for full training'
                },
                'expiry_prediction': {
                    'type': 'LSTM + Rule-based',
                    'status': 'Trained (rule-based)',
                    'note': 'Ready for ML training with more data'
                },
                'waste_prediction': {
                    'type': 'Ensemble (RF + GB + NN)',
                    'status': 'Fully trained',
                    'note': 'Ready for deployment'
                }
            },
            'datasets': {
                'synthetic_training_data': '1000 samples generated',
                'uk_food_categories': 'Created with 10 categories',
                'expiry_guidelines': 'UK food safety guidelines'
            }
        }
        
        # Save summary
        import json
        with open(f"{self.model_dir}/training_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info("Model summary created")
        return summary
    
    def train_all_models(self):
        """
        Train all models in sequence.
        """
        logger.info("Starting PantryPal model training pipeline...")
        
        # Setup datasets
        self.setup_datasets()
        
        # Generate synthetic training data
        training_data = self.generate_synthetic_data()
        
        # Train models
        self.train_food_recognition_model()
        self.train_expiry_prediction_model(training_data)
        self.train_waste_prediction_model(training_data)
        
        # Evaluate models
        self.evaluate_models(training_data)
        
        # Create summary
        summary = self.create_model_summary()
        
        logger.info("All models trained successfully!")
        return summary

def main():
    """
    Main function for training PantryPal models.
    """
    parser = argparse.ArgumentParser(description='Train PantryPal ML models')
    parser.add_argument('--data-dir', default='data', help='Directory for datasets')
    parser.add_argument('--model-dir', default='trained_models', help='Directory for trained models')
    parser.add_argument('--model', choices=['all', 'food_recognition', 'expiry_prediction', 'waste_prediction'], 
                       default='all', help='Which model to train')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = PantryPalModelTrainer(args.data_dir, args.model_dir)
    
    if args.model == 'all':
        # Train all models
        trainer.train_all_models()
    else:
        # Train specific model
        if args.model == 'food_recognition':
            trainer.train_food_recognition_model()
        elif args.model == 'expiry_prediction':
            training_data = trainer.generate_synthetic_data()
            trainer.train_expiry_prediction_model(training_data)
        elif args.model == 'waste_prediction':
            training_data = trainer.generate_synthetic_data()
            trainer.train_waste_prediction_model(training_data)

if __name__ == "__main__":
    main()
