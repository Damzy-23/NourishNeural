#!/usr/bin/env python3
"""
Quick test for the trained Waste Prediction Model.
Runs predictions on sample food items and prints results.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.models.waste_prediction import WastePredictionModel

MODEL_PATH = 'models/waste_predictor'

# --- Sample user histories ---
careful_user = [
    {'category': 'Dairy',      'purchase_date': '2025-01-01', 'consumption_date': '2025-01-04', 'was_wasted': False},
    {'category': 'Vegetables', 'purchase_date': '2025-01-03', 'consumption_date': '2025-01-06', 'was_wasted': False},
    {'category': 'Meat',       'purchase_date': '2025-01-05', 'consumption_date': '2025-01-07', 'was_wasted': False},
    {'category': 'Fruits',     'purchase_date': '2025-01-08', 'consumption_date': '2025-01-10', 'was_wasted': False},
    {'category': 'Bakery',     'purchase_date': '2025-01-10', 'consumption_date': '2025-01-12', 'was_wasted': False},
]

wasteful_user = [
    {'category': 'Dairy',      'purchase_date': '2025-01-01', 'consumption_date': '2025-01-10', 'was_wasted': True},
    {'category': 'Vegetables', 'purchase_date': '2025-01-02', 'consumption_date': '2025-01-12', 'was_wasted': True},
    {'category': 'Meat',       'purchase_date': '2025-01-04', 'consumption_date': '2025-01-08', 'was_wasted': True},
    {'category': 'Fruits',     'purchase_date': '2025-01-06', 'consumption_date': '2025-01-14', 'was_wasted': True},
    {'category': 'Fish',       'purchase_date': '2025-01-09', 'consumption_date': '2025-01-15', 'was_wasted': True},
]

# --- Sample food items to predict ---
test_cases = [
    {
        'label': 'Fresh salmon (careful user)',
        'user': careful_user,
        'item': {
            'category': 'Fish',
            'purchase_date': '2025-02-01',
            'storage_type': 'fridge',
            'storage_temp': 4.0,
            'storage_humidity': 60.0,
            'package_quality': 0.9,
            'perishability_score': 0.9,
            'estimated_price': 6.50,
            'household_size': 3,
            'budget_constraint': 0.4,
        }
    },
    {
        'label': 'Fresh salmon (wasteful user)',
        'user': wasteful_user,
        'item': {
            'category': 'Fish',
            'purchase_date': '2025-02-01',
            'storage_type': 'fridge',
            'storage_temp': 4.0,
            'storage_humidity': 60.0,
            'package_quality': 0.9,
            'perishability_score': 0.9,
            'estimated_price': 6.50,
            'household_size': 1,
            'budget_constraint': 0.8,
        }
    },
    {
        'label': 'Tinned beans (careful user)',
        'user': careful_user,
        'item': {
            'category': 'Pantry',
            'purchase_date': '2025-02-01',
            'storage_type': 'pantry',
            'storage_temp': 18.0,
            'storage_humidity': 50.0,
            'package_quality': 1.0,
            'perishability_score': 0.1,
            'estimated_price': 0.70,
            'household_size': 3,
            'budget_constraint': 0.4,
        }
    },
    {
        'label': 'Chicken breast (wasteful user)',
        'user': wasteful_user,
        'item': {
            'category': 'Meat',
            'purchase_date': '2025-02-01',
            'storage_type': 'fridge',
            'storage_temp': 4.0,
            'storage_humidity': 65.0,
            'package_quality': 0.8,
            'perishability_score': 0.8,
            'estimated_price': 4.50,
            'household_size': 1,
            'budget_constraint': 0.7,
        }
    },
    {
        'label': 'Milk (careful user, large household)',
        'user': careful_user,
        'item': {
            'category': 'Dairy',
            'purchase_date': '2025-02-01',
            'storage_type': 'fridge',
            'storage_temp': 4.0,
            'storage_humidity': 60.0,
            'package_quality': 0.95,
            'perishability_score': 0.6,
            'estimated_price': 1.20,
            'household_size': 5,
            'budget_constraint': 0.3,
        }
    },
]

RISK_COLOURS = {
    'Low':       'LOW      ',
    'Medium':    'MEDIUM   ',
    'High':      'HIGH     ',
    'Very High': 'VERY HIGH',
}

def main():
    print("=" * 60)
    print("  WASTE PREDICTION MODEL — TEST")
    print("=" * 60)

    # Load model
    print(f"\nLoading model from '{MODEL_PATH}'...")
    model = WastePredictionModel()
    model.load_models(MODEL_PATH)
    print("Model loaded.\n")

    print(f"{'Item':<42} {'Waste %':>7}  {'Risk':<10}  {'Top recommendation'}")
    print("-" * 100)

    for case in test_cases:
        result = model.predict_waste_probability(case['user'], case['item'])
        prob   = result['waste_probability']
        risk   = result['risk_level']
        recs   = result['recommendations']
        top_rec = recs[0] if recs else '-'

        print(f"{case['label']:<42} {prob:>6.1%}   {RISK_COLOURS.get(risk, risk):<10}  {top_rec}")

    print("\nDone.")


if __name__ == "__main__":
    main()
