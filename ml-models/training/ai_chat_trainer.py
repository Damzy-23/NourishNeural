#!/usr/bin/env python3
"""
AI Chat Assistant Trainer
Specializes the AI assistant for UK food knowledge and PantryPal functionality
Target: >80% user satisfaction rate
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
import logging
from typing import Dict, List, Tuple, Optional
import os
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UKFoodKnowledgeBase:
    """UK-specific food knowledge base for training"""
    
    def __init__(self):
        self.supermarkets = {
            'tesco': {
                'brands': ['Tesco Finest', 'Tesco Value', 'Tesco Free From', 'Tesco Organic'],
                'loyalty': 'Clubcard',
                'delivery': 'Tesco.com',
                'specialty_stores': ['Tesco Express', 'Tesco Extra', 'Tesco Metro'],
                'popular_items': ['Tesco Whole Milk', 'Tesco Chicken Breast', 'Tesco Bananas'],
                'price_range': 'mid-range',
                'quality': 'good',
                'locations': 'nationwide'
            },
            'sainsburys': {
                'brands': ["Sainsbury's Taste the Difference", "Sainsbury's Basics", "Sainsbury's Organic"],
                'loyalty': 'Nectar',
                'delivery': 'Sainsburys.co.uk',
                'specialty_stores': ["Sainsbury's Local", "Sainsbury's Central"],
                'popular_items': ["Sainsbury's Salmon", "Sainsbury's Bread", "Sainsbury's Vegetables"],
                'price_range': 'premium',
                'quality': 'high',
                'locations': 'nationwide'
            },
            'asda': {
                'brands': ['Asda Extra Special', 'Asda Smart Price', 'Asda Organic'],
                'loyalty': 'Asda Rewards',
                'delivery': 'Asda.com',
                'specialty_stores': ['Asda Superstore', 'Asda Supercentre'],
                'popular_items': ['Asda Milk', 'Asda Chicken', 'Asda Vegetables'],
                'price_range': 'budget',
                'quality': 'good',
                'locations': 'nationwide'
            },
            'morrisons': {
                'brands': ['Morrisons The Best', 'Morrisons Savers', 'Morrisons Organic'],
                'loyalty': 'Morrisons More',
                'delivery': 'Morrisons.com',
                'specialty_stores': ['Morrisons Daily', 'Morrisons M Local'],
                'popular_items': ['Morrisons Beef', 'Morrisons Fish', 'Morrisons Bakery'],
                'price_range': 'mid-range',
                'quality': 'good',
                'locations': 'nationwide'
            },
            'aldi': {
                'brands': ['Aldi Specially Selected', 'Aldi Everyday Essentials'],
                'loyalty': 'None',
                'delivery': 'Aldi.co.uk',
                'specialty_stores': ['Aldi'],
                'popular_items': ['Aldi Wine', 'Aldi Chocolate', 'Aldi Vegetables'],
                'price_range': 'budget',
                'quality': 'good',
                'locations': 'nationwide'
            },
            'lidl': {
                'brands': ['Lidl Deluxe', 'Lidl Essentials'],
                'loyalty': 'Lidl Plus',
                'delivery': 'Lidl.co.uk',
                'specialty_stores': ['Lidl'],
                'popular_items': ['Lidl Bakery', 'Lidl Vegetables', 'Lidl Meat'],
                'price_range': 'budget',
                'quality': 'good',
                'locations': 'nationwide'
            }
        }
        
        self.uk_food_culture = {
            'traditional_dishes': [
                'fish and chips', 'bangers and mash', 'roast beef', 'shepherd\'s pie',
                'cottage pie', 'bubble and squeak', 'full english breakfast',
                'sunday roast', 'beef wellington', 'yorkshire pudding'
            ],
            'seasonal_foods': {
                'spring': ['asparagus', 'rhubarb', 'spring onions', 'new potatoes', 'lamb'],
                'summer': ['strawberries', 'cherries', 'peaches', 'raspberries', 'cucumber'],
                'autumn': ['apples', 'pears', 'blackberries', 'squash', 'mushrooms'],
                'winter': ['brussels sprouts', 'parsnips', 'swede', 'kale', 'chestnuts']
            },
            'regional_specialties': {
                'england': ['cornish pasty', 'lancashire hotpot', 'yorkshire pudding'],
                'scotland': ['haggis', 'shortbread', 'cranachan'],
                'wales': ['welsh rarebit', 'cawl', 'welsh cakes'],
                'northern_ireland': ['ulster fry', 'champ', 'soda bread']
            }
        }
        
        self.nutritional_info = {
            'common_foods': {
                'chicken_breast': {'calories': 165, 'protein': 31, 'fat': 3.6, 'carbs': 0},
                'salmon': {'calories': 208, 'protein': 25, 'fat': 12, 'carbs': 0},
                'whole_milk': {'calories': 61, 'protein': 3.2, 'fat': 3.3, 'carbs': 4.7},
                'banana': {'calories': 89, 'protein': 1.1, 'fat': 0.3, 'carbs': 23},
                'brown_rice': {'calories': 111, 'protein': 2.6, 'fat': 0.9, 'carbs': 23},
                'eggs': {'calories': 155, 'protein': 13, 'fat': 11, 'carbs': 1.1}
            }
        }
        
        self.storage_guidelines = {
            'refrigerated': {
                'temperature': '2-4°C',
                'foods': ['dairy', 'meat', 'fish', 'leftovers', 'prepared_foods'],
                'duration': '1-7 days depending on food type'
            },
            'frozen': {
                'temperature': '-18°C or below',
                'foods': ['meat', 'fish', 'vegetables', 'bread', 'leftovers'],
                'duration': '3-12 months depending on food type'
            },
            'pantry': {
                'temperature': 'room temperature (15-25°C)',
                'foods': ['canned_goods', 'grains', 'pasta', 'cereals', 'oils'],
                'duration': 'months to years'
            }
        }

class ChatTrainingDataGenerator:
    """Generate training data for AI chat assistant"""
    
    def __init__(self, knowledge_base: UKFoodKnowledgeBase):
        self.kb = knowledge_base
        
    def generate_recipe_suggestions_data(self) -> List[Dict]:
        """Generate training data for recipe suggestions"""
        prompts = []
        
        # UK-specific recipe requests
        uk_ingredients = [
            'tesco chicken breast, potatoes, carrots',
            'sainsburys salmon, rice, broccoli',
            'morrisons mince, onions, pasta',
            'asda vegetables, quinoa, olive oil',
            'tesco eggs, milk, flour, cheese',
            'sainsburys beef, yorkshire pudding mix, vegetables'
        ]
        
        for ingredients in uk_ingredients:
            prompts.extend([
                {
                    'user_input': f'What can I make with {ingredients}?',
                    'expected_response': self._generate_recipe_response(ingredients),
                    'category': 'recipe_suggestion',
                    'supermarket': self._extract_supermarket(ingredients)
                },
                {
                    'user_input': f'Recipe ideas for {ingredients}?',
                    'expected_response': self._generate_recipe_response(ingredients),
                    'category': 'recipe_suggestion',
                    'supermarket': self._extract_supermarket(ingredients)
                },
                {
                    'user_input': f'Quick meal with {ingredients}?',
                    'expected_response': self._generate_quick_meal_response(ingredients),
                    'category': 'quick_meal',
                    'supermarket': self._extract_supermarket(ingredients)
                }
            ])
        
        return prompts
    
    def generate_nutrition_advice_data(self) -> List[Dict]:
        """Generate training data for nutritional advice"""
        prompts = []
        
        for food, nutrition in self.kb.nutritional_info['common_foods'].items():
            food_name = food.replace('_', ' ').title()
            
            prompts.extend([
                {
                    'user_input': f'What\'s the nutritional value of {food_name}?',
                    'expected_response': self._generate_nutrition_response(food, nutrition),
                    'category': 'nutrition_info'
                },
                {
                    'user_input': f'How many calories in {food_name}?',
                    'expected_response': f'{food_name} contains {nutrition["calories"]} calories per 100g.',
                    'category': 'calorie_info'
                },
                {
                    'user_input': f'Protein content in {food_name}?',
                    'expected_response': f'{food_name} has {nutrition["protein"]}g of protein per 100g.',
                    'category': 'protein_info'
                }
            ])
        
        return prompts
    
    def generate_shopping_advice_data(self) -> List[Dict]:
        """Generate training data for UK shopping advice"""
        prompts = []
        
        for supermarket, info in self.kb.supermarkets.items():
            supermarket_name = supermarket.title()
            
            prompts.extend([
                {
                    'user_input': f'Best deals at {supermarket_name}?',
                    'expected_response': self._generate_deals_response(supermarket, info),
                    'category': 'shopping_deals',
                    'supermarket': supermarket
                },
                {
                    'user_input': f'{supermarket_name} vs other supermarkets?',
                    'expected_response': self._generate_comparison_response(supermarket, info),
                    'category': 'supermarket_comparison',
                    'supermarket': supermarket
                },
                {
                    'user_input': f'What\'s good at {supermarket_name}?',
                    'expected_response': self._generate_recommendations_response(supermarket, info),
                    'category': 'supermarket_recommendations',
                    'supermarket': supermarket
                }
            ])
        
        return prompts
    
    def generate_storage_advice_data(self) -> List[Dict]:
        """Generate training data for food storage advice"""
        prompts = []
        
        for storage_type, info in self.kb.storage_guidelines.items():
            storage_name = storage_type.replace('_', ' ').title()
            
            prompts.extend([
                {
                    'user_input': f'How to store {storage_type} foods?',
                    'expected_response': self._generate_storage_response(storage_type, info),
                    'category': 'storage_advice',
                    'storage_type': storage_type
                },
                {
                    'user_input': f'What foods go in the {storage_type}?',
                    'expected_response': f'Foods for {storage_name} include: {", ".join(info["foods"])}. Store at {info["temperature"]} for {info["duration"]}.',
                    'category': 'storage_categories',
                    'storage_type': storage_type
                }
            ])
        
        return prompts
    
    def generate_seasonal_advice_data(self) -> List[Dict]:
        """Generate training data for seasonal food advice"""
        prompts = []
        
        for season, foods in self.kb.uk_food_culture['seasonal_foods'].items():
            prompts.extend([
                {
                    'user_input': f'What\'s in season in {season}?',
                    'expected_response': f'In {season}, look for: {", ".join(foods)}. These are at their best quality and often better value.',
                    'category': 'seasonal_foods'
                },
                {
                    'user_input': f'Best {season} vegetables?',
                    'expected_response': f'Top {season} vegetables include: {", ".join([f for f in foods if any(v in f for v in ["potatoes", "onions", "sprouts", "parsnips", "swede"])])}.',
                    'category': 'seasonal_vegetables'
                }
            ])
        
        return prompts
    
    def _generate_recipe_response(self, ingredients: str) -> str:
        """Generate recipe suggestion response"""
        supermarket = self._extract_supermarket(ingredients)
        
        responses = [
            f"With {ingredients}, you could make a delicious one-pan meal. Try roasting the protein with the vegetables at 200°C for 25-30 minutes, seasoned with herbs and olive oil.",
            f"Perfect for a quick dinner! Sauté the protein first, then add vegetables and cook until tender. Season with salt, pepper, and your favorite herbs.",
            f"Great combination! Try making a stir-fry - cook the protein first, then add vegetables and finish with a simple sauce of soy sauce, garlic, and ginger."
        ]
        
        if supermarket:
            responses.append(f"Since you're shopping at {supermarket.title()}, their fresh produce is excellent for this dish!")
        
        return responses[np.random.randint(len(responses))]
    
    def _generate_quick_meal_response(self, ingredients: str) -> str:
        """Generate quick meal response"""
        return f"For a quick meal with {ingredients}, try a 15-minute stir-fry or one-pan dish. Cook everything together with simple seasonings for maximum flavor and minimal time!"
    
    def _generate_nutrition_response(self, food: str, nutrition: Dict) -> str:
        """Generate nutrition information response"""
        food_name = food.replace('_', ' ').title()
        return f"{food_name} per 100g: {nutrition['calories']} calories, {nutrition['protein']}g protein, {nutrition['fat']}g fat, {nutrition['carbs']}g carbs. It's a great source of protein and nutrients!"
    
    def _generate_deals_response(self, supermarket: str, info: Dict) -> str:
        """Generate deals response"""
        return f"{supermarket.title()} typically offers good value, especially with their {info['brands'][1]} range. Check their weekly deals on fresh produce and meat. Their loyalty scheme ({info['loyalty']}) can save you money on regular purchases."
    
    def _generate_comparison_response(self, supermarket: str, info: Dict) -> str:
        """Generate supermarket comparison response"""
        return f"{supermarket.title()} is known for {info['quality']} quality at {info['price_range']} prices. Compared to other major UK supermarkets, they offer good value, especially with their {info['brands'][1]} range."
    
    def _generate_recommendations_response(self, supermarket: str, info: Dict) -> str:
        """Generate recommendations response"""
        return f"At {supermarket.title()}, I recommend trying their {info['brands'][0]} range for premium quality, or {info['brands'][1]} for great value. Their {info['popular_items'][0]} is particularly good quality."
    
    def _generate_storage_response(self, storage_type: str, info: Dict) -> str:
        """Generate storage advice response"""
        storage_name = storage_type.replace('_', ' ').title()
        return f"For {storage_name} storage: maintain temperature at {info['temperature']}. Suitable foods include {', '.join(info['foods'][:3])} and more. Generally lasts {info['duration']}."
    
    def _extract_supermarket(self, text: str) -> Optional[str]:
        """Extract supermarket name from text"""
        text_lower = text.lower()
        for supermarket in self.kb.supermarkets.keys():
            if supermarket in text_lower:
                return supermarket
        return None

class AIChatTrainer:
    """Trainer for AI chat assistant"""
    
    def __init__(self, knowledge_base: UKFoodKnowledgeBase):
        self.kb = knowledge_base
        self.data_generator = ChatTrainingDataGenerator(knowledge_base)
        
    def generate_training_dataset(self) -> pd.DataFrame:
        """Generate comprehensive training dataset"""
        logger.info("Generating training dataset for AI chat assistant")
        
        all_data = []
        
        # Generate different types of training data
        all_data.extend(self.data_generator.generate_recipe_suggestions_data())
        all_data.extend(self.data_generator.generate_nutrition_advice_data())
        all_data.extend(self.data_generator.generate_shopping_advice_data())
        all_data.extend(self.data_generator.generate_storage_advice_data())
        all_data.extend(self.data_generator.generate_seasonal_advice_data())
        
        # Add UK-specific context
        for item in all_data:
            item['context'] = 'uk_food_assistant'
            item['currency'] = 'GBP'
            item['measurement_system'] = 'metric'
            item['date_format'] = 'DD/MM/YYYY'
        
        df = pd.DataFrame(all_data)
        logger.info(f"Generated {len(df)} training examples")
        
        return df
    
    def create_response_templates(self) -> Dict[str, str]:
        """Create response templates for different categories"""
        templates = {
            'recipe_suggestion': """Based on your ingredients: {ingredients}, here are some UK-friendly recipe ideas:

