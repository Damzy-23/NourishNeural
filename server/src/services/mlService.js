const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class MLService {
  constructor() {
    this.modelsPath = path.join(__dirname, '../../../ml-models');
    this.pythonPath = 'python'; // Adjust if needed for your Python installation
  }

  /**
   * Predict food expiry date
   */
  async predictExpiry(foodItem) {
    try {
      const pythonScript = path.join(this.modelsPath, 'predict_expiry.py');
      
      // Create a temporary script for this prediction
      const script = `
import sys
import os
sys.path.append(r'${this.modelsPath.replace(/\\/g, '/')}/src')

from models.simple_models import SimpleExpiryPredictor
import json

# Initialize model
model = SimpleExpiryPredictor()

# Prepare input data
food_item = ${JSON.stringify(foodItem)}

# Make prediction
prediction = model.predict_expiry(food_item)

# Return result
result = {
    'expiry_days': prediction,
    'confidence': 0.90,
    'category': food_item.get('category', 'Unknown')
}

print(json.dumps(result))
`;

      const result = await this.runPythonScript(script);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error predicting expiry:', error);
      // Fallback to simple rule-based prediction
      return this.fallbackExpiryPrediction(foodItem);
    }
  }

  /**
   * Predict waste probability
   */
  async predictWaste(userHistory, foodItem) {
    try {
      const pythonScript = `
import sys
import os
sys.path.append(r'${this.modelsPath.replace(/\\/g, '/')}/src')

from models.simple_models import SimpleWastePredictor
import json

# Initialize model
model = SimpleWastePredictor()

# Prepare input data
user_history = ${JSON.stringify(userHistory)}
food_item = ${JSON.stringify(foodItem)}

# Make prediction
prediction = model.predict_waste_probability(user_history, food_item)

# Determine risk level
if prediction > 0.6:
    risk_level = 'High'
elif prediction > 0.4:
    risk_level = 'Medium'
else:
    risk_level = 'Low'

# Return result
result = {
    'waste_probability': prediction,
    'risk_level': risk_level,
    'confidence': 0.85
}

print(json.dumps(result))
`;

      const result = await this.runPythonScript(pythonScript);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error predicting waste:', error);
      // Fallback to simple rule-based prediction
      return this.fallbackWastePrediction(userHistory, foodItem);
    }
  }

  /**
   * Classify food item
   */
  async classifyFood(foodName) {
    try {
      const pythonScript = `
import sys
import os
sys.path.append(r'${this.modelsPath.replace(/\\/g, '/')}/src')

from models.simple_models import SimpleFoodClassifier
import json

# Initialize model
classifier = SimpleFoodClassifier()

# Make prediction
prediction = classifier.classify_food('${foodName}')

# Return result
result = {
    'category': prediction,
    'confidence': 0.60,
    'food_name': '${foodName}'
}

print(json.dumps(result))
`;

      const result = await this.runPythonScript(pythonScript);
      return JSON.parse(result);
    } catch (error) {
      console.error('Error classifying food:', error);
      // Fallback to keyword-based classification
      return this.fallbackFoodClassification(foodName);
    }
  }

  /**
   * Run Python script and return output
   */
  runPythonScript(script) {
    return new Promise((resolve, reject) => {
      const python = spawn(this.pythonPath, ['-c', script], {
        cwd: this.modelsPath
      });

      let output = '';
      let error = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Python script failed: ${error}`));
        }
      });
    });
  }

  /**
   * Enhanced fallback expiry prediction using comprehensive rules
   */
  fallbackExpiryPrediction(foodItem) {
    const category = foodItem.category || 'Unknown';
    const storageType = foodItem.storage_type || 'fridge';
    const purchaseDate = foodItem.purchase_date ? new Date(foodItem.purchase_date) : new Date();
    const daysSincePurchase = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
    
    // Enhanced expiry rules with storage considerations
    const expiryRules = {
      'Dairy': {
        fridge: 7,
        freezer: 90,
        room: 2,
        confidence: 0.8,
        tips: 'Keep refrigerated at 4°C or below, check for sour smell'
      },
      'Meat': {
        fridge: 3,
        freezer: 270,
        room: 1,
        confidence: 0.75,
        tips: 'Store on bottom shelf, separate from other foods'
      },
      'Fish': {
        fridge: 2,
        freezer: 90,
        room: 0.5,
        confidence: 0.8,
        tips: 'Use within 1-2 days, store in coldest part of fridge'
      },
      'Vegetables': {
        fridge: 7,
        freezer: 180,
        room: 3,
        confidence: 0.7,
        tips: 'Store in crisper drawer, remove plastic bags'
      },
      'Fruits': {
        fridge: 10,
        freezer: 180,
        room: 5,
        confidence: 0.75,
        tips: 'Some ripen on counter, then refrigerate'
      },
      'Bakery': {
        fridge: 5,
        freezer: 90,
        room: 3,
        confidence: 0.7,
        tips: 'Store at room temperature, freeze if not using soon'
      },
      'Pantry': {
        fridge: 365,
        freezer: 730,
        room: 365,
        confidence: 0.9,
        tips: 'Store in cool, dry place away from light'
      },
      'Frozen': {
        fridge: 7,
        freezer: 365,
        room: 2,
        confidence: 0.95,
        tips: 'Keep frozen at -18°C, use within 3-6 months for best quality'
      },
      'Beverages': {
        fridge: 30,
        freezer: 365,
        room: 90,
        confidence: 0.8,
        tips: 'Store in cool, dry place, refrigerate after opening'
      },
      'Eggs': {
        fridge: 28,
        freezer: 365,
        room: 7,
        confidence: 0.9,
        tips: 'Store in original carton in fridge, not in door'
      },
      'Herbs': {
        fridge: 7,
        freezer: 180,
        room: 3,
        confidence: 0.7,
        tips: 'Store in water like flowers, or freeze in oil'
      }
    };

    const rule = expiryRules[category] || expiryRules['Pantry'];
    let expiryDays = rule[storageType] || rule.fridge;
    
    // Adjust based on days since purchase
    if (daysSincePurchase > 0) {
      expiryDays = Math.max(1, expiryDays - daysSincePurchase);
    }

    return {
      expiry_days: expiryDays,
      confidence: rule.confidence,
      category: category,
      method: 'fallback',
      storage_tip: rule.tips,
      days_since_purchase: daysSincePurchase
    };
  }

  /**
   * Enhanced fallback waste prediction using comprehensive rules
   */
  fallbackWastePrediction(userHistory, foodItem) {
    const category = foodItem.category || 'Unknown';
    const storageType = foodItem.storage_type || 'fridge';
    const purchaseDate = foodItem.purchase_date ? new Date(foodItem.purchase_date) : new Date();
    const daysSincePurchase = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
    const estimatedPrice = foodItem.estimated_price || 3.00;
    
    // Enhanced waste rates by category with storage considerations
    const wasteData = {
      'Dairy': {
        baseRate: 0.18,
        fridge: 0.15,
        freezer: 0.05,
        room: 0.35,
        factors: ['temperature_sensitive', 'short_lifespan'],
        advice: 'Monitor expiry dates closely, freeze if not using soon'
      },
      'Meat': {
        baseRate: 0.28,
        fridge: 0.25,
        freezer: 0.08,
        room: 0.60,
        factors: ['high_value', 'temperature_critical'],
        advice: 'Use within 2-3 days or freeze immediately'
      },
      'Fish': {
        baseRate: 0.35,
        fridge: 0.30,
        freezer: 0.10,
        room: 0.80,
        factors: ['very_short_lifespan', 'high_value'],
        advice: 'Use within 1-2 days, store in coldest part of fridge'
      },
      'Vegetables': {
        baseRate: 0.42,
        fridge: 0.35,
        freezer: 0.15,
        room: 0.50,
        factors: ['variable_quality', 'seasonal'],
        advice: 'Store properly, use root vegetables first'
      },
      'Fruits': {
        baseRate: 0.38,
        fridge: 0.30,
        freezer: 0.12,
        room: 0.45,
        factors: ['ripening_process', 'bruising_sensitive'],
        advice: 'Monitor ripeness, freeze overripe fruits'
      },
      'Bakery': {
        baseRate: 0.22,
        fridge: 0.25,
        freezer: 0.08,
        room: 0.20,
        factors: ['staling', 'mold_susceptible'],
        advice: 'Freeze bread, store in cool dry place'
      },
      'Pantry': {
        baseRate: 0.08,
        fridge: 0.05,
        freezer: 0.02,
        room: 0.10,
        factors: ['long_shelf_life', 'stable'],
        advice: 'Store in airtight containers, check for pests'
      },
      'Frozen': {
        baseRate: 0.12,
        fridge: 0.40,
        freezer: 0.08,
        room: 0.70,
        factors: ['freezer_burn', 'temperature_dependent'],
        advice: 'Keep frozen solid, use within recommended time'
      },
      'Beverages': {
        baseRate: 0.06,
        fridge: 0.05,
        freezer: 0.02,
        room: 0.08,
        factors: ['long_shelf_life', 'preservatives'],
        advice: 'Refrigerate after opening, check for off flavors'
      },
      'Eggs': {
        baseRate: 0.10,
        fridge: 0.08,
        freezer: 0.05,
        room: 0.25,
        factors: ['shell_protection', 'temperature_sensitive'],
        advice: 'Store in original carton, check for cracks'
      },
      'Herbs': {
        baseRate: 0.45,
        fridge: 0.40,
        freezer: 0.15,
        room: 0.60,
        factors: ['wilting', 'flavor_loss'],
        advice: 'Store in water like flowers, freeze in oil'
      }
    };

    const data = wasteData[category] || wasteData['Pantry'];
    let baseProbability = data[storageType] || data.baseRate;
    
    // Adjust based on days since purchase
    if (daysSincePurchase > 0) {
      const ageMultiplier = 1 + (daysSincePurchase * 0.05); // 5% increase per day
      baseProbability = Math.min(0.9, baseProbability * ageMultiplier);
    }
    
    // Adjust based on user history
    let historyAdjustment = 0;
    if (userHistory && userHistory.length > 0) {
      const recentWaste = userHistory.slice(-10).filter(item => item.was_wasted).length;
      const userWasteRate = recentWaste / Math.min(10, userHistory.length);
      historyAdjustment = (userWasteRate - 0.2) * 0.3; // Adjust based on user's waste patterns
    }

    // Adjust based on estimated price (higher value = more attention = less waste)
    const priceAdjustment = estimatedPrice > 5 ? -0.05 : estimatedPrice < 2 ? 0.05 : 0;

    const finalProbability = Math.min(0.9, Math.max(0.05, 
      baseProbability + historyAdjustment + priceAdjustment
    ));
    
    let riskLevel = 'Low';
    let riskAdvice = '';
    
    if (finalProbability > 0.6) {
      riskLevel = 'High';
      riskAdvice = 'Use immediately or freeze to prevent waste';
    } else if (finalProbability > 0.4) {
      riskLevel = 'Medium';
      riskAdvice = 'Plan to use within 2-3 days, consider meal planning';
    } else {
      riskLevel = 'Low';
      riskAdvice = 'Monitor expiry date, plan normal usage';
    }

    return {
      waste_probability: parseFloat(finalProbability.toFixed(2)),
      risk_level: riskLevel,
      confidence: 0.75,
      method: 'fallback',
      advice: data.advice,
      risk_advice: riskAdvice,
      factors: data.factors,
      days_since_purchase: daysSincePurchase
    };
  }

  /**
   * Enhanced fallback food classification using comprehensive keyword matching
   */
  fallbackFoodClassification(foodName) {
    const name = foodName.toLowerCase().trim();
    
    // Comprehensive classification database
    const classificationDatabase = {
      'Dairy': {
        keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'feta', 'brie', 'camembert'],
        confidence: 0.85,
        subcategories: ['liquid_dairy', 'aged_dairy', 'fresh_dairy', 'fermented_dairy']
      },
      'Eggs': {
        keywords: ['egg', 'eggs', 'quail egg', 'duck egg'],
        confidence: 0.90,
        subcategories: ['fresh_eggs', 'free_range_eggs', 'organic_eggs']
      },
      'Meat': {
        keywords: ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'ham', 'bacon', 'sausage', 'steak', 'chop', 'roast', 'mince', 'ground'],
        confidence: 0.85,
        subcategories: ['poultry', 'red_meat', 'processed_meat', 'organic_meat']
      },
      'Fish': {
        keywords: ['salmon', 'fish', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'trout', 'seabass', 'prawns', 'shrimp', 'crab', 'lobster', 'mussels', 'oysters'],
        confidence: 0.80,
        subcategories: ['oily_fish', 'white_fish', 'shellfish', 'smoked_fish']
      },
      'Vegetables': {
        keywords: ['tomato', 'lettuce', 'carrot', 'onion', 'potato', 'broccoli', 'spinach', 'cabbage', 'pepper', 'cucumber', 'celery', 'mushroom', 'aubergine', 'courgette', 'beetroot', 'turnip', 'parsnip', 'leek', 'garlic', 'ginger'],
        confidence: 0.80,
        subcategories: ['leafy_greens', 'root_vegetables', 'nightshades', 'cruciferous', 'alliums']
      },
      'Fruits': {
        keywords: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'pear', 'peach', 'plum', 'cherry', 'lemon', 'lime', 'mango', 'pineapple', 'kiwi', 'avocado', 'coconut', 'melon'],
        confidence: 0.80,
        subcategories: ['tree_fruits', 'berries', 'citrus_fruits', 'tropical_fruits', 'stone_fruits']
      },
      'Bakery': {
        keywords: ['bread', 'cake', 'pastry', 'croissant', 'baguette', 'roll', 'muffin', 'scone', 'biscuit', 'cookie', 'cracker', 'pita', 'naan', 'tortilla'],
        confidence: 0.80,
        subcategories: ['fresh_bread', 'sweet_bakery', 'savory_bakery', 'artisan_bread']
      },
      'Pantry': {
        keywords: ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'beans', 'lentils', 'quinoa', 'barley', 'oats', 'cereal', 'nuts', 'seeds', 'herbs', 'spices', 'sauce', 'stock', 'broth'],
        confidence: 0.75,
        subcategories: ['grains', 'legumes', 'cooking_oils', 'condiments', 'baking_ingredients']
      },
      'Frozen': {
        keywords: ['frozen', 'ice cream', 'frozen vegetables', 'frozen fruit', 'frozen meat', 'frozen fish'],
        confidence: 0.90,
        subcategories: ['frozen_produce', 'frozen_meals', 'frozen_desserts', 'frozen_meat']
      },
      'Beverages': {
        keywords: ['water', 'juice', 'coffee', 'tea', 'soda', 'beer', 'wine', 'milk drink', 'smoothie', 'energy drink'],
        confidence: 0.80,
        subcategories: ['hot_beverages', 'cold_beverages', 'alcoholic_beverages', 'fruit_juices']
      },
      'Herbs': {
        keywords: ['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'mint', 'sage', 'dill', 'chives', 'bay leaves', 'tarragon'],
        confidence: 0.85,
        subcategories: ['fresh_herbs', 'dried_herbs', 'culinary_herbs', 'medicinal_herbs']
      },
      'Snacks': {
        keywords: ['chips', 'crisps', 'chocolate', 'sweets', 'nuts', 'popcorn', 'crackers', 'dried fruit', 'trail mix'],
        confidence: 0.75,
        subcategories: ['sweet_snacks', 'savory_snacks', 'healthy_snacks', 'indulgent_snacks']
      }
    };

    // Find best match
    let bestMatch = { category: 'Unknown', confidence: 0.50, subcategory: 'unknown' };
    let maxConfidence = 0;

    for (const [category, data] of Object.entries(classificationDatabase)) {
      for (const keyword of data.keywords) {
        if (name.includes(keyword)) {
          if (data.confidence > maxConfidence) {
            maxConfidence = data.confidence;
            bestMatch = {
              category: category,
              confidence: data.confidence,
              subcategory: data.subcategories[0],
              method: 'fallback',
              matched_keyword: keyword
            };
          }
        }
      }
    }

    // If no match found, try partial matching
    if (bestMatch.category === 'Unknown') {
      for (const [category, data] of Object.entries(classificationDatabase)) {
        for (const keyword of data.keywords) {
          if (keyword.includes(name) || name.includes(keyword.substring(0, 3))) {
            bestMatch = {
              category: category,
              confidence: data.confidence * 0.7, // Lower confidence for partial match
              subcategory: data.subcategories[0],
              method: 'fallback',
              matched_keyword: keyword
            };
            break;
          }
        }
        if (bestMatch.category !== 'Unknown') break;
      }
    }

    return bestMatch;
  }
}

module.exports = new MLService();
