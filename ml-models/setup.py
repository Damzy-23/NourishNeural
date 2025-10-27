#!/usr/bin/env python3
"""
Setup script for PantryPal ML models.
This script sets up the environment and downloads initial datasets.
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a shell command and log the result."""
    logger.info(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ {description} failed: {e.stderr}")
        return False

def setup_environment():
    """Set up Python environment and install dependencies."""
    logger.info("Setting up PantryPal ML environment...")
    
    # Check Python version
    python_version = sys.version_info
    if python_version < (3, 8):
        logger.error("Python 3.8+ is required")
        return False
    
    logger.info(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    # Upgrade pip first
    run_command("python -m pip install --upgrade pip", "Upgrading pip")
    
    # Try minimal requirements first
    if not run_command("pip install -r requirements-minimal.txt", "Installing minimal dependencies"):
        logger.warning("Minimal dependencies failed, trying individual packages...")
        
        # Install core packages individually
        core_packages = [
            "scikit-learn",
            "pandas", 
            "numpy",
            "requests",
            "tqdm"
        ]
        
        for package in core_packages:
            if not run_command(f"pip install {package}", f"Installing {package}"):
                logger.warning(f"Failed to install {package}, continuing...")
    
    # Try full requirements
    if not run_command("pip install -r requirements.txt", "Installing full dependencies"):
        logger.warning("Full dependencies failed, but core packages should be available")
    
    # Create necessary directories
    directories = [
        "data/raw",
        "data/processed", 
        "data/food_recognition",
        "data/expiry_prediction",
        "data/waste_prediction",
        "data/recommendations",
        "trained_models",
        "logs",
        "notebooks"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Created directory: {directory}")
    
    return True

def download_sample_data():
    """Download sample datasets for testing."""
    logger.info("Downloading sample datasets...")
    
    # Ensure directories exist first
    directories = [
        "data/processed/food_recognition",
        "data/processed/expiry_prediction",
        "data/processed/waste_prediction",
        "data/processed/recommendations"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Ensured directory exists: {directory}")
    
    # Download Food-101 dataset (this is a large download)
    logger.info("Note: Food-101 dataset is ~5GB. Downloading will take time...")
    
    # For now, just create placeholder data
    import pandas as pd
    import numpy as np
    
    # Create sample UK food categories
    categories = [
        'Dairy', 'Meat', 'Fish', 'Vegetables', 'Fruits', 
        'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Snacks'
    ]
    
    uk_foods = pd.DataFrame([
        {'category': cat, 'item': f'{cat}_item_{i}', 'common_name': f'{cat} Product {i}'}
        for cat in categories for i in range(1, 6)
    ])
    
    uk_foods.to_csv('data/processed/food_recognition/uk_food_categories.csv', index=False)
    logger.info("Created sample UK food categories")
    
    # Create sample expiry guidelines
    expiry_guidelines = pd.DataFrame([
        {'category': cat, 'fridge_days': np.random.randint(3, 14), 
         'freezer_days': np.random.randint(30, 365), 
         'room_temp_days': np.random.randint(1, 7)}
        for cat in categories
    ])
    
    expiry_guidelines.to_csv('data/processed/expiry_prediction/expiry_guidelines.csv', index=False)
    logger.info("Created sample expiry guidelines")
    
    return True

def test_installation():
    """Test that all packages are installed correctly."""
    logger.info("Testing installation...")
    
    # Test core packages that should be available
    test_imports = [
        ('pandas', 'Pandas'),
        ('numpy', 'NumPy'),
        ('requests', 'Requests'),
        ('tqdm', 'TQDM')
    ]
    
    # Optional packages
    optional_imports = [
        ('sklearn', 'scikit-learn'),
        ('tensorflow', 'TensorFlow'),
        ('torch', 'PyTorch'),
        ('cv2', 'OpenCV'),
        ('PIL', 'Pillow')
    ]
    
    failed_imports = []
    for module, name in test_imports:
        try:
            __import__(module)
            logger.info(f"✓ {name} imported successfully")
        except ImportError as e:
            logger.error(f"✗ Failed to import {name}: {e}")
            failed_imports.append(name)
    
    # Check optional packages
    for module, name in optional_imports:
        try:
            __import__(module)
            logger.info(f"✓ {name} available (optional)")
        except ImportError:
            logger.warning(f"⚠ {name} not available (optional)")
    
    if failed_imports:
        logger.error(f"Critical imports failed: {failed_imports}")
        return False
    
    return True

def create_sample_notebook():
    """Create a sample Jupyter notebook for model testing."""
    notebook_content = '''{
 "cells": [
  {
   "cell_type": "markdown",
   "metadata": {},
   "source": [
    "# PantryPal ML Models - Quick Start\\n",
    "\\n",
    "This notebook demonstrates how to use the PantryPal ML models.\\n",
    "\\n",
    "## Models Available:\\n",
    "1. **Food Recognition**: CNN model for identifying food items from images\\n",
    "2. **Expiry Prediction**: LSTM model for predicting food expiry dates\\n",
    "3. **Waste Prediction**: Ensemble model for predicting food waste likelihood"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Import the models\\n",
    "import sys\\n",
    "sys.path.append('src')\\n",
    "\\n",
    "from models.food_recognition import FoodRecognitionModel\\n",
    "from models.expiry_prediction import ExpiryPredictionModel\\n",
    "from models.waste_prediction import WastePredictionModel\\n",
    "\\n",
    "print('Models imported successfully!')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Test expiry prediction model\\n",
    "expiry_model = ExpiryPredictionModel()\\n",
    "\\n",
    "# Example food item\\n",
    "food_item = {\\n",
    "    'category': 'Dairy',\\n",
    "    'purchase_date': '2024-01-15',\\n",
    "    'storage_type': 'fridge',\\n",
    "    'storage_temp': 4.0,\\n",
    "    'package_quality': 0.9\\n",
    "}\\n",
    "\\n",
    "# Predict expiry\\n",
    "prediction = expiry_model.predict_expiry(food_item)\\n",
    "print(f'Expiry prediction: {prediction}')"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "metadata": {},
   "outputs": [],
   "source": [
    "# Test waste prediction model\\n",
    "waste_model = WastePredictionModel()\\n",
    "\\n",
    "# Example user data\\n",
    "user_history = [\\n",
    "    {'category': 'Dairy', 'purchase_date': '2024-01-01', 'consumption_date': '2024-01-05', 'was_wasted': False},\\n",
    "    {'category': 'Vegetables', 'purchase_date': '2024-01-02', 'consumption_date': '2024-01-08', 'was_wasted': True}\\n",
    "]\\n",
    "\\n",
    "# Example food item\\n",
    "food_item = {\\n",
    "    'category': 'Dairy',\\n",
    "    'purchase_date': '2024-01-10',\\n",
    "    'estimated_price': 2.50,\\n",
    "    'storage_type': 'fridge'\\n",
    "}\\n",
    "\\n",
    "# Predict waste probability\\n",
    "prediction = waste_model.predict_waste_probability(user_history, food_item)\\n",
    "print(f'Waste prediction: {prediction}')"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.8.0"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 4
}'''
    
    try:
        # Ensure notebooks directory exists
        os.makedirs('notebooks', exist_ok=True)
        
        with open('notebooks/pantrypal_quickstart.ipynb', 'w') as f:
            f.write(notebook_content)
        
        logger.info("Created sample Jupyter notebook")
        return True
    except Exception as e:
        logger.error(f"Failed to create notebook: {e}")
        return False

def main():
    """Main setup function."""
    logger.info("🚀 Starting PantryPal ML setup...")
    
    # Check if we're in the right directory
    if not os.path.exists('requirements.txt'):
        logger.error("Please run this script from the ml-models directory")
        return False
    
    # Setup steps
    steps = [
        ("Setting up environment", setup_environment),
        ("Downloading sample data", download_sample_data),
        ("Testing installation", test_installation),
        ("Creating sample notebook", create_sample_notebook)
    ]
    
    for step_name, step_function in steps:
        logger.info(f"\\n--- {step_name} ---")
        if not step_function():
            logger.error(f"Setup failed at step: {step_name}")
            return False
    
    logger.info("\\n🎉 PantryPal ML setup completed successfully!")
    logger.info("\\nNext steps:")
    logger.info("1. Run 'python train_models.py' to train the models")
    logger.info("2. Open 'notebooks/pantrypal_quickstart.ipynb' to test the models")
    logger.info("3. Check 'DATASET_RESEARCH.md' for dataset collection guidelines")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
