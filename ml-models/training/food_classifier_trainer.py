#!/usr/bin/env python3
"""
Food Recognition Model Trainer
Trains MobileNetV3-Large model for UK food classification
Optimized for RTX 2060 (6GB VRAM) with mixed precision training
Target: >95% accuracy on common UK foods
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torch.amp import GradScaler, autocast
import torchvision.transforms as transforms
from torchvision.models import mobilenet_v3_large, MobileNet_V3_Large_Weights
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for saving plots
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import json
import os
from datetime import datetime
import logging
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)


def setup_gpu(max_vram_gb: float = 4.0):
    """Configure GPU with VRAM limit so desktop stays responsive"""
    if not torch.cuda.is_available():
        logger.warning("CUDA not available — training on CPU (will be slow)")
        return torch.device('cpu')

    gpu_name = torch.cuda.get_device_name(0)
    total_vram = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    logger.info(f"GPU: {gpu_name} ({total_vram:.1f} GB VRAM)")

    # Cap VRAM usage so other apps don't crash
    max_bytes = int(max_vram_gb * 1024**3)
    torch.cuda.set_per_process_memory_fraction(max_bytes / torch.cuda.get_device_properties(0).total_memory, 0)
    logger.info(f"VRAM cap set to {max_vram_gb:.1f} GB (of {total_vram:.1f} GB)")

    # Enable cudnn benchmarking for consistent input sizes
    torch.backends.cudnn.benchmark = True

    return torch.device('cuda')


class UKFoodDataset(Dataset):
    """Dataset for UK food classification"""

    def __init__(self, data_path: str, transform=None, is_training: bool = True):
        self.data_path = data_path
        self.transform = transform
        self.is_training = is_training

        # Load data
        self.df = pd.read_csv(data_path)
        self.categories = sorted(self.df['category'].unique())
        self.category_to_idx = {cat: idx for idx, cat in enumerate(self.categories)}
        self.idx_to_category = {idx: cat for cat, idx in self.category_to_idx.items()}

        # Check if image_path column exists for real images
        self.has_images = 'image_path' in self.df.columns

        logger.info(f"Loaded {len(self.df)} samples with {len(self.categories)} categories"
                     f" ({'real images' if self.has_images else 'placeholder images'})")

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]

        if self.has_images and pd.notna(row.get('image_path')):
            try:
                image = Image.open(row['image_path']).convert('RGB')
            except Exception:
                image = self._generate_placeholder_image(row['category'], idx)
        else:
            image = self._generate_placeholder_image(row['category'], idx)

        if self.transform:
            image = self.transform(image)

        label = self.category_to_idx[row['category']]
        return image, label

    def _generate_placeholder_image(self, category: str, idx: int):
        """Generate placeholder image for demo (replace with actual image loading)"""
        rng = np.random.RandomState(idx)
        image_array = rng.randint(0, 256, (224, 224, 3), dtype=np.uint8)

        # Add category-specific colour tints
        cat_lower = category.lower()
        if 'fruit' in cat_lower:
            image_array[:, :, 0] = np.clip(image_array[:, :, 0].astype(int) + 50, 0, 255).astype(np.uint8)
        elif 'vegetable' in cat_lower or 'veg' in cat_lower:
            image_array[:, :, 1] = np.clip(image_array[:, :, 1].astype(int) + 50, 0, 255).astype(np.uint8)
        elif 'dairy' in cat_lower or 'milk' in cat_lower:
            image_array[:, :, 2] = np.clip(image_array[:, :, 2].astype(int) + 50, 0, 255).astype(np.uint8)
        elif 'meat' in cat_lower or 'fish' in cat_lower:
            image_array[:, :, 0] = np.clip(image_array[:, :, 0].astype(int) + 40, 0, 255).astype(np.uint8)
            image_array[:, :, 1] = np.clip(image_array[:, :, 1].astype(int) + 20, 0, 255).astype(np.uint8)

        return Image.fromarray(image_array)


class UKFoodClassifier(nn.Module):
    """MobileNetV3-Large UK food classifier with multi-task learning

    Why MobileNetV3 over EfficientNet-B4:
    - 5x fewer parameters (5.4M vs 19.3M backbone)
    - ~2 GB VRAM at batch_size=8 vs ~5 GB for B4
    - Still achieves >90% top-1 on ImageNet
    - Faster inference (important for real-time scanning)
    """

    def __init__(self, num_classes: int = 200, pretrained: bool = True):
        super().__init__()

        # Load pretrained MobileNetV3-Large
        if pretrained:
            self.backbone = mobilenet_v3_large(weights=MobileNet_V3_Large_Weights.IMAGENET1K_V2)
        else:
            self.backbone = mobilenet_v3_large(weights=None)

        # Replace the classifier — MobileNetV3-Large feature dim is 960
        feature_dim = 960
        self.backbone.classifier = nn.Identity()

        # Main classification head
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(feature_dim, 512),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(512, num_classes)
        )

        # Multi-task heads (lightweight)
        self.storage_head = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 5)  # fridge, freezer, pantry, room, special
        )

        self.supermarket_head = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 6)  # tesco, sainsburys, asda, morrisons, aldi, lidl
        )

        self.quality_head = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        features = self.backbone(x)

        return {
            'classification': self.classifier(features),
            'storage': self.storage_head(features),
            'supermarket': self.supermarket_head(features),
            'quality': self.quality_head(features)
        }


class FoodClassifierTrainer:
    """Trainer for UK food classification model — optimized for RTX 2060"""

    def __init__(self, config: Dict):
        self.config = config
        self.device = setup_gpu(max_vram_gb=config.get('max_vram_gb', 4.0))

        # Mixed precision scaler (fp16 halves VRAM usage)
        self.scaler = GradScaler('cuda', enabled=(self.device.type == 'cuda'))
        self.grad_accum_steps = config.get('grad_accum_steps', 4)

        # Initialize model
        self.model = UKFoodClassifier(
            num_classes=config['num_classes'],
            pretrained=config['pretrained']
        ).to(self.device)

        param_count = sum(p.numel() for p in self.model.parameters()) / 1e6
        trainable_count = sum(p.numel() for p in self.model.parameters() if p.requires_grad) / 1e6
        logger.info(f"Model: {param_count:.1f}M params ({trainable_count:.1f}M trainable)")

        # Optimizer
        self.optimizer = optim.AdamW(
            self.model.parameters(),
            lr=config['learning_rate'],
            weight_decay=config['weight_decay']
        )

        self.scheduler = optim.lr_scheduler.CosineAnnealingLR(
            self.optimizer,
            T_max=config['epochs'],
            eta_min=config['learning_rate'] * 0.01
        )

        # Loss functions
        self.criterion = nn.CrossEntropyLoss(label_smoothing=config.get('label_smoothing', 0.1))
        self.storage_criterion = nn.CrossEntropyLoss()
        self.supermarket_criterion = nn.CrossEntropyLoss()
        self.quality_criterion = nn.MSELoss()

        # Training history
        self.train_history = {
            'loss': [], 'accuracy': [],
            'val_loss': [], 'val_accuracy': []
        }

    def get_transforms(self):
        """Get data augmentation transforms"""
        if self.config['use_augmentation']:
            train_transform = transforms.Compose([
                transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
                transforms.RandomHorizontalFlip(p=0.5),
                transforms.RandomRotation(degrees=15),
                transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            train_transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

        val_transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        return train_transform, val_transform

    def create_data_loaders(self):
        """Create training and validation data loaders"""
        train_transform, val_transform = self.get_transforms()

        train_dataset = UKFoodDataset(
            self.config['train_data_path'],
            transform=train_transform,
            is_training=True
        )

        val_dataset = UKFoodDataset(
            self.config['val_data_path'],
            transform=val_transform,
            is_training=False
        )

        # num_workers=0 on Windows to avoid multiprocessing issues
        num_workers = 0 if os.name == 'nt' else self.config.get('num_workers', 4)

        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config['batch_size'],
            shuffle=True,
            num_workers=num_workers,
            pin_memory=(self.device.type == 'cuda' and os.name != 'nt')
        )

        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config['batch_size'],
            shuffle=False,
            num_workers=num_workers,
            pin_memory=(self.device.type == 'cuda' and os.name != 'nt')
        )

        return train_loader, val_loader, train_dataset

    def train_epoch(self, train_loader):
        """Train for one epoch with mixed precision + gradient accumulation"""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0

        self.optimizer.zero_grad()

        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(self.device, non_blocking=True), target.to(self.device, non_blocking=True)

            # Mixed precision forward pass
            with autocast('cuda', enabled=(self.device.type == 'cuda')):
                outputs = self.model(data)

                # Main classification loss
                main_loss = self.criterion(outputs['classification'], target)

                # Multi-task losses (dummy targets until real labels available)
                bs = data.size(0)
                storage_loss = self.storage_criterion(
                    outputs['storage'], torch.randint(0, 5, (bs,), device=self.device))
                supermarket_loss = self.supermarket_criterion(
                    outputs['supermarket'], torch.randint(0, 6, (bs,), device=self.device))
                quality_loss = self.quality_criterion(
                    outputs['quality'], torch.rand(bs, 1, device=self.device))

                loss = main_loss + 0.3 * storage_loss + 0.2 * supermarket_loss + 0.1 * quality_loss
                loss = loss / self.grad_accum_steps  # Scale for accumulation

            # Mixed precision backward
            self.scaler.scale(loss).backward()

            # Step every N accumulation steps
            if (batch_idx + 1) % self.grad_accum_steps == 0 or (batch_idx + 1) == len(train_loader):
                self.scaler.step(self.optimizer)
                self.scaler.update()
                self.optimizer.zero_grad()

            # Statistics
            total_loss += loss.item() * self.grad_accum_steps
            _, predicted = outputs['classification'].max(1)
            total += target.size(0)
            correct += predicted.eq(target).sum().item()

            if batch_idx % 50 == 0:
                vram_used = torch.cuda.memory_allocated() / (1024**3) if self.device.type == 'cuda' else 0
                logger.info(f'  Batch {batch_idx}/{len(train_loader)} | '
                            f'Loss: {loss.item() * self.grad_accum_steps:.4f} | '
                            f'Acc: {100.*correct/total:.1f}% | '
                            f'VRAM: {vram_used:.1f}GB')

        return total_loss / len(train_loader), 100. * correct / total

    def validate_epoch(self, val_loader):
        """Validate for one epoch"""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0

        with torch.no_grad():
            for data, target in val_loader:
                data, target = data.to(self.device, non_blocking=True), target.to(self.device, non_blocking=True)

                with autocast('cuda', enabled=(self.device.type == 'cuda')):
                    outputs = self.model(data)
                    loss = self.criterion(outputs['classification'], target)

                total_loss += loss.item()
                _, predicted = outputs['classification'].max(1)
                total += target.size(0)
                correct += predicted.eq(target).sum().item()

        return total_loss / len(val_loader), 100. * correct / total

    def train(self):
        """Main training loop"""
        train_loader, val_loader, train_dataset = self.create_data_loaders()

        best_val_acc = 0
        patience_counter = 0

        logger.info(f"=== Training Config ===")
        logger.info(f"  Model: MobileNetV3-Large")
        logger.info(f"  Epochs: {self.config['epochs']}")
        logger.info(f"  Batch size: {self.config['batch_size']} (effective: {self.config['batch_size'] * self.grad_accum_steps})")
        logger.info(f"  Mixed precision: {'Yes' if self.device.type == 'cuda' else 'No (CPU)'}")
        logger.info(f"  Training samples: {len(train_dataset)}")
        logger.info(f"  Categories: {len(train_dataset.categories)}")
        logger.info(f"========================")

        for epoch in range(self.config['epochs']):
            # Training
            train_loss, train_acc = self.train_epoch(train_loader)

            # Validation
            val_loss, val_acc = self.validate_epoch(val_loader)

            # Update scheduler
            self.scheduler.step()

            lr = self.optimizer.param_groups[0]['lr']
            logger.info(f'Epoch {epoch+1}/{self.config["epochs"]}: '
                        f'Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.1f}% | '
                        f'Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.1f}% | '
                        f'LR: {lr:.2e}')

            # Save history
            self.train_history['loss'].append(train_loss)
            self.train_history['accuracy'].append(train_acc)
            self.train_history['val_loss'].append(val_loss)
            self.train_history['val_accuracy'].append(val_acc)

            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                patience_counter = 0
                self.save_model("best_food_classifier.pth")
                logger.info(f"  >> New best: {best_val_acc:.1f}%")
            else:
                patience_counter += 1

            # Early stopping
            if patience_counter >= self.config['early_stopping_patience']:
                logger.info(f"Early stopping at epoch {epoch+1} (no improvement for {patience_counter} epochs)")
                break

        logger.info(f"Training completed. Best validation accuracy: {best_val_acc:.1f}%")

        # Clean up GPU memory
        if self.device.type == 'cuda':
            torch.cuda.empty_cache()

        return best_val_acc

    def save_model(self, filename: str):
        """Save model checkpoint"""
        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        os.makedirs(save_dir, exist_ok=True)

        filepath = os.path.join(save_dir, filename)
        checkpoint = {
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
            'config': self.config,
            'train_history': self.train_history
        }

        torch.save(checkpoint, filepath)
        logger.info(f"Model saved: {filepath}")

    def load_model(self, filename: str):
        """Load model checkpoint"""
        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        filepath = os.path.join(save_dir, filename)

        checkpoint = torch.load(filepath, map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        self.train_history = checkpoint['train_history']
        logger.info(f"Model loaded: {filepath}")

    def plot_training_history(self):
        """Plot and save training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

        ax1.plot(self.train_history['loss'], label='Train Loss')
        ax1.plot(self.train_history['val_loss'], label='Val Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        ax2.plot(self.train_history['accuracy'], label='Train Accuracy')
        ax2.plot(self.train_history['val_accuracy'], label='Val Accuracy')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy (%)')
        ax2.set_title('Training and Validation Accuracy')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()

        save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
        os.makedirs(save_dir, exist_ok=True)
        plt.savefig(os.path.join(save_dir, 'training_history.png'), dpi=150, bbox_inches='tight')
        logger.info("Training history plot saved to models/training_history.png")
        plt.close()

    def evaluate_model(self, test_loader, class_names: List[str]):
        """Comprehensive model evaluation"""
        self.model.eval()
        all_predictions = []
        all_targets = []

        with torch.no_grad():
            for data, target in test_loader:
                data, target = data.to(self.device), target.to(self.device)
                with autocast('cuda', enabled=(self.device.type == 'cuda')):
                    outputs = self.model(data)
                _, predicted = outputs['classification'].max(1)

                all_predictions.extend(predicted.cpu().numpy())
                all_targets.extend(target.cpu().numpy())

        accuracy = accuracy_score(all_targets, all_predictions)

        report = classification_report(
            all_targets, all_predictions,
            target_names=class_names,
            output_dict=True
        )

        cm = confusion_matrix(all_targets, all_predictions)

        # Save confusion matrix
        if len(class_names) <= 30:  # Only plot if reasonable number of classes
            plt.figure(figsize=(12, 10))
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                        xticklabels=class_names, yticklabels=class_names)
            plt.title('Confusion Matrix')
            plt.xlabel('Predicted')
            plt.ylabel('Actual')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()

            save_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
            plt.savefig(os.path.join(save_dir, 'confusion_matrix.png'), dpi=150, bbox_inches='tight')
            plt.close()

        logger.info(f"Test Accuracy: {accuracy:.4f}")
        logger.info(f"Classification Report:\n{classification_report(all_targets, all_predictions, target_names=class_names)}")

        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm
        }


