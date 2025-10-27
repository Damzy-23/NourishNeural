# PantryPal Dataset Research

## Overview
This document outlines the datasets and data sources needed for training PantryPal's ML models. Each model requires specific types of data to achieve optimal performance.

## 1. Food Recognition Model

### Primary Datasets

#### Food-101 Dataset
- **Source**: https://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/
- **Size**: 101,000 images across 101 food categories
- **Description**: Large-scale food recognition dataset with 1000 images per category
- **Usage**: Base training data for food classification
- **Download**: `wget http://data.vision.ee.ethz.ch/cvl/datasets_extra/food-101/tar.gz`

#### FoodNet Dataset
- **Source**: https://www.kaggle.com/datasets/trolukovich/food5k-image-dataset
- **Size**: 5,000 images across 5 food categories
- **Description**: Smaller dataset good for initial testing
- **Usage**: Quick prototyping and validation

#### UK Supermarket Product Database
- **Source**: Custom collection from supermarket APIs
- **Stores**: Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl
- **Data**: Product images, names, categories, nutritional info
- **Collection Method**: Web scraping + API integration

### Data Collection Strategy
1. **Download Food-101** as base dataset
2. **Collect UK-specific foods** from supermarket websites
3. **Augment with synthetic data** using GANs
4. **Create custom categories** for UK foods not in Food-101

## 2. Expiry Prediction Model

### Data Sources

#### UK Food Standards Agency
- **Source**: https://www.food.gov.uk/safety-hygiene/food-safety
- **Data**: Official food safety guidelines and expiry recommendations
- **Format**: PDF reports, web pages
- **Collection**: Web scraping + manual curation

#### NHS Food Storage Guidelines
- **Source**: https://www.nhs.uk/live-well/eat-well/how-to-store-food-and-leftovers/
- **Data**: Storage recommendations, temperature guidelines
- **Format**: Web pages
- **Collection**: Web scraping

#### User Behavior Data (Internal)
- **Source**: PantryPal app usage
- **Data**: Purchase dates, consumption patterns, storage conditions
- **Privacy**: Anonymized and aggregated
- **Collection**: App analytics

### Synthetic Data Generation
```python
# Example data structure
{
    'category': 'Dairy',
    'purchase_date': '2024-01-15',
    'storage_type': 'fridge',
    'storage_temp': 4.0,
    'package_quality': 0.9,
    'actual_expiry_date': '2024-01-22',
    'actual_days_until_expiry': 7
}
```

## 3. Waste Prediction Model

### Data Sources

#### UK Government Statistics
- **Source**: https://www.gov.uk/government/statistics/family-food-2019-to-2020
- **Data**: Household food consumption patterns, waste statistics
- **Format**: Excel/CSV files
- **Collection**: Direct download

#### WRAP (Waste & Resources Action Programme)
- **Source**: https://wrap.org.uk/resources/report/food-waste-reduction-roadmap-progress-report-2021
- **Data**: Food waste statistics, reduction strategies
- **Format**: PDF reports
- **Collection**: Manual extraction

#### User Behavior Patterns (Internal)
- **Source**: PantryPal app analytics
- **Data**: Purchase frequency, consumption rates, waste incidents
- **Privacy**: Fully anonymized
- **Collection**: App usage tracking

### Feature Engineering
```python
# User behavior features
- waste_rate (historical)
- consumption_speed
- category_preferences
- household_size
- budget_constraints
- seasonal_patterns

# Food characteristics
- perishability_score
- nutritional_density
- preparation_effort
- versatility_score
- brand_familiarity

# Environmental factors
- storage_conditions
- package_quality
- exposure_factors
```

## 4. Recommendation System

### Data Sources

#### Recipe Databases
- **BBC Good Food**: https://www.bbc.co.uk/food/recipes
- **AllRecipes**: https://www.allrecipes.com/
- **Collection Method**: Web scraping with proper attribution

#### Nutritional Databases
- **UK Composition of Foods**: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
- **USDA Food Database**: https://fdc.nal.usda.gov/
- **Format**: CSV/JSON files

