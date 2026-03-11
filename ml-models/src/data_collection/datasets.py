"""
Dataset collection and management for PantryPal ML models.
This module handles downloading, preprocessing, and organizing datasets.
"""

import os
import requests
import tarfile
import pandas as pd
from typing import Dict, List, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatasetManager:
    """Manages dataset collection and preprocessing for PantryPal models."""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.setup_directories()
    
    def setup_directories(self):
        """Create necessary directory structure."""
        directories = [
            f"{self.data_dir}/raw",
            f"{self.data_dir}/processed",
            f"{self.data_dir}/food_recognition",
            f"{self.data_dir}/expiry_prediction",
            f"{self.data_dir}/waste_prediction",
            f"{self.data_dir}/recommendations"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def get_food_recognition_datasets(self) -> Dict[str, str]:
        """
        Get food recognition datasets.
        Returns dictionary with dataset names and download URLs.
        """
        datasets = {
            "food_101": "https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/tar.gz",
            "foodnet": "https://www.kaggle.com/datasets/trolukovich/food5k-image-dataset",
            "uk_foods": "https://github.com/pantrypal/uk-food-dataset",  # Custom dataset
        }
        return datasets
    
    def get_expiry_prediction_data(self) -> Dict[str, str]:
        """
        Get data sources for expiry prediction.
        """
        data_sources = {
            "uk_food_safety": "https://www.food.gov.uk/safety-hygiene/food-safety",
            "storage_guidelines": "https://www.nhs.uk/live-well/eat-well/how-to-store-food-and-leftovers/",
            "user_behavior": "internal_pantrypal_data"  # From app usage
        }
        return data_sources
    
    def get_waste_prediction_data(self) -> Dict[str, str]:
        """
        Get data sources for waste prediction.
        """
        data_sources = {
            "household_consumption": "https://www.gov.uk/government/statistics/family-food-2019-to-2020",
            "waste_statistics": "https://wrap.org.uk/resources/report/food-waste-reduction-roadmap-progress-report-2021",
            "user_patterns": "internal_pantrypal_data"
        }
        return data_sources
    
    def get_recommendation_data(self) -> Dict[str, str]:
        """
        Get data sources for recommendation system.
        """
        data_sources = {
            "bbc_recipes": "https://www.bbc.co.uk/food/recipes",
            "allrecipes": "https://www.allrecipes.com/",
            "nutritional_data": "https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid",
            "uk_products": "supermarket_api_data"
        }
        return data_sources
    
    def download_food101(self, extract_to: str = None) -> str:
        """
        Download and extract Food-101 dataset.
        """
        if extract_to is None:
            extract_to = f"{self.data_dir}/food_recognition/food101"
        
        os.makedirs(extract_to, exist_ok=True)
        
        url = "https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/tar.gz"
        filename = f"{extract_to}/food-101.tar.gz"
        
        logger.info(f"Downloading Food-101 dataset to {filename}")
        
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info("Extracting Food-101 dataset...")
            with tarfile.open(filename, 'r:gz') as tar:
                tar.extractall(extract_to)
            
            logger.info(f"Food-101 dataset extracted to {extract_to}")
            return extract_to
            
        except Exception as e:
            logger.error(f"Error downloading Food-101: {e}")
            raise
    
    def create_uk_food_categories(self) -> pd.DataFrame:
        """
        Create UK-specific food categories based on major supermarkets.
        """
        categories = {
            'Dairy': ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Cream'],
            'Meat': ['Chicken', 'Beef', 'Pork', 'Lamb', 'Turkey'],
            'Fish': ['Salmon', 'Cod', 'Tuna', 'Prawns', 'Mackerel'],
            'Vegetables': ['Potatoes', 'Carrots', 'Onions', 'Tomatoes', 'Peppers'],
            'Fruits': ['Apples', 'Bananas', 'Oranges', 'Grapes', 'Berries'],
            'Bakery': ['Bread', 'Croissants', 'Cakes', 'Pastries', 'Biscuits'],
            'Pantry': ['Rice', 'Pasta', 'Cereals', 'Beans', 'Lentils'],
            'Frozen': ['Ice Cream', 'Frozen Veg', 'Frozen Meat', 'Ready Meals'],
            'Beverages': ['Tea', 'Coffee', 'Juice', 'Water', 'Soft Drinks'],
            'Snacks': ['Crisps', 'Nuts', 'Chocolate', 'Crackers', 'Popcorn']
        }
        
        df = pd.DataFrame([
            {'category': cat, 'item': item} 
            for cat, items in categories.items() 
            for item in items
        ])
        
        return df
    
    def create_expiry_guidelines(self) -> pd.DataFrame:
        """
        Create UK food safety expiry guidelines.
        """
        guidelines = [
            {'category': 'Dairy', 'fridge_days': 7, 'freezer_days': 90, 'room_temp_days': 2},
            {'category': 'Meat', 'fridge_days': 3, 'freezer_days': 270, 'room_temp_days': 0},
            {'category': 'Fish', 'fridge_days': 2, 'freezer_days': 180, 'room_temp_days': 0},
            {'category': 'Vegetables', 'fridge_days': 7, 'freezer_days': 365, 'room_temp_days': 3},
            {'category': 'Fruits', 'fridge_days': 5, 'freezer_days': 365, 'room_temp_days': 7},
            {'category': 'Bakery', 'fridge_days': 5, 'freezer_days': 90, 'room_temp_days': 3},
            {'category': 'Pantry', 'fridge_days': 365, 'freezer_days': 365, 'room_temp_days': 365},
            {'category': 'Frozen', 'fridge_days': 1, 'freezer_days': 365, 'room_temp_days': 0},
            {'category': 'Beverages', 'fridge_days': 30, 'freezer_days': 365, 'room_temp_days': 365},
            {'category': 'Snacks', 'fridge_days': 90, 'freezer_days': 365, 'room_temp_days': 90}
        ]
        
        return pd.DataFrame(guidelines)
    
    def save_processed_data(self, data: pd.DataFrame, filename: str, subdirectory: str = ""):
        """
        Save processed data to appropriate directory.
        """
        if subdirectory:
            save_path = f"{self.data_dir}/processed/{subdirectory}/{filename}"
        else:
            save_path = f"{self.data_dir}/processed/{filename}"
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        data.to_csv(save_path, index=False)
        logger.info(f"Saved processed data to {save_path}")

if __name__ == "__main__":
    # Example usage
    dm = DatasetManager()
    
    # Create UK food categories
    uk_foods = dm.create_uk_food_categories()
    dm.save_processed_data(uk_foods, "uk_food_categories.csv", "food_recognition")
    
    # Create expiry guidelines
    expiry_guidelines = dm.create_expiry_guidelines()
    dm.save_processed_data(expiry_guidelines, "expiry_guidelines.csv", "expiry_prediction")
    
    print("Dataset setup completed!")
    print(f"UK Food Categories: {len(uk_foods)} items")
    print(f"Expiry Guidelines: {len(expiry_guidelines)} categories")