def main():
    """Main training function — optimized for RTX 2060 (6GB VRAM)"""

    # Resolve paths relative to ml-models/ directory
    ml_dir = os.path.dirname(os.path.dirname(__file__))

    config = {
        # Model — 8 NourishNeural pantry categories from Food-11
        'num_classes': 8,
        'pretrained': True,

        # Training — conservative for 6GB VRAM
        'batch_size': 8,           # Small batch to fit in VRAM
        'grad_accum_steps': 4,     # Effective batch size = 8 * 4 = 32
        'learning_rate': 3e-4,     # Slightly higher LR for MobileNet
        'weight_decay': 1e-4,
        'epochs': 50,
        'early_stopping_patience': 8,
        'use_augmentation': True,
        'label_smoothing': 0.1,

        # GPU — cap at 4GB so desktop stays responsive
        'max_vram_gb': 4.0,

        # Data — Food-11 dataset mapped to pantry categories
        'train_data_path': os.path.join(ml_dir, 'data', 'training', 'food11_train.csv'),
        'val_data_path': os.path.join(ml_dir, 'data', 'training', 'food11_val.csv'),
        'test_data_path': os.path.join(ml_dir, 'data', 'training', 'food11_test.csv'),
    }

    logger.info("=== UK Food Classifier -- Local Training (RTX 2060) ===")

    # Initialize trainer
    trainer = FoodClassifierTrainer(config)

    # Train model
    best_accuracy = trainer.train()

    # Plot training history
    trainer.plot_training_history()

    # Load best model and evaluate on test set
    logger.info("Loading best model for evaluation...")
    trainer.load_model('best_food_classifier.pth')

    _, val_transform = trainer.get_transforms()
    test_dataset = UKFoodDataset(
        config['test_data_path'],
        transform=val_transform,
        is_training=False
    )

    num_workers = 0 if os.name == 'nt' else 4
    test_loader = DataLoader(
        test_dataset,
        batch_size=config['batch_size'],
        shuffle=False,
        num_workers=num_workers,
    )

    class_names = list(test_dataset.idx_to_category.values())
    results = trainer.evaluate_model(test_loader, class_names)

    # Save final model
    trainer.save_model('final_food_classifier.pth')

    # Save class names for inference
    import json
    models_dir = os.path.join(ml_dir, 'models')
    with open(os.path.join(models_dir, 'food_classes.json'), 'w') as f:
        json.dump({
            'classes': class_names,
            'num_classes': len(class_names),
            'dataset': 'Food-11 (mapped to NourishNeural categories)',
            'test_accuracy': results['accuracy'],
        }, f, indent=2)

    logger.info(f"Training completed with best accuracy: {best_accuracy:.1f}%")
    logger.info(f"Test set accuracy: {results['accuracy']*100:.1f}%")

    target_accuracy = 85.0
    if best_accuracy >= target_accuracy:
        logger.info(f"Target accuracy of {target_accuracy}% achieved!")
    else:
        logger.info(f"Target accuracy of {target_accuracy}% not yet reached ({best_accuracy:.1f}%)")
        logger.info("Tips: more training data, longer training, or try EfficientNet-B0 if VRAM allows")


if __name__ == "__main__":
    main()
