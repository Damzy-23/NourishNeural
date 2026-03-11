import sys
import json
import os
import numpy as np

# Add the ml-models directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

class NumpyEncoder(json.JSONEncoder):
    """JSON encoder that handles numpy types."""
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

from src.models.waste_prediction import WastePredictionModel

MODEL_PATH = os.path.join(current_dir, 'models', 'waste_predictor')

# Category-based shelf life estimates (days)
SHELF_LIFE = {
    'Dairy': 7, 'Meat': 3, 'Fish': 2, 'Vegetables': 5, 'Fruits': 5,
    'Bakery': 4, 'Pantry': 180, 'Frozen': 90, 'Beverages': 30, 'Snacks': 60
}

def rule_based_prediction(food_item):
    """Simple heuristic when ML models are unavailable."""
    category = food_item.get('category', 'General')
    days_since = food_item.get('days_since_purchase', 0)
    shelf_life = SHELF_LIFE.get(category, 7)
    days_left = max(0, shelf_life - days_since)
    ratio = days_since / shelf_life if shelf_life > 0 else 1.0

    if ratio >= 1.0:
        prob, risk = 0.9, 'Very High'
    elif ratio >= 0.7:
        prob, risk = 0.65, 'High'
    elif ratio >= 0.4:
        prob, risk = 0.35, 'Medium'
    else:
        prob, risk = 0.1, 'Low'

    return {
        'waste_probability': round(prob, 3),
        'risk_level': risk,
        'predicted_days': days_left,
        'confidence': 0.5,
        'note': 'Rule-based estimate (ML model unavailable)'
    }

def load_model():
    """Load the trained ensemble waste predictor."""
    model = WastePredictionModel()
    try:
        model.load_models(MODEL_PATH)
        return model, True
    except Exception as e:
        sys.stderr.write(f"Warning: Could not load trained model ({e}). Using rule-based fallback.\n")
        return model, False

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return

        data = json.loads(input_data)
        food_item   = data.get('food_item', {})
        user_history = data.get('user_history', [])

        model, loaded = load_model()

        if loaded:
            prediction = model.predict_waste_probability(user_history, food_item)
        else:
            prediction = rule_based_prediction(food_item)

        # Output only the final JSON line (waste.js reads the last line)
        print(json.dumps(prediction, cls=NumpyEncoder))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
