# PantryPal Model Training Strategy

## Overview
This document outlines the comprehensive training strategy to achieve the performance targets:
- **Food Recognition**: >95% accuracy on common UK foods
- **Expiry Prediction**: <2 days average error for perishables
- **Waste Prediction**: >85% accuracy in identifying waste-prone items
- **Recommendations**: >80% user satisfaction rate

## 1. Data Collection Strategy

### 1.1 Food Recognition Dataset
**Target**: 50,000+ images across 200+ UK food categories

#### Data Sources:
1. **UK Supermarket Websites** (Tesco, Sainsbury's, Asda, Morrisons)
   - Product images with labels
   - Nutritional information
   - Storage instructions

2. **Open Food Facts API**
   - UK-specific food products
   - Barcode-to-category mapping
   - Nutritional data

3. **User-Generated Content**
   - Crowdsourced pantry photos
   - Real-world storage conditions
   - Expiry date tracking

4. **Academic Datasets**
   - Food-101 (modified for UK foods)
   - Recipe1M+ (UK recipe adaptations)
   - UEC Food-256 (supplemented with UK items)

#### Data Augmentation:
```python
# Image augmentation pipeline
transforms = [
    RandomRotation(degrees=15),
    RandomBrightness(factor=0.2),
    RandomContrast(factor=0.2),
    RandomHorizontalFlip(p=0.5),
    ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    RandomResizedCrop(size=(224, 224), scale=(0.8, 1.0))
]
```

### 1.2 Expiry Prediction Dataset
**Target**: 100,000+ food item records with expiry tracking

#### Data Structure:
```python
{
    "food_item": {
        "name": "Tesco Whole Milk 1L",
        "category": "Dairy",
        "brand": "Tesco",
        "storage_type": "refrigerated",
        "storage_temp": 4.0,
        "package_type": "plastic_bottle",
        "preservatives": false,
        "organic": false
    },
    "environmental": {
        "temperature": 4.0,
        "humidity": 60.0,
        "light_exposure": "low"
    },
    "tracking": {
        "purchase_date": "2024-01-01",
        "expiry_date": "2024-01-08",
        "actual_expiry": "2024-01-07",
        "spoilage_indicators": ["sour_smell", "color_change"],
        "quality_score": 0.8
    }
}
```

#### Data Collection Methods:
1. **Supermarket Partnership**
   - Shelf-life data from suppliers
   - Storage condition guidelines
   - Quality control records

2. **User Tracking App**
   - Daily food condition photos
   - Expiry date logging
   - Spoilage indicators

3. **Academic Sources**
   - Food science research papers
   - USDA food storage guidelines (adapted for UK)
   - Industry shelf-life studies

### 1.3 Waste Prediction Dataset
**Target**: 50,000+ user consumption patterns

#### Data Structure:
```python
{
    "user_profile": {
        "household_size": 4,
        "cooking_frequency": "daily",
        "dietary_preferences": ["vegetarian"],
        "budget_consciousness": "high",
        "storage_facilities": ["fridge", "freezer", "pantry"]
    },
    "consumption_pattern": {
        "item_name": "Chicken Breast",
        "purchase_date": "2024-01-01",
        "expiry_date": "2024-01-03",
        "consumption_date": "2024-01-02",
        "waste_amount": 0.0,
        "waste_reason": null,
        "meal_planning": true,
        "leftovers_used": true
    },
    "contextual_factors": {
        "season": "winter",
        "special_occasions": false,
        "grocery_frequency": "weekly",
        "bulk_buying": false
    }
}
```

## 2. Model Architecture & Training

### 2.1 Food Recognition Model

#### Architecture: EfficientNet-B4 + Custom Head
```python
import torch
import torch.nn as nn
from efficientnet_pytorch import EfficientNet

class UKFoodClassifier(nn.Module):
    def __init__(self, num_classes=200):
        super().__init__()
        self.backbone = EfficientNet.from_pretrained('efficientnet-b4')
        self.backbone._fc = nn.Identity()  # Remove original classifier
        
        # Custom classification head for UK foods
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(1792, 1024),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, num_classes)
        )
        
        # Multi-task learning heads
        self.storage_head = nn.Linear(512, 5)  # fridge, freezer, pantry, room, special
        self.category_head = nn.Linear(512, 15)  # main food categories
        
    def forward(self, x):
        features = self.backbone(x)
        classification = self.classifier(features)
        storage = self.storage_head(features)
        category = self.category_head(features)
        return classification, storage, category
```

#### Training Strategy:
```python
# Multi-task loss function
def combined_loss(pred_class, pred_storage, pred_category, 
                 true_class, true_storage, true_category):
    ce_loss = F.cross_entropy(pred_class, true_class)
    storage_loss = F.cross_entropy(pred_storage, true_storage)
    category_loss = F.cross_entropy(pred_category, true_category)
    
    return ce_loss + 0.3 * storage_loss + 0.2 * category_loss

# Training configuration
config = {
    'batch_size': 32,
    'learning_rate': 1e-4,
    'epochs': 100,
    'weight_decay': 1e-4,
    'scheduler': 'cosine_annealing',
    'early_stopping': 10,
    'mixup_alpha': 0.2,
    'cutmix_alpha': 1.0
}
```

### 2.2 Expiry Prediction Model

#### Architecture: Transformer + LSTM Hybrid
```python
class ExpiryPredictor(nn.Module):
    def __init__(self, input_dim=50, hidden_dim=256):
        super().__init__()
        
        # Feature embedding layers
        self.food_embedding = nn.Embedding(1000, 64)  # Food items
        self.category_embedding = nn.Embedding(50, 32)  # Categories
        self.storage_embedding = nn.Embedding(10, 16)  # Storage types
        
        # Transformer for temporal patterns
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(
                d_model=hidden_dim,
                nhead=8,
                dim_feedforward=512,
                dropout=0.1
            ),
            num_layers=4
        )
        
        # LSTM for sequential dependencies
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=128,
            num_layers=2,
            dropout=0.2,
            bidirectional=True
        )
        
        # Prediction heads
        self.expiry_head = nn.Linear(256, 1)
        self.confidence_head = nn.Linear(256, 1)
        
    def forward(self, food_features, temporal_features):
        # Feature embedding
        food_emb = self.food_embedding(food_features['item_id'])
        cat_emb = self.category_embedding(food_features['category'])
        storage_emb = self.storage_embedding(food_features['storage_type'])
        
        # Combine embeddings
        combined = torch.cat([food_emb, cat_emb, storage_emb], dim=-1)
        
        # Transformer processing
        transformer_out = self.transformer(combined.transpose(0, 1))
        
        # LSTM processing
        lstm_out, _ = self.lstm(transformer_out.transpose(0, 1))
        
        # Predictions
        expiry_days = torch.relu(self.expiry_head(lstm_out))
        confidence = torch.sigmoid(self.confidence_head(lstm_out))
        
        return expiry_days, confidence
```

#### Training Data Pipeline:
```python
class ExpiryDataset(Dataset):
    def __init__(self, data_path, transform=None):
        self.data = pd.read_csv(data_path)
        self.transform = transform
        
    def __getitem__(self, idx):
        item = self.data.iloc[idx]
        
        # Feature engineering
        features = {
            'item_id': item['food_item_id'],
            'category': item['category_id'],
            'storage_type': item['storage_type_id'],
            'temperature': item['storage_temp'],
            'humidity': item['humidity'],
            'days_since_purchase': item['days_since_purchase'],
            'season': item['season_encoded'],
            'brand': item['brand_id']
        }
        
        # Temporal features (last 30 days)
        temporal = item['temporal_features']  # Pre-computed
        
        # Target
        actual_expiry = item['actual_expiry_days']
        
        return features, temporal, actual_expiry
```

### 2.3 Waste Prediction Model

#### Architecture: Gradient Boosting + Neural Network Ensemble
```python
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor

class WastePredictor:
    def __init__(self):
        # XGBoost for tabular features
        self.xgb_model = xgb.XGBRegressor(
            n_estimators=1000,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42
        )
        
        # Neural network for complex patterns
        self.nn_model = nn.Sequential(
            nn.Linear(100, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )
        
        # Ensemble weights
        self.xgb_weight = 0.6
        self.nn_weight = 0.4
        
    def predict(self, features):
        xgb_pred = self.xgb_model.predict(features['tabular'])
        nn_pred = self.nn_model(features['encoded']).detach().numpy()
        
        # Weighted ensemble
        final_pred = (self.xgb_weight * xgb_pred + 
                     self.nn_weight * nn_pred)
        
        return final_pred
```

## 3. AI Chat Assistant Training

### 3.1 Specialized Training Data

#### UK Food Knowledge Base
```python
uk_food_knowledge = {
    "supermarkets": {
        "tesco": {
            "brands": ["Tesco Finest", "Tesco Value", "Tesco Free From"],
            "loyalty": "Clubcard",
            "delivery": "Tesco.com",
            "specialty": "Tesco Express, Tesco Extra"
        },
        "sainsburys": {
            "brands": ["Sainsbury's Taste the Difference", "Sainsbury's Basics"],
            "loyalty": "Nectar",
            "delivery": "Sainsburys.co.uk",
            "specialty": "Sainsbury's Local"
        }
    },
    "uk_specifics": {
        "measurements": "metric system (kg, g, ml, l)",
        "currency": "British Pounds (£)",
        "date_format": "DD/MM/YYYY",
        "seasonal_foods": {
            "spring": ["asparagus", "rhubarb", "spring_onions"],
            "summer": ["strawberries", "cherries", "peaches"],
            "autumn": ["apples", "pears", "blackberries"],
            "winter": ["brussels_sprouts", "parsnips", "swede"]
        }
    }
}
```

#### Training Data Generation
```python
def generate_training_data():
    # Recipe suggestions based on UK ingredients
    recipe_prompts = [
        "What can I make with Tesco chicken breast, potatoes, and carrots?",
        "I have Sainsbury's salmon, rice, and broccoli - any recipe ideas?",
        "Quick meal with Morrison's mince, onions, and pasta?",
        "Healthy dinner using Asda vegetables and quinoa?"
    ]
    
    # Nutritional advice for UK foods
    nutrition_prompts = [
        "What's the nutritional value of British beef mince?",
        "How many calories in a Tesco whole chicken?",
        "Is Sainsbury's organic milk better than regular?",
        "Protein content in UK farmed salmon?"
    ]
    
    # Shopping advice for UK supermarkets
    shopping_prompts = [
        "Best time to shop at Tesco for discounts?",
        "Which Sainsbury's has the best produce?",
        "Asda vs Morrison's for budget shopping?",
        "Clubcard vs Nectar - which is better?"
    ]
    
    return recipe_prompts + nutrition_prompts + shopping_prompts
```

### 3.2 Fine-tuning Strategy

#### Prompt Engineering
```python
SYSTEM_PROMPT = """You are PantryPal, a specialized UK food assistant with expertise in:

1. UK Supermarkets: Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl
2. British Food Culture: Traditional dishes, seasonal ingredients
3. UK-Specific Measurements: Metric system, British Pounds
4. Food Safety: UK food standards, storage guidelines
5. Budget Shopping: UK supermarket deals, loyalty schemes

Always provide practical, UK-focused advice with specific supermarket recommendations when relevant."""

USER_PROMPTS = {
    "recipe_suggestion": "Based on your UK pantry items: {ingredients}, suggest 3 practical recipes using ingredients available at {supermarket}. Include cooking times and serving sizes.",
    "nutrition_advice": "Provide nutritional information for {food_item} available at UK supermarkets, including calories, protein, and key nutrients per 100g.",
    "shopping_tips": "Give UK-specific shopping advice for {budget} budget at {supermarket}, including best deals and seasonal recommendations."
}
```

## 4. Training Implementation

### 4.1 Training Pipeline
```python
# training_pipeline.py
def train_models():
    # 1. Data preparation
    food_data = prepare_food_recognition_data()
    expiry_data = prepare_expiry_prediction_data()
    waste_data = prepare_waste_prediction_data()
    
    # 2. Model training
    food_model = train_food_classifier(food_data)
    expiry_model = train_expiry_predictor(expiry_data)
    waste_model = train_waste_predictor(waste_data)
    
    # 3. Evaluation
    evaluate_models(food_model, expiry_model, waste_model)
    
    # 4. Deployment preparation
    save_models_for_production()
    
    return food_model, expiry_model, waste_model
```

### 4.2 Performance Monitoring
```python
def monitor_performance():
    metrics = {
        'food_recognition': {
            'accuracy': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'f1_score': 0.0
        },
        'expiry_prediction': {
            'mae': 0.0,  # Mean Absolute Error
            'rmse': 0.0,  # Root Mean Square Error
            'accuracy_within_2_days': 0.0
        },
        'waste_prediction': {
            'accuracy': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'auc': 0.0
        }
    }
    
    return metrics
```

## 5. Deployment Strategy

### 5.1 Model Serving
```python
# model_server.py
from flask import Flask, request, jsonify
import torch

app = Flask(__name__)

# Load trained models
food_model = torch.load('models/food_classifier.pth')
expiry_model = torch.load('models/expiry_predictor.pth')
waste_model = torch.load('models/waste_predictor.pth')

@app.route('/predict/food', methods=['POST'])
def predict_food():
    image = request.files['image']
    prediction = food_model.predict(image)
    return jsonify(prediction)

@app.route('/predict/expiry', methods=['POST'])
def predict_expiry():
    features = request.json
    prediction = expiry_model.predict(features)
    return jsonify(prediction)

@app.route('/predict/waste', methods=['POST'])
def predict_waste():
    features = request.json
    prediction = waste_model.predict(features)
    return jsonify(prediction)
```

### 5.2 Continuous Learning
```python
def continuous_learning():
    # Collect user feedback
    feedback = collect_user_feedback()
    
    # Retrain models periodically
    if should_retrain():
        retrain_models(feedback)
    
    # Update model weights
    update_model_weights()
```

## 6. Timeline & Milestones

### Phase 1: Data Collection (Weeks 1-4)
- [ ] Set up data collection infrastructure
- [ ] Partner with UK supermarkets for data access
- [ ] Launch user tracking app for crowdsourced data
- [ ] Collect initial dataset of 10,000+ samples

### Phase 2: Model Development (Weeks 5-12)
- [ ] Implement food recognition model
- [ ] Develop expiry prediction system
- [ ] Build waste prediction model
- [ ] Create AI chat training data

### Phase 3: Training & Optimization (Weeks 13-20)
- [ ] Train all models on collected data
- [ ] Optimize hyperparameters
- [ ] Implement ensemble methods
- [ ] Achieve target performance metrics

### Phase 4: Integration & Testing (Weeks 21-24)
- [ ] Integrate models into PantryPal
- [ ] Conduct user testing
- [ ] Performance monitoring setup
- [ ] Production deployment

## 7. Success Metrics

### Model Performance Targets:
- **Food Recognition**: >95% accuracy on common UK foods
- **Expiry Prediction**: <2 days average error for perishables
- **Waste Prediction**: >85% accuracy in identifying waste-prone items
- **Recommendations**: >80% user satisfaction rate

### User Experience Metrics:
- Response time < 2 seconds
- 99.9% uptime
- User retention > 70% after 30 days
- Average session time > 5 minutes

This comprehensive training strategy will ensure PantryPal achieves its performance targets and provides exceptional value to UK users.
