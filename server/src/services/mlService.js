/**
 * ML Service
 *
 * Provides rule-based predictions for expiry, waste, and food classification.
 * Image-based classification uses the trained MobileNetV3 model via classify_image.py
 * (called directly from the /api/ml/classify-image route).
 */

class MLService {
  /**
   * Predict food expiry date (rule-based)
   */
  async predictExpiry(foodItem) {
    const category = foodItem.category || 'Unknown';
    const storageType = foodItem.storage_type || 'fridge';
    const purchaseDate = foodItem.purchase_date ? new Date(foodItem.purchase_date) : new Date();
    const daysSincePurchase = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));

    const expiryRules = {
      'Dairy': { fridge: 7, freezer: 90, room: 2, confidence: 0.8, tips: 'Keep refrigerated at 4°C or below' },
      'Meat': { fridge: 3, freezer: 270, room: 1, confidence: 0.75, tips: 'Store on bottom shelf, separate from other foods' },
      'Fish': { fridge: 2, freezer: 90, room: 0.5, confidence: 0.8, tips: 'Use within 1-2 days' },
      'Vegetables': { fridge: 7, freezer: 180, room: 3, confidence: 0.7, tips: 'Store in crisper drawer' },
      'Fruits': { fridge: 10, freezer: 180, room: 5, confidence: 0.75, tips: 'Some ripen on counter, then refrigerate' },
      'Bakery': { fridge: 5, freezer: 90, room: 3, confidence: 0.7, tips: 'Freeze if not using soon' },
      'Pantry': { fridge: 365, freezer: 730, room: 365, confidence: 0.9, tips: 'Store in cool, dry place' },
      'Frozen': { fridge: 7, freezer: 365, room: 2, confidence: 0.95, tips: 'Keep frozen at -18°C' },
      'Beverages': { fridge: 30, freezer: 365, room: 90, confidence: 0.8, tips: 'Refrigerate after opening' },
      'Eggs': { fridge: 28, freezer: 365, room: 7, confidence: 0.9, tips: 'Store in original carton in fridge' },
      'Herbs': { fridge: 7, freezer: 180, room: 3, confidence: 0.7, tips: 'Store in water or freeze in oil' },
      'General': { fridge: 14, freezer: 180, room: 7, confidence: 0.6, tips: 'Check packaging for storage instructions' }
    };

    const rule = expiryRules[category] || expiryRules['General'];
    let expiryDays = rule[storageType] || rule.fridge;

    if (daysSincePurchase > 0) {
      expiryDays = Math.max(1, expiryDays - daysSincePurchase);
    }

    return {
      expiry_days: expiryDays,
      confidence: rule.confidence,
      category,
      storage_tip: rule.tips,
      days_since_purchase: daysSincePurchase
    };
  }

  /**
   * Predict waste probability (rule-based)
   */
  async predictWaste(userHistory, foodItem) {
    const category = foodItem.category || 'Unknown';
    const storageType = foodItem.storage_type || 'fridge';
    const purchaseDate = foodItem.purchase_date ? new Date(foodItem.purchase_date) : new Date();
    const daysSincePurchase = Math.floor((new Date() - purchaseDate) / (1000 * 60 * 60 * 24));
    const estimatedPrice = foodItem.estimated_price || 3.00;

    const wasteData = {
      'Dairy': { fridge: 0.15, freezer: 0.05, room: 0.35, advice: 'Monitor expiry dates closely' },
      'Meat': { fridge: 0.25, freezer: 0.08, room: 0.60, advice: 'Use within 2-3 days or freeze' },
      'Fish': { fridge: 0.30, freezer: 0.10, room: 0.80, advice: 'Use within 1-2 days' },
      'Vegetables': { fridge: 0.35, freezer: 0.15, room: 0.50, advice: 'Use root veg first' },
      'Fruits': { fridge: 0.30, freezer: 0.12, room: 0.45, advice: 'Freeze overripe fruits' },
      'Bakery': { fridge: 0.25, freezer: 0.08, room: 0.20, advice: 'Freeze bread if not using soon' },
      'Pantry': { fridge: 0.05, freezer: 0.02, room: 0.10, advice: 'Store in airtight containers' },
      'Frozen': { fridge: 0.40, freezer: 0.08, room: 0.70, advice: 'Keep frozen solid' },
      'Beverages': { fridge: 0.05, freezer: 0.02, room: 0.08, advice: 'Refrigerate after opening' },
      'Eggs': { fridge: 0.08, freezer: 0.05, room: 0.25, advice: 'Store in original carton' },
      'Herbs': { fridge: 0.40, freezer: 0.15, room: 0.60, advice: 'Store in water or freeze in oil' },
      'General': { fridge: 0.20, freezer: 0.10, room: 0.30, advice: 'Check use-by dates regularly' }
    };

    const data = wasteData[category] || wasteData['General'];
    let baseProbability = data[storageType] || data.fridge;

    // Age adjustment
    if (daysSincePurchase > 0) {
      baseProbability = Math.min(0.9, baseProbability * (1 + daysSincePurchase * 0.05));
    }

    // User history adjustment
    if (userHistory && userHistory.length > 0) {
      const recentWaste = userHistory.slice(-10).filter(item => item.was_wasted).length;
      const userWasteRate = recentWaste / Math.min(10, userHistory.length);
      baseProbability += (userWasteRate - 0.2) * 0.3;
    }

    // Price adjustment
    if (estimatedPrice > 5) baseProbability -= 0.05;
    else if (estimatedPrice < 2) baseProbability += 0.05;

    const finalProbability = Math.min(0.9, Math.max(0.05, baseProbability));

    let riskLevel, riskAdvice;
    if (finalProbability > 0.6) {
      riskLevel = 'High';
      riskAdvice = 'Use immediately or freeze';
    } else if (finalProbability > 0.4) {
      riskLevel = 'Medium';
      riskAdvice = 'Plan to use within 2-3 days';
    } else {
      riskLevel = 'Low';
      riskAdvice = 'Monitor expiry date';
    }

    return {
      waste_probability: parseFloat(finalProbability.toFixed(2)),
      risk_level: riskLevel,
      confidence: 0.75,
      advice: data.advice,
      risk_advice: riskAdvice,
      days_since_purchase: daysSincePurchase
    };
  }

  /**
   * Classify food by name (keyword matching)
   */
  async classifyFood(foodName) {
    const name = foodName.toLowerCase().trim();

    const categories = {
      'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'cottage cheese', 'mozzarella', 'cheddar', 'parmesan', 'ricotta', 'feta', 'brie'],
      'Eggs': ['egg', 'eggs', 'quail egg', 'duck egg'],
      'Meat': ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'ham', 'bacon', 'sausage', 'steak', 'mince'],
      'Fish': ['salmon', 'fish', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'trout', 'prawns', 'shrimp', 'crab'],
      'Vegetables': ['tomato', 'lettuce', 'carrot', 'onion', 'potato', 'broccoli', 'spinach', 'cabbage', 'pepper', 'cucumber', 'mushroom', 'courgette', 'leek', 'garlic'],
      'Fruits': ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'pear', 'peach', 'mango', 'pineapple', 'kiwi', 'avocado', 'lemon'],
      'Bakery': ['bread', 'cake', 'pastry', 'croissant', 'baguette', 'roll', 'muffin', 'scone', 'biscuit', 'cookie', 'naan', 'tortilla'],
      'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'beans', 'lentils', 'oats', 'cereal', 'nuts', 'sauce'],
      'Frozen': ['frozen', 'ice cream'],
      'Beverages': ['water', 'juice', 'coffee', 'tea', 'soda', 'beer', 'wine', 'smoothie'],
      'Herbs': ['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'mint', 'sage', 'dill', 'chives']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (name.includes(keyword)) {
          return { category, confidence: 0.85, food_name: foodName, matched_keyword: keyword };
        }
      }
    }

    // Partial match fallback
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (keyword.includes(name) || name.includes(keyword.substring(0, 3))) {
          return { category, confidence: 0.6, food_name: foodName, matched_keyword: keyword };
        }
      }
    }

    return { category: 'General', confidence: 0.5, food_name: foodName };
  }
}

module.exports = new MLService();
