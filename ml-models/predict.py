import sys
import json
import pickle
import os
import sys

# Add the current directory to path so we can import src
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from src.models.simple_models import SimpleWastePredictor

def load_model(model_path):
    """Load the trained predictor."""
    predictor = SimpleWastePredictor()
    try:
        predictor.load_model(model_path)
    except Exception as e:
        # Fallback to rule-based if load fails
        sys.stderr.write(f"Warning: Failed to load model: {e}\n")
    return predictor

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({"error": "No input provided"}))
            return

        data = json.loads(input_data)
        
        # Paths
        model_path = os.path.join(current_dir, "trained_models", "waste_predictor.pkl")
        
        # Load model
        predictor = load_model(model_path)
        
        if not predictor.is_trained:
             # If model failed to load, it will use rule-based fallbacks automatically
             # but we should note it
             pass

        # Extract data
        food_item = data.get('food_item', {})
        user_history = data.get('user_history', [])
        
        # Predict
        # Predict
        try:
            prediction = predictor.predict_waste_probability(user_history, food_item)
        except Exception as e:
            sys.stderr.write(f"Warning: ML prediction failed ({e}), using fallback.\n")
            # Force rule-based fallback
            prediction = predictor._rule_based_prediction(user_history, food_item)
        
        # Output result
        print(json.dumps(prediction))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