#### User Preference Data (Internal)
- **Source**: PantryPal user interactions
- **Data**: Recipe ratings, dietary preferences, shopping patterns
- **Privacy**: Anonymized and aggregated

### Data Structure
```python
# Recipe data
{
    'recipe_id': '12345',
    'title': 'Spaghetti Carbonara',
    'ingredients': ['pasta', 'eggs', 'bacon', 'cheese'],
    'instructions': '...',
    'cooking_time': 20,
    'difficulty': 'easy',
    'nutritional_info': {...},
    'dietary_tags': ['vegetarian', 'gluten-free']
}

# User preference data
{
    'user_id': 'anonymous_123',
    'preferred_categories': ['Italian', 'Quick Meals'],
    'dietary_restrictions': ['vegetarian'],
    'cooking_skill': 'intermediate',
    'time_preference': 'under_30_min'
}
```

## 5. Data Collection Implementation

### Web Scraping Tools
```python
# Required packages
requests==2.31.0
beautifulsoup4==4.12.2
scrapy==2.10.0
selenium==4.15.0  # For JavaScript-heavy sites
```

### API Integration
```python
# Supermarket APIs (where available)
- Tesco API
- Sainsbury's API
- Asda API
- Morrisons API
```

### Data Storage
```python
# Database schema
- raw_data: Original scraped data
- processed_data: Cleaned and structured data
- training_data: ML-ready datasets
- validation_data: Test sets
```

## 6. Ethical Considerations

### Data Privacy
- **Anonymization**: Remove all personally identifiable information
- **Consent**: Clear user consent for data collection
- **GDPR Compliance**: Follow UK/EU data protection laws
- **Data Minimization**: Collect only necessary data

### Bias Mitigation
- **Diverse Sources**: Ensure representation across demographics
- **Fair Sampling**: Avoid bias toward certain food types
- **Regular Auditing**: Monitor for bias in recommendations

### Attribution
- **Proper Attribution**: Credit all data sources
- **Licensing**: Respect data usage licenses
- **Academic Use**: Ensure datasets are available for research

## 7. Implementation Timeline

### Week 1-2: Dataset Research and Collection
- [ ] Download Food-101 dataset
- [ ] Set up web scraping infrastructure
- [ ] Collect UK supermarket product data
- [ ] Gather food safety guidelines

### Week 3-4: Data Preprocessing
- [ ] Clean and structure collected data
- [ ] Create unified data schemas
- [ ] Generate synthetic data for missing categories
- [ ] Validate data quality

### Week 5-6: Model Training Preparation
- [ ] Split data into train/validation/test sets
- [ ] Create data loaders for each model
- [ ] Implement data augmentation strategies
- [ ] Set up model training infrastructure

## 8. Expected Dataset Sizes

| Model | Training Data | Validation Data | Test Data |
|-------|---------------|-----------------|-----------|
| Food Recognition | 80,000 images | 10,000 images | 11,000 images |
| Expiry Prediction | 8,000 records | 1,000 records | 1,000 records |
| Waste Prediction | 8,000 records | 1,000 records | 1,000 records |
| Recommendations | 50,000 recipes | 5,000 recipes | 5,000 recipes |

## 9. Quality Metrics

### Data Quality Checks
- **Completeness**: >95% of required fields populated
- **Accuracy**: Manual verification of sample data
- **Consistency**: Standardized formats and naming
- **Freshness**: Regular updates for dynamic data

### Model Performance Targets
- **Food Recognition**: >95% accuracy on UK foods
- **Expiry Prediction**: <2 days MAE for perishables
- **Waste Prediction**: >85% accuracy in identifying waste-prone items
- **Recommendations**: >80% user satisfaction rate

## 10. Future Data Collection

### Continuous Improvement
- **User Feedback**: Collect feedback on predictions
- **A/B Testing**: Test different model versions
- **Active Learning**: Retrain models with new data
- **Federated Learning**: Learn from user data without centralizing it

### Expansion Opportunities
- **International Markets**: Adapt for other countries
- **Specialized Diets**: Focus on specific dietary needs
- **Seasonal Patterns**: Capture seasonal food preferences
- **Cultural Foods**: Include diverse cultural cuisines
