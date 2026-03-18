"""
Food Recognition Model using Computer Vision
Identifies food items from images for Nourish Neural.
Uses MobileNetV3-Large (PyTorch) — matches the training pipeline.
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_large
from PIL import Image
import numpy as np
from typing import List, Dict, Optional
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class UKFoodClassifier(nn.Module):
    """MobileNetV3-Large UK food classifier (must match training architecture)"""

    def __init__(self, num_classes: int = 8, pretrained: bool = False):
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


class FoodRecognitionModel:
    """
    Inference wrapper for food recognition.
    Loads trained MobileNetV3 checkpoint and runs predictions.
    """

    STORAGE_TYPES = ['fridge', 'freezer', 'pantry', 'room', 'special']
    SUPERMARKETS = ['tesco', 'sainsburys', 'asda', 'morrisons', 'aldi', 'lidl']

    def __init__(self, num_classes: int = 8, model_path: Optional[str] = None):
        self.num_classes = num_classes
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.class_names: List[str] = []

        # Standard ImageNet preprocessing
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        if model_path:
            self.load_model(model_path)

    def build_model(self) -> UKFoodClassifier:
        """Build model architecture (without trained weights)"""
        self.model = UKFoodClassifier(num_classes=self.num_classes).to(self.device)
        param_count = sum(p.numel() for p in self.model.parameters()) / 1e6
        logger.info(f"Built food recognition model with {param_count:.1f}M parameters")
        return self.model

    def load_model(self, model_path: str):
        """Load trained model from checkpoint"""
        if not os.path.exists(model_path):
            logger.warning(f"Model file not found: {model_path}")
            return

        self.model = UKFoodClassifier(num_classes=self.num_classes).to(self.device)
        checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)

        if 'model_state_dict' in checkpoint:
            self.model.load_state_dict(checkpoint['model_state_dict'])
        else:
            self.model.load_state_dict(checkpoint)

        self.model.eval()
        logger.info(f"Loaded model from {model_path}")

    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess a single image for inference"""
        image = Image.open(image_path).convert('RGB')
        tensor = self.transform(image).unsqueeze(0)  # Add batch dim
        return tensor.to(self.device)

    def predict(self, image_path: str, top_k: int = 5) -> Dict[str, any]:
        """
        Predict food category from image.
        Returns top-k class probabilities plus storage/supermarket/quality predictions.
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")

        self.model.eval()
        tensor = self.preprocess_image(image_path)

        with torch.no_grad():
            outputs = self.model(tensor)

        # Classification probabilities
        probs = torch.softmax(outputs['classification'], dim=1)[0]
        top_probs, top_indices = probs.topk(top_k)

        classifications = {}
        for prob, idx in zip(top_probs.cpu().numpy(), top_indices.cpu().numpy()):
            name = self.class_names[idx] if idx < len(self.class_names) else f"class_{idx}"
            classifications[name] = float(prob)

        # Storage recommendation
        storage_idx = outputs['storage'].argmax(dim=1).item()
        storage = self.STORAGE_TYPES[storage_idx] if storage_idx < len(self.STORAGE_TYPES) else 'unknown'

        # Supermarket prediction
        supermarket_idx = outputs['supermarket'].argmax(dim=1).item()
        supermarket = self.SUPERMARKETS[supermarket_idx] if supermarket_idx < len(self.SUPERMARKETS) else 'unknown'

        # Quality score
        quality = float(outputs['quality'][0].item())

        return {
            'classifications': classifications,
            'recommended_storage': storage,
            'likely_supermarket': supermarket,
            'quality_score': quality
        }

    def predict_batch(self, image_paths: List[str], top_k: int = 5) -> List[Dict]:
        """Predict food categories for a batch of images"""
        return [self.predict(path, top_k=top_k) for path in image_paths]

    def set_class_names(self, class_names: List[str]):
        """Set class names for human-readable predictions"""
        self.class_names = class_names
        logger.info(f"Set {len(class_names)} class names")

    def save_model(self, model_path: str):
        """Save model weights"""
        if self.model is None:
            raise ValueError("No model to save.")
        os.makedirs(os.path.dirname(model_path) or '.', exist_ok=True)
        torch.save(self.model.state_dict(), model_path)
        logger.info(f"Saved model to {model_path}")


if __name__ == "__main__":
    # Quick test — build model and print summary
    model = FoodRecognitionModel(num_classes=200)
    model.build_model()

    # Test with a dummy input
    dummy = torch.randn(1, 3, 224, 224).to(model.device)
    with torch.no_grad():
        out = model.model(dummy)
    print(f"Classification output shape: {out['classification'].shape}")
    print(f"Storage output shape: {out['storage'].shape}")
    print(f"Quality output shape: {out['quality'].shape}")
    print("Food Recognition Model initialized successfully!")
