#!/usr/bin/env python3
"""
Food Recognition Model Trainer
Trains EfficientNet-based model for UK food classification
Target: >95% accuracy on common UK foods
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b4
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import json
import os
from datetime import datetime
import logging
from typing import Dict, List, Tuple, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UKFoodDataset(Dataset):
    """Dataset for UK food classification"""
    
    def __init__(self, data_path: str, transform=None, is_training: bool = True):
        self.data_path = data_path
        self.transform = transform
        self.is_training = is_training
        
        # Load data
        self.df = pd.read_csv(data_path)
        self.categories = self.df['category'].unique()
        self.category_to_idx = {cat: idx for idx, cat in enumerate(self.categories)}
        self.idx_to_category = {idx: cat for cat, idx in self.category_to_idx.items()}
        
        logger.info(f"Loaded {len(self.df)} samples with {len(self.categories)} categories")
    
    def __len__(self):
        return len(self.df)
    
    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        
        # For now, we'll use a placeholder image
        # In practice, you'd load the actual image from row['image_path']
        image = self._generate_placeholder_image(row['category'])
        
        if self.transform:
            image = self.transform(image)
        
        label = self.category_to_idx[row['category']]
        
        return image, label
    
    def _generate_placeholder_image(self, category: str):
        """Generate placeholder image for demo (replace with actual image loading)"""
        # Create a random image based on category
        np.random.seed(hash(category) % 2**32)
        image_array = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
        
        # Add some category-specific patterns
        if 'fruit' in category.lower():
            image_array[:, :, 0] = np.clip(image_array[:, :, 0] + 50, 0, 255)  # Reddish
        elif 'vegetable' in category.lower():
            image_array[:, :, 1] = np.clip(image_array[:, :, 1] + 50, 0, 255)  # Greenish
        elif 'dairy' in category.lower():
            image_array[:, :, 2] = np.clip(image_array[:, :, 2] + 50, 0, 255)  # Bluish
        
        return Image.fromarray(image_array)

class UKFoodClassifier(nn.Module):
    """EfficientNet-based UK food classifier with multi-task learning"""
    
    def __init__(self, num_classes: int = 200, pretrained: bool = True):
        super().__init__()
        
        # Load pretrained EfficientNet-B4
        if pretrained:
            self.backbone = efficientnet_b4(pretrained=True)
            # Remove the original classifier
            self.backbone.classifier = nn.Identity()
        else:
            self.backbone = efficientnet_b4(pretrained=False)
            self.backbone.classifier = nn.Identity()
        
        # Get feature dimension
        feature_dim = 1792  # EfficientNet-B4 feature dimension
        
        # Main classification head
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(feature_dim, 1024),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, num_classes)
        )
        
        # Multi-task learning heads
        self.storage_head = nn.Sequential(
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 5)  # fridge, freezer, pantry, room, special
        )
        
        self.supermarket_head = nn.Sequential(
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 6)  # tesco, sainsburys, asda, morrisons, aldi, lidl
        )
        
        # UK-specific food quality head
        self.quality_head = nn.Sequential(
            nn.Linear(feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 1),
            nn.Sigmoid()  # Quality score 0-1
        )
    
    def forward(self, x):
        # Extract features
        features = self.backbone(x)
        
        # Main classification
        classification = self.classifier(features)
        
        # Multi-task predictions
        storage = self.storage_head(features)
        supermarket = self.supermarket_head(features)
        quality = self.quality_head(features)
        
        return {
            'classification': classification,
            'storage': storage,
            'supermarket': supermarket,
            'quality': quality
        }

class FoodClassifierTrainer:
    """Trainer for UK food classification model"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"Using device: {self.device}")
        
        # Initialize model
        self.model = UKFoodClassifier(
            num_classes=config['num_classes'],
            pretrained=config['pretrained']
        ).to(self.device)
        
        # Initialize optimizer and scheduler
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
            'loss': [],
            'accuracy': [],
            'val_loss': [],
            'val_accuracy': []
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
        
        # Create datasets
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
        
        # Create data loaders
        # Use num_workers=0 on Windows to avoid multiprocessing issues
        num_workers = 0 if os.name == 'nt' else self.config.get('num_workers', 4)
        
        train_loader = DataLoader(
            train_dataset,
            batch_size=self.config['batch_size'],
            shuffle=True,
            num_workers=num_workers,
            pin_memory=False  # Disable pin_memory on Windows
        )
        
        val_loader = DataLoader(
            val_dataset,
            batch_size=self.config['batch_size'],
            shuffle=False,
            num_workers=num_workers,
            pin_memory=False  # Disable pin_memory on Windows
        )
        
        return train_loader, val_loader, train_dataset
    
    def train_epoch(self, train_loader):
        """Train for one epoch"""
        self.model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(self.device), target.to(self.device)
            
            self.optimizer.zero_grad()
            
            # Forward pass
            outputs = self.model(data)
            
            # Calculate losses
            main_loss = self.criterion(outputs['classification'], target)
            
            # For multi-task learning, we need additional targets
            # For now, we'll use dummy targets (in practice, you'd have real data)
            batch_size = data.size(0)
            dummy_storage = torch.randint(0, 5, (batch_size,), device=self.device)
            dummy_supermarket = torch.randint(0, 6, (batch_size,), device=self.device)
            dummy_quality = torch.rand(batch_size, 1, device=self.device)
            
            storage_loss = self.storage_criterion(outputs['storage'], dummy_storage)
            supermarket_loss = self.supermarket_criterion(outputs['supermarket'], dummy_supermarket)
            quality_loss = self.quality_criterion(outputs['quality'], dummy_quality)
            
            # Combined loss
            total_loss_batch = main_loss + 0.3 * storage_loss + 0.2 * supermarket_loss + 0.1 * quality_loss
            
            # Backward pass
            total_loss_batch.backward()
            self.optimizer.step()
            
            # Statistics
            total_loss += total_loss_batch.item()
            _, predicted = outputs['classification'].max(1)
            total += target.size(0)
            correct += predicted.eq(target).sum().item()
            
            if batch_idx % 100 == 0:
                logger.info(f'Batch {batch_idx}/{len(train_loader)}, '
                          f'Loss: {total_loss_batch.item():.4f}, '
                          f'Acc: {100.*correct/total:.2f}%')
        
        avg_loss = total_loss / len(train_loader)
        accuracy = 100. * correct / total
        
        return avg_loss, accuracy
    
    def validate_epoch(self, val_loader):
        """Validate for one epoch"""
        self.model.eval()
        total_loss = 0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for data, target in val_loader:
                data, target = data.to(self.device), target.to(self.device)
                
                outputs = self.model(data)
                loss = self.criterion(outputs['classification'], target)
                
                total_loss += loss.item()
                _, predicted = outputs['classification'].max(1)
                total += target.size(0)
                correct += predicted.eq(target).sum().item()
        
        avg_loss = total_loss / len(val_loader)
        accuracy = 100. * correct / total
        
        return avg_loss, accuracy
    
    def train(self):
        """Main training loop"""
        train_loader, val_loader, train_dataset = self.create_data_loaders()
        
        best_val_acc = 0
        patience_counter = 0
        
        logger.info(f"Starting training for {self.config['epochs']} epochs")
        logger.info(f"Training samples: {len(train_dataset)}")
        
        for epoch in range(self.config['epochs']):
            # Training
            train_loss, train_acc = self.train_epoch(train_loader)
            
            # Validation
            val_loss, val_acc = self.validate_epoch(val_loader)
            
            # Update scheduler
            self.scheduler.step()
            
            # Log progress
            logger.info(f'Epoch {epoch+1}/{self.config["epochs"]}: '
                       f'Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}%, '
                       f'Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%')
            
            # Save history
            self.train_history['loss'].append(train_loss)
            self.train_history['accuracy'].append(train_acc)
            self.train_history['val_loss'].append(val_loss)
            self.train_history['val_accuracy'].append(val_acc)
            
            # Save best model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                patience_counter = 0
                self.save_model(f"best_model_epoch_{epoch+1}.pth")
                logger.info(f"New best validation accuracy: {best_val_acc:.2f}%")
            else:
                patience_counter += 1
            
            # Early stopping
            if patience_counter >= self.config['early_stopping_patience']:
                logger.info(f"Early stopping at epoch {epoch+1}")
                break
        
        logger.info(f"Training completed. Best validation accuracy: {best_val_acc:.2f}%")
        return best_val_acc
    
    def save_model(self, filename: str):
        """Save model checkpoint"""
        os.makedirs('models', exist_ok=True)
        
        checkpoint = {
            'model_state_dict': self.model.state_dict(),
            'optimizer_state_dict': self.optimizer.state_dict(),
            'scheduler_state_dict': self.scheduler.state_dict(),
            'config': self.config,
            'train_history': self.train_history
        }
        
        torch.save(checkpoint, f'models/{filename}')
        logger.info(f"Model saved as models/{filename}")
    
    def load_model(self, filename: str):
        """Load model checkpoint"""
        checkpoint = torch.load(f'models/{filename}', map_location=self.device)
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        self.scheduler.load_state_dict(checkpoint['scheduler_state_dict'])
        self.train_history = checkpoint['train_history']
        logger.info(f"Model loaded from models/{filename}")
    
    def plot_training_history(self):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Loss plot
        ax1.plot(self.train_history['loss'], label='Train Loss')
        ax1.plot(self.train_history['val_loss'], label='Validation Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.legend()
        ax1.grid(True)
        
        # Accuracy plot
        ax2.plot(self.train_history['accuracy'], label='Train Accuracy')
        ax2.plot(self.train_history['val_accuracy'], label='Validation Accuracy')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy (%)')
        ax2.set_title('Training and Validation Accuracy')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig('models/training_history.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def evaluate_model(self, test_loader, class_names: List[str]):
        """Comprehensive model evaluation"""
        self.model.eval()
        all_predictions = []
        all_targets = []
        
        with torch.no_grad():
            for data, target in test_loader:
                data, target = data.to(self.device), target.to(self.device)
                outputs = self.model(data)
                _, predicted = outputs['classification'].max(1)
                
                all_predictions.extend(predicted.cpu().numpy())
                all_targets.extend(target.cpu().numpy())
        
        # Calculate metrics
        accuracy = accuracy_score(all_targets, all_predictions)
        
        # Classification report
        report = classification_report(
            all_targets, all_predictions,
            target_names=class_names,
            output_dict=True
        )
        
        # Confusion matrix
        cm = confusion_matrix(all_targets, all_predictions)
        
        # Plot confusion matrix
        plt.figure(figsize=(12, 10))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=class_names, yticklabels=class_names)
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        plt.xticks(rotation=45)
        plt.yticks(rotation=0)
        plt.tight_layout()
        plt.savefig('models/confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        logger.info(f"Test Accuracy: {accuracy:.4f}")
        logger.info(f"Classification Report:\n{classification_report(all_targets, all_predictions, target_names=class_names)}")
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm
        }

def main():
    """Main training function"""
    # Configuration
    config = {
        'num_classes': 200,  # Number of UK food categories
        'pretrained': True,
        'batch_size': 32,
        'learning_rate': 1e-4,
        'weight_decay': 1e-4,
        'epochs': 100,
        'early_stopping_patience': 10,
        'num_workers': 4,
        'use_augmentation': True,
        'label_smoothing': 0.1,
        'train_data_path': 'data/training/products_with_expiry.csv',
        'val_data_path': 'data/training/products_with_expiry.csv'  # Same for demo
    }
    
    # Initialize trainer
    trainer = FoodClassifierTrainer(config)
    
    # Train model
    best_accuracy = trainer.train()
    
    # Plot training history
    trainer.plot_training_history()
    
    # Save final model
    trainer.save_model('final_food_classifier.pth')
    
    logger.info(f"Training completed with best accuracy: {best_accuracy:.2f}%")
    
    # Check if target accuracy achieved
    target_accuracy = 95.0
    if best_accuracy >= target_accuracy:
        logger.info(f"✅ Target accuracy of {target_accuracy}% achieved!")
    else:
        logger.info(f"❌ Target accuracy of {target_accuracy}% not achieved. Current: {best_accuracy:.2f}%")
        logger.info("Consider: more data, longer training, different architecture, or hyperparameter tuning")

if __name__ == "__main__":
    main()