1. **One-Pan Roast**: Perfect for British weather - roast everything together with herbs and olive oil
2. **Quick Stir-Fry**: Fast and healthy option, great for busy weeknights
3. **Traditional British**: Add some traditional UK seasonings for a classic taste

Cooking tips: Most UK supermarkets have excellent fresh produce. Consider seasonal availability for best value!""",

            'nutrition_info': """Here's the nutritional breakdown for {food}:

**Per 100g:**
- Calories: {calories}
- Protein: {protein}g
- Fat: {fat}g  
- Carbs: {carbs}g

This is based on UK nutritional standards. For more detailed info, check the label on products from UK supermarkets.""",

            'shopping_advice': """For {supermarket} shopping:

**Best Deals**: {deals_info}
**Quality**: {quality_info}
**Loyalty**: {loyalty_info}

**UK Shopping Tips**:
- Shop early for best selection
- Check weekly deals on fresh produce
- Use loyalty schemes for savings
- Consider seasonal availability for better prices""",

            'storage_advice': """Storage advice for {food_type}:

**Temperature**: {temperature}
**Duration**: {duration}
**Tips**: {tips}

**UK Storage Guidelines**:
- Keep refrigerated foods at 2-4°C
- Freeze at -18°C or below
- Store pantry items in cool, dry places
- Follow "use by" dates for safety"""
        }
        
        return templates
    
    def train_response_classifier(self, df: pd.DataFrame):
        """Train a simple response classifier (placeholder for more sophisticated models)"""
        logger.info("Training response classifier")
        
        # Simple keyword-based classification (in practice, use more sophisticated NLP)
        def classify_intent(text):
            text_lower = text.lower()
            
            if any(word in text_lower for word in ['recipe', 'make', 'cook', 'dish']):
                return 'recipe_suggestion'
            elif any(word in text_lower for word in ['nutrition', 'calories', 'protein', 'healthy']):
                return 'nutrition_info'
            elif any(word in text_lower for word in ['shop', 'buy', 'supermarket', 'store']):
                return 'shopping_advice'
            elif any(word in text_lower for word in ['store', 'keep', 'fresh', 'expire']):
                return 'storage_advice'
            elif any(word in text_lower for word in ['season', 'fresh', 'available']):
                return 'seasonal_advice'
            else:
                return 'general_advice'
        
        df['predicted_intent'] = df['user_input'].apply(classify_intent)
        
        # Calculate accuracy
        accuracy = (df['predicted_intent'] == df['category']).mean()
        logger.info(f"Intent classification accuracy: {accuracy:.3f}")
        
        return df
    
    def evaluate_training_data(self, df: pd.DataFrame):
        """Evaluate the quality of training data"""
        logger.info("Evaluating training data quality")
        
        # Basic statistics
        stats = {
            'total_examples': len(df),
            'categories': df['category'].value_counts().to_dict(),
            'supermarkets_covered': df['supermarket'].value_counts().to_dict() if 'supermarket' in df.columns else {},
            'avg_response_length': df['expected_response'].str.len().mean(),
            'uk_context_coverage': (df['context'] == 'uk_food_assistant').mean()
        }
        
        logger.info(f"Training data statistics: {json.dumps(stats, indent=2)}")
        
        return stats
    
    def save_training_data(self, df: pd.DataFrame, output_path: str):
        """Save training data for model training"""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as CSV
        df.to_csv(output_path, index=False)
        
        # Save as JSON for easier loading
        json_path = output_path.replace('.csv', '.json')
        df.to_json(json_path, orient='records', indent=2)
        
        # Save templates
        templates = self.create_response_templates()
        templates_path = output_path.replace('.csv', '_templates.json')
        with open(templates_path, 'w') as f:
            json.dump(templates, f, indent=2)
        
        logger.info(f"Training data saved to {output_path}")
        logger.info(f"Templates saved to {templates_path}")
    
    def generate_fine_tuning_data(self) -> List[Dict]:
        """Generate data for fine-tuning language models"""
        logger.info("Generating fine-tuning data for language models")
        
        fine_tuning_data = []
        
        # System prompt
        system_prompt = """You are PantryPal, a specialized UK food assistant. You help users with:
- Recipe suggestions using UK supermarket ingredients
- Nutritional advice for British foods
- Shopping tips for UK supermarkets (Tesco, Sainsbury's, Asda, Morrisons, Aldi, Lidl)
- Food storage and safety advice
- Seasonal eating recommendations

Always provide practical, UK-focused advice with specific supermarket recommendations when relevant. Use British English spelling and measurements (metric system)."""
        
        # Generate conversation examples
        df = self.generate_training_dataset()
        
        for _, row in df.iterrows():
            conversation = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": row['user_input']},
                    {"role": "assistant", "content": row['expected_response']}
                ]
            }
            fine_tuning_data.append(conversation)
        
        logger.info(f"Generated {len(fine_tuning_data)} conversation examples for fine-tuning")
        
        return fine_tuning_data

def main():
    """Main function to generate AI chat training data"""
    logger.info("Starting AI Chat Assistant training data generation")
    
    # Initialize knowledge base and trainer
    kb = UKFoodKnowledgeBase()
    trainer = AIChatTrainer(kb)
    
    # Generate training dataset
    df = trainer.generate_training_dataset()
    
    # Train response classifier
    df = trainer.train_response_classifier(df)
    
    # Evaluate training data
    stats = trainer.evaluate_training_data(df)
    
    # Save training data
    trainer.save_training_data(df, 'data/training/ai_chat_training_data.csv')
    
    # Generate fine-tuning data
    fine_tuning_data = trainer.generate_fine_tuning_data()
    
    # Save fine-tuning data
    with open('data/training/ai_chat_fine_tuning.json', 'w') as f:
        json.dump(fine_tuning_data, f, indent=2)
    
    logger.info("AI Chat Assistant training data generation completed!")
    logger.info(f"Generated {len(df)} training examples")
    logger.info(f"Generated {len(fine_tuning_data)} fine-tuning conversations")
    
    # Check if we have sufficient data for target performance
    target_examples = 1000
    if len(df) >= target_examples:
        logger.info(f"✅ Sufficient training data generated ({len(df)} >= {target_examples})")
        logger.info("Ready for model training to achieve >80% user satisfaction target")
    else:
        logger.info(f"⚠️ May need more training data ({len(df)} < {target_examples})")
        logger.info("Consider generating additional examples for better performance")

if __name__ == "__main__":
    main()
