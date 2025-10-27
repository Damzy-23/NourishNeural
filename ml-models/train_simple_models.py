"""
Simplified training script for PantryPal ML models.
This script trains simple models that work without heavy dependencies.
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add src to path
sys.path.append('src')

from src.models.simple_models import SimpleExpiryPredictor, SimpleWastePredictor, SimpleFoodClassifier
from data_collection.datasets import DatasetManager

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SimpleModelTrainer:
    """Trainer for simple PantryPal models."""
    
    def __init__(self, data_dir: str = "data", model_dir: str = "trained_models"):
        self.data_dir = data_dir
        self.model_dir = model_dir
        self.dataset_manager = DatasetManager(data_dir)
        
        # Create model directory
        os.makedirs(model_dir, exist_ok=True)
        
        # Initialize models
        self.models = {
            'expiry_predictor': SimpleExpiryPredictor(),
            'waste_predictor': SimpleWastePredictor(),
            'food_classifier': SimpleFoodClassifier()
        }
    
    def generate_training_data(self, n_samples: int = 500):
        """Generate synthetic training data."""
        logger.info(f"Generating {n_samples} synthetic training samples...")
        
        np.random.seed(42)
        categories = ['Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks']
        
        training_data = []
        
        for i in range(n_samples):
            # Generate food item
            category = np.random.choice(categories)
            purchase_date = datetime.now() - pd.Timedelta(days=np.random.randint(1, 90))
            
            food_item = {
                'category': category,
                'purchase_date': purchase_date.strftime('%Y-%m-%d'),
                'estimated_price': np.random.uniform(0.5, 15.0),
                'storage_type': np.random.choice(['fridge', 'freezer', 'pantry']),
                'package_quality': np.random.uniform(0.3, 1.0),
                'brand_quality_score': np.random.uniform(0.4, 1.0),
                'user_handling_score': np.random.uniform(0.3, 1.0),
                'perishability_score': np.random.uniform(0.1, 1.0),
                'household_size': np.random.randint(1, 6),
                'budget_constraint': np.random.uniform(0.2, 0.8)
            }
            
            # Generate user history
            user_history = []
            for j in range(np.random.randint(2, 10)):
                hist_item = {
                    'category': np.random.choice(categories),
                    'purchase_date': (purchase_date - pd.Timedelta(days=np.random.randint(1, 60))).strftime('%Y-%m-%d'),
                    'consumption_date': (purchase_date - pd.Timedelta(days=np.random.randint(0, 30))).strftime('%Y-%m-%d'),
                    'was_wasted': np.random.choice([True, False], p=[0.25, 0.75])
                }
                user_history.append(hist_item)
            
            # Determine if this item was wasted
            waste_probability = 0.25  # Base probability
            if category in ['Dairy', 'Meat', 'Fish']:
                waste_probability += 0.15
            if food_item['package_quality'] < 0.5:
                waste_probability += 0.2
            if food_item['user_handling_score'] < 0.5:
                waste_probability += 0.1
            
            was_wasted = np.random.choice([True, False], p=[waste_probability, 1-waste_probability])
            
            record = {
                'food_item': food_item,
                'user_history': user_history,
                'was_wasted': was_wasted
            }
            
            training_data.append(record)
        
        return training_data
    
    def test_expiry_predictor(self, test_data):
        """Test the expiry predictor."""
        logger.info("Testing expiry predictor...")
        
        predictor = self.models['expiry_predictor']
        
        # Test on sample data
        test_items = [
            {
                'category': 'Dairy',
                'purchase_date': '2024-01-15',
                'storage_type': 'fridge',
                'package_quality': 0.9,
                'brand_quality_score': 0.8,
                'user_handling_score': 0.7
            },
            {
                'category': 'Meat',
                'purchase_date': '2024-01-15',
                'storage_type': 'freezer',
                'package_quality': 0.8,
                'brand_quality_score': 0.9,
                'user_handling_score': 0.6
            },
            {
                'category': 'Vegetables',
                'purchase_date': '2024-01-15',
                'storage_type': 'pantry',
                'package_quality': 0.7,
                'brand_quality_score': 0.7,
                'user_handling_score': 0.8
            }
        ]
        
        for item in test_items:
            prediction = predictor.predict_expiry(item)
            logger.info(f"Category: {item['category']}, Predicted expiry: {prediction['predicted_days']} days, Confidence: {prediction['confidence']:.2f}")
    
    def test_waste_predictor(self, training_data):
        """Test and train the waste predictor."""
        logger.info("Testing waste predictor...")
        
        predictor = self.models['waste_predictor']
        
        # Train the model
        predictor.train(training_data)
        
        # Test on sample data
        test_cases = [
            {
                'user_history': [
                    {'category': 'Dairy', 'purchase_date': '2024-01-01', 'consumption_date': '2024-01-05', 'was_wasted': False},
                    {'category': 'Vegetables', 'purchase_date': '2024-01-02', 'consumption_date': '2024-01-08', 'was_wasted': True},
                ],
                'food_item': {
                    'category': 'Dairy',
                    'purchase_date': '2024-01-15',
                    'estimated_price': 2.50,
                    'perishability_score': 0.8,
                    'package_quality': 0.9,
                    'storage_temp': 4.0,
                    'household_size': 3,
                    'budget_constraint': 0.5
                }
            },
            {
                'user_history': [
                    {'category': 'Pantry', 'purchase_date': '2024-01-01', 'consumption_date': '2024-01-10', 'was_wasted': False},
                    {'category': 'Pantry', 'purchase_date': '2024-01-05', 'consumption_date': '2024-01-12', 'was_wasted': False},
                ],
                'food_item': {
                    'category': 'Pantry',
                    'purchase_date': '2024-01-15',
                    'estimated_price': 1.50,
                    'perishability_score': 0.2,
                    'package_quality': 1.0,
                    'storage_temp': 20.0,
                    'household_size': 2,
                    'budget_constraint': 0.7
                }
            }
        ]
        
        for i, test_case in enumerate(test_cases):
            prediction = predictor.predict_waste_probability(
                test_case['user_history'], 
                test_case['food_item']
            )
            logger.info(f"Test case {i+1}: Category: {test_case['food_item']['category']}, "
                       f"Waste probability: {prediction['waste_probability']:.3f}, "
                       f"Risk level: {prediction['risk_level']}")
    
    def test_food_classifier(self):
        """Test the food classifier."""
        logger.info("Testing food classifier...")
        
        classifier = self.models['food_classifier']
        
        test_foods = [
            "Whole Milk 1L",
            "Chicken Breast 500g",
            "Fresh Tomatoes",
            "White Bread Loaf",
            "Rice 1kg",
            "Orange Juice",
            "Chocolate Biscuits",
            "Frozen Peas",
            "Salmon Fillet",
            "Bananas"
        ]
        
        for food in test_foods:
            classification = classifier.classify_food(food)
            logger.info(f"Food: {food} -> Category: {classification['category']}, "
                       f"Confidence: {classification['confidence']:.2f}")
    
    def save_models(self):
        """Save trained models."""
        logger.info("Saving models...")
        
        # Save waste predictor if trained
        if self.models['waste_predictor'].is_trained:
            self.models['waste_predictor'].save_model(f"{self.model_dir}/waste_predictor.pkl")
        
        # Save expiry predictor guidelines (it's rule-based, so save the guidelines)
        expiry_guidelines = self.models['expiry_predictor'].expiry_guidelines
        import json
        with open(f"{self.model_dir}/expiry_guidelines.json", 'w') as f:
            json.dump(expiry_guidelines, f, indent=2)
        
        # Save food classifier keywords
        classifier_keywords = self.models['food_classifier'].category_keywords
        with open(f"{self.model_dir}/food_classifier_keywords.json", 'w') as f:
            json.dump(classifier_keywords, f, indent=2)
        
        logger.info("Models saved successfully!")
    
    def create_model_summary(self):
        """Create a summary of model performance."""
        summary = {
            'timestamp': datetime.now().isoformat(),
            'models': {
                'expiry_predictor': {
                    'type': 'Rule-based with UK guidelines',
                    'status': 'Ready',
                    'features': 'Category, storage type, quality factors',
                    'accuracy': 'N/A (rule-based)'
                },
                'waste_predictor': {
                    'type': 'Random Forest (if sklearn available) or Rule-based',
                    'status': 'Trained' if self.models['waste_predictor'].is_trained else 'Rule-based fallback',
                    'features': 'User history, food characteristics, environmental factors',
                    'accuracy': 'Test accuracy logged during training'
                },
                'food_classifier': {
                    'type': 'Keyword-based classification',
                    'status': 'Ready',
                    'features': 'Food name keywords',
                    'accuracy': 'N/A (rule-based)'
                }
            },
            'data_used': 'Synthetic training data generated',
            'next_steps': [
                'Collect real user data for better training',
                'Implement computer vision for food recognition',
                'Integrate with PantryPal backend',
                'Deploy models for real-time predictions'
            ]
        }
        
        import json
        with open(f"{self.model_dir}/model_summary.json", 'w') as f:
            json.dump(summary, f, indent=2)
        
        return summary
    
    def train_all_models(self):
        """Train all simple models."""
        logger.info("🚀 Starting PantryPal simple model training...")
        
        # Generate training data
        training_data = self.generate_training_data(500)
        
        # Test all models
        self.test_expiry_predictor(training_data[:10])
        self.test_waste_predictor(training_data)
        self.test_food_classifier()
        
        # Save models
        self.save_models()
        
        # Create summary
        summary = self.create_model_summary()
        
        logger.info("✅ All simple models trained successfully!")
        logger.info(f"📊 Model summary saved to {self.model_dir}/model_summary.json")
        
        return summary

def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train PantryPal simple ML models')
    parser.add_argument('--data-dir', default='data', help='Directory for data')
    parser.add_argument('--model-dir', default='trained_models', help='Directory for trained models')
    parser.add_argument('--samples', type=int, default=500, help='Number of training samples to generate')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = SimpleModelTrainer(args.data_dir, args.model_dir)
    
    # Train models
    trainer.train_all_models()
    
    print("\n🎉 Training completed!")
    print("Next steps:")
    print("1. Check trained_models/ directory for saved models")
    print("2. Run python -c \"from src.models.simple_models import *; print('Models imported successfully!')\"")
    print("3. Integrate models into PantryPal backend")

if __name__ == "__main__":
    main()
