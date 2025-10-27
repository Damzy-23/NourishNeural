# PantryPal ML Models

This directory contains all machine learning models for the PantryPal dissertation project.

## Model Architecture Overview

### 1. Food Recognition Model (Computer Vision)
- **Purpose**: Identify food items from images (barcode scanning, receipt OCR, photo recognition)
- **Technology**: Convolutional Neural Network (CNN) using TensorFlow/PyTorch
- **Dataset**: Food-101, FoodNet, custom UK supermarket dataset
- **Output**: Food category, name, nutritional information

### 2. Expiry Prediction Model
- **Purpose**: Predict food expiry dates based on purchase date, storage conditions, and food type
- **Technology**: Time series analysis with LSTM/GRU networks
- **Dataset**: UK food safety guidelines, user behavior data, environmental factors
- **Output**: Predicted expiry date with confidence score

### 3. Waste Prediction Model
- **Purpose**: Predict likelihood of food waste based on user behavior patterns
- **Technology**: Ensemble methods (Random Forest, XGBoost) + Neural Networks
- **Dataset**: User consumption patterns, purchase history, household demographics
- **Output**: Waste probability score and recommendations

### 4. Recommendation System
- **Purpose**: Suggest recipes, shopping items, and meal plans
- **Technology**: Collaborative filtering + Content-based filtering + Deep Learning
- **Dataset**: Recipe databases, user preferences, nutritional data
- **Output**: Personalized recommendations with confidence scores

## Dataset Requirements

### Primary Datasets
1. **Food-101**: 101 food categories with 1000 images each
2. **FoodNet**: Large-scale food dataset with nutritional information
3. **UK Food Standards Agency**: Expiry guidelines and safety data
4. **Recipe datasets**: BBC Good Food, AllRecipes, etc.
5. **UK Supermarket data**: Tesco, Sainsbury's, Asda product catalogs

### Custom Data Collection
1. **User behavior tracking**: Purchase patterns, consumption rates
2. **Environmental factors**: Temperature, humidity, storage conditions
3. **Household demographics**: Size, dietary restrictions, budget constraints

## Model Performance Targets

- **Food Recognition**: >95% accuracy on common UK foods
- **Expiry Prediction**: <2 days average error for perishables
- **Waste Prediction**: >85% accuracy in identifying waste-prone items
- **Recommendations**: >80% user satisfaction rate

## Development Timeline

- **Week 1-2**: Dataset research and collection
- **Week 3-4**: Food recognition model development
- **Week 5-6**: Expiry prediction model
- **Week 7-8**: Waste prediction model
- **Week 9-10**: Recommendation system
- **Week 11-12**: Model integration and testing
- **Week 13-14**: Performance evaluation and optimization
- **Week 15-16**: Dissertation writing and final testing

## Technical Stack

- **Python 3.9+**
- **TensorFlow 2.x** / **PyTorch 1.x**
- **scikit-learn**
- **Pandas, NumPy**
- **OpenCV** (computer vision)
- **Transformers** (NLP for recipes)
- **MLflow** (model tracking)
- **Docker** (containerization)

## Ethical Considerations

- User privacy protection
- Bias mitigation in recommendations
- Transparent AI decision-making
- Data anonymization
- Fair access to food recommendations

## Research Contribution

This project contributes to:
1. **Computer Vision**: Novel food recognition techniques for UK markets
2. **Time Series Prediction**: Improved expiry date forecasting
3. **Behavioral AI**: User-centric waste reduction strategies
4. **Recommendation Systems**: Multi-modal food recommendation engines
5. **Social Impact**: Reducing food waste in households
