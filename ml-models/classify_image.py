"""
Standalone image classification script.
Called by the Node server via child_process.spawn.

Usage:
  python classify_image.py <image_path>

Outputs JSON to stdout with classification results.
"""

import sys
import os
import json
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_large
from PIL import Image

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, 'models', 'best_food_classifier.pth')
CLASSES_PATH = os.path.join(SCRIPT_DIR, 'models', 'food_classes.json')


class UKFoodClassifier(nn.Module):
    def __init__(self, num_classes=8):
        super().__init__()
        self.backbone = mobilenet_v3_large(weights=None)
        feature_dim = 960
        self.backbone.classifier = nn.Identity()

        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )
        self.storage_head = nn.Sequential(
            nn.Linear(feature_dim, 128), nn.ReLU(), nn.Dropout(0.2), nn.Linear(128, 5)
        )
        self.supermarket_head = nn.Sequential(
            nn.Linear(feature_dim, 128), nn.ReLU(), nn.Dropout(0.2), nn.Linear(128, 6)
        )
        self.quality_head = nn.Sequential(
            nn.Linear(feature_dim, 128), nn.ReLU(), nn.Dropout(0.2), nn.Linear(128, 1), nn.Sigmoid()
        )

    def forward(self, x):
        features = self.backbone(x)
        return {
            'classification': self.classifier(features),
            'storage': self.storage_head(features),
            'supermarket': self.supermarket_head(features),
            'quality': self.quality_head(features)
        }


STORAGE_TYPES = ['fridge', 'freezer', 'pantry', 'room', 'special']
SUPERMARKETS = ['tesco', 'sainsburys', 'asda', 'morrisons', 'aldi', 'lidl']

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def classify(image_path):
    # Load class names
    with open(CLASSES_PATH, 'r') as f:
        classes_data = json.load(f)
    class_names = classes_data['classes']
    num_classes = classes_data['num_classes']

    # Load model
    device = torch.device('cpu')
    model = UKFoodClassifier(num_classes=num_classes).to(device)
    checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)

    if 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)

    model.eval()

    # Preprocess image
    image = Image.open(image_path).convert('RGB')
    tensor = transform(image).unsqueeze(0).to(device)

    # Predict
    with torch.no_grad():
        outputs = model(tensor)

    probs = torch.softmax(outputs['classification'], dim=1)[0]
    top_probs, top_indices = probs.topk(min(5, num_classes))

    classifications = []
    for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
        name = class_names[idx] if idx < len(class_names) else f"class_{idx}"
        classifications.append({'category': name, 'confidence': round(float(prob), 4)})

    # Auxiliary predictions
    storage_idx = outputs['storage'].argmax(dim=1).item()
    storage = STORAGE_TYPES[storage_idx] if storage_idx < len(STORAGE_TYPES) else 'fridge'

    supermarket_idx = outputs['supermarket'].argmax(dim=1).item()
    supermarket = SUPERMARKETS[supermarket_idx] if supermarket_idx < len(SUPERMARKETS) else 'tesco'

    quality = round(float(outputs['quality'][0].item()), 4)

    return {
        'predictions': classifications,
        'top_category': classifications[0]['category'],
        'top_confidence': classifications[0]['confidence'],
        'recommended_storage': storage,
        'likely_supermarket': supermarket,
        'quality_score': quality
    }


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No image path provided'}))
        sys.exit(1)

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(json.dumps({'error': f'Image not found: {image_path}'}))
        sys.exit(1)

    try:
        result = classify(image_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
