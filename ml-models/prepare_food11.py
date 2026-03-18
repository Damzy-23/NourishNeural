#!/usr/bin/env python3
"""
Prepare Food-11 dataset: generate CSV mappings from folder structure.
Food-11 categories -> NourishNeural pantry categories mapping.
"""

import os
import csv
from pathlib import Path

DATA_ROOT = Path(__file__).parent / "data" / "archive"

# Map Food-11 folder names to NourishNeural pantry categories
CATEGORY_MAP = {
    "Bread": "Bakery",
    "Dairy product": "Dairy",
    "Dessert": "Bakery",
    "Egg": "Eggs",
    "Fried food": "General",
    "Meat": "Meat",
    "Noodles-Pasta": "Pantry",
    "Rice": "Pantry",
    "Seafood": "Fish",
    "Soup": "General",
    "Vegetable-Fruit": "Vegetables",
}

def generate_csv(split: str, output_path: Path):
    """Generate CSV from a split folder (training/validation/evaluation)"""
    split_dir = DATA_ROOT / split
    if not split_dir.exists():
        print(f"  Skipping {split} — directory not found")
        return 0

    rows = []
    for category_dir in sorted(split_dir.iterdir()):
        if not category_dir.is_dir():
            continue
        original_category = category_dir.name
        mapped_category = CATEGORY_MAP.get(original_category, "General")

        for img_file in sorted(category_dir.iterdir()):
            if img_file.suffix.lower() in ('.jpg', '.jpeg', '.png', '.bmp', '.webp'):
                rows.append({
                    "image_path": str(img_file.resolve()),
                    "category": mapped_category,
                    "original_category": original_category,
                })

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["image_path", "category", "original_category"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"  {split}: {len(rows)} images -> {output_path.name}")
    return len(rows)


def main():
    print("=== Preparing Food-11 Dataset for NourishNeural ===\n")

    output_dir = Path(__file__).parent / "data" / "training"
    output_dir.mkdir(parents=True, exist_ok=True)

    total = 0
    total += generate_csv("training", output_dir / "food11_train.csv")
    total += generate_csv("validation", output_dir / "food11_val.csv")
    total += generate_csv("evaluation", output_dir / "food11_test.csv")

    print(f"\nTotal: {total} images mapped")
    print(f"Categories: {sorted(set(CATEGORY_MAP.values()))}")
    print(f"\nCSV files saved to: {output_dir}")
    print("\nTo train, run:")
    print("  .venv/Scripts/python.exe ml-models/training/food_classifier_trainer.py")


if __name__ == "__main__":
    main()
