"""
Generate Google Colab Notebooks for PantryPal ML Training
Run this script to create all training notebooks
"""

import json
import os

def create_food_classifier_notebook():
    """Create notebook for food classification training"""
    notebook = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {
            "colab": {
                "provenance": [],
                "gpuType": "T4"
            },
            "kernelspec": {
                "name": "python3",
                "display_name": "Python 3"
            },
            "accelerator": "GPU"
        },
        "cells": []
    }
    
    cells = [
        # Title
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# PantryPal Food Classifier Training\\n",
                "\\n",
                "**Target**: >95% accuracy on UK foods\\n",
                "\\n",
                "## Instructions:\\n",
                "1. Runtime → Change runtime type → Select T4 GPU\\n",
                "2. Run all cells in order\\n",
                "3. Download the trained model at the end"
            ]
        },
        # Install dependencies
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "!pip install -q torch torchvision pillow tqdm scikit-learn matplotlib\\n",
                "print('✅ Dependencies installed')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Imports
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import torch\n",
                "import torch.nn as nn\n",
                "import torch.optim as optim\n",
                "from torch.utils.data import Dataset, DataLoader\n",
                "import torchvision.transforms as transforms\n",
                "import torchvision.models as models\n",
                "from PIL import Image\n",
                "import json\n",
                "import os\n",
                "import numpy as np\n",
                "from tqdm import tqdm\n",
                "from sklearn.metrics import classification_report, accuracy_score\n",
                "import matplotlib.pyplot as plt\n",
                "\n",
                "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\n",
                "print(f'Using device: {device}')\n",
                "if torch.cuda.is_available():\n",
                "    print(f'GPU: {torch.cuda.get_device_name(0)}')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Download dataset
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Download Food-101 dataset\\n",
                "!wget -q http://data.vision.ee.ethz.ch/cvl/food-101.tar.gz\\n",
                "!tar -xzf food-101.tar.gz\\n",
                "print('✅ Dataset downloaded and extracted')\\n",
                "\\n",
                "# UK Food categories mapping\\n",
                "UK_CATEGORIES = {\\n",
                "    'apple_pie': 'Bakery', 'bread_pudding': 'Bakery', 'carrot_cake': 'Bakery',\\n",
                "    'cheese_plate': 'Dairy & Eggs', 'cheesecake': 'Dairy & Eggs',\\n",
                "    'chicken_curry': 'Meat & Poultry', 'beef_carpaccio': 'Meat & Poultry',\\n",
                "    'fish_and_chips': 'Fish & Seafood', 'grilled_salmon': 'Fish & Seafood',\\n",
                "    'french_fries': 'Vegetables', 'caesar_salad': 'Vegetables'\\n",
                "}"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Dataset class
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "class FoodDataset(Dataset):\\n",
                "    def __init__(self, data_dir, transform=None):\\n",
                "        self.data_dir = data_dir\\n",
                "        self.transform = transform\\n",
                "        self.samples = []\\n",
                "        self.class_to_idx = {}\\n",
                "        \\n",
                "        categories = sorted(os.listdir(data_dir))\\n",
                "        for idx, category in enumerate(categories):\\n",
                "            self.class_to_idx[category] = idx\\n",
                "            category_path = os.path.join(data_dir, category)\\n",
                "            if os.path.isdir(category_path):\\n",
                "                for img_name in os.listdir(category_path):\\n",
                "                    if img_name.endswith(('.jpg', '.jpeg', '.png')):\\n",
                "                        self.samples.append((os.path.join(category_path, img_name), idx))\\n",
                "    \\n",
                "    def __len__(self):\\n",
                "        return len(self.samples)\\n",
                "    \\n",
                "    def __getitem__(self, idx):\\n",
                "        img_path, label = self.samples[idx]\\n",
                "        image = Image.open(img_path).convert('RGB')\\n",
                "        if self.transform:\\n",
                "            image = self.transform(image)\\n",
                "        return image, label\\n",
                "\\n",
                "# Transforms\\n",
                "train_transform = transforms.Compose([\\n",
                "    transforms.Resize((224, 224)),\\n",
                "    transforms.RandomHorizontalFlip(),\\n",
                "    transforms.RandomRotation(15),\\n",
                "    transforms.ColorJitter(brightness=0.2),\\n",
                "    transforms.ToTensor(),\\n",
                "    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])\\n",
                "])\\n",
                "\\n",
                "test_transform = transforms.Compose([\\n",
                "    transforms.Resize((224, 224)),\\n",
                "    transforms.ToTensor(),\\n",
                "    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])\\n",
                "])\\n",
                "\\n",
                "print('✅ Dataset class created')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Model definition
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "class FoodClassifier(nn.Module):\\n",
                "    def __init__(self, num_classes):\\n",
                "        super(FoodClassifier, self).__init__()\\n",
                "        self.backbone = models.efficientnet_b0(pretrained=True)\\n",
                "        in_features = self.backbone.classifier[1].in_features\\n",
                "        self.backbone.classifier = nn.Sequential(\\n",
                "            nn.Dropout(0.3),\\n",
                "            nn.Linear(in_features, num_classes)\\n",
                "        )\\n",
                "    \\n",
                "    def forward(self, x):\\n",
                "        return self.backbone(x)\\n",
                "\\n",
                "print('✅ Model defined')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Training function
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "def train_epoch(model, loader, criterion, optimizer):\\n",
                "    model.train()\\n",
                "    running_loss = 0.0\\n",
                "    for images, labels in tqdm(loader, desc='Training'):\\n",
                "        images, labels = images.to(device), labels.to(device)\\n",
                "        optimizer.zero_grad()\\n",
                "        outputs = model(images)\\n",
                "        loss = criterion(outputs, labels)\\n",
                "        loss.backward()\\n",
                "        optimizer.step()\\n",
                "        running_loss += loss.item()\\n",
                "    return running_loss / len(loader)\\n",
                "\\n",
                "def validate(model, loader):\\n",
                "    model.eval()\\n",
                "    preds, labels_list = [], []\\n",
                "    with torch.no_grad():\\n",
                "        for images, labels in loader:\\n",
                "            images = images.to(device)\\n",
                "            outputs = model(images)\\n",
                "            _, predicted = torch.max(outputs, 1)\\n",
                "            preds.extend(predicted.cpu().numpy())\\n",
                "            labels_list.extend(labels.numpy())\\n",
                "    return accuracy_score(labels_list, preds)\\n",
                "\\n",
                "print('✅ Training functions ready')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Load data and train
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Load datasets\\n",
                "train_dataset = FoodDataset('food-101/images', transform=train_transform)\\n",
                "test_dataset = FoodDataset('food-101/images', transform=test_transform)\\n",
                "\\n",
                "train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)\\n",
                "test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)\\n",
                "\\n",
                "# Initialize model\\n",
                "num_classes = len(train_dataset.class_to_idx)\\n",
                "model = FoodClassifier(num_classes).to(device)\\n",
                "criterion = nn.CrossEntropyLoss()\\n",
                "optimizer = optim.Adam(model.parameters(), lr=0.001)\\n",
                "\\n",
                "print(f'Training on {len(train_dataset)} samples')\\n",
                "print(f'Number of classes: {num_classes}')\\n",
                "\\n",
                "# Train\\n",
                "num_epochs = 15\\n",
                "train_losses = []\\n",
                "val_accuracies = []\\n",
                "\\n",
                "for epoch in range(num_epochs):\\n",
                "    print(f'\\\\nEpoch {epoch+1}/{num_epochs}')\\n",
                "    loss = train_epoch(model, train_loader, criterion, optimizer)\\n",
                "    acc = validate(model, test_loader)\\n",
                "    train_losses.append(loss)\\n",
                "    val_accuracies.append(acc)\\n",
                "    print(f'Loss: {loss:.4f}, Accuracy: {acc:.4f} ({acc*100:.2f}%)')\\n",
                "\\n",
                "final_accuracy = val_accuracies[-1]\\n",
                "if final_accuracy >= 0.95:\\n",
                "    print(f'\\\\n✅ TARGET ACHIEVED: {final_accuracy*100:.2f}% accuracy')\\n",
                "else:\\n",
                "    print(f'\\\\n⚠️ Target not met: {final_accuracy*100:.2f}% (need 95%)')"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Plot results
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))\\n",
                "\\n",
                "ax1.plot(train_losses)\\n",
                "ax1.set_title('Training Loss')\\n",
                "ax1.set_xlabel('Epoch')\\n",
                "ax1.set_ylabel('Loss')\\n",
                "ax1.grid(True)\\n",
                "\\n",
                "ax2.plot(val_accuracies)\\n",
                "ax2.axhline(y=0.95, color='r', linestyle='--', label='Target (95%)')\\n",
                "ax2.set_title('Validation Accuracy')\\n",
                "ax2.set_xlabel('Epoch')\\n",
                "ax2.set_ylabel('Accuracy')\\n",
                "ax2.legend()\\n",
                "ax2.grid(True)\\n",
                "\\n",
                "plt.tight_layout()\\n",
                "plt.show()"
            ],
            "execution_count": None,
            "outputs": []
        },
        # Save model
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Save model\\n",
                "idx_to_class = {v: k for k, v in train_dataset.class_to_idx.items()}\\n",
                "\\n",
                "save_dict = {\\n",
                "    'model_state_dict': model.state_dict(),\\n",
                "    'class_to_idx': train_dataset.class_to_idx,\\n",
                "    'idx_to_class': idx_to_class,\\n",
                "    'num_classes': num_classes,\\n",
                "    'final_accuracy': final_accuracy\\n",
                "}\\n",
                "\\n",
                "torch.save(save_dict, 'food_classifier.pth')\\n",
                "\\n",
                "with open('food_classes.json', 'w') as f:\\n",
                "    json.dump(idx_to_class, f, indent=2)\\n",
                "\\n",
                "print('✅ Model saved!')\\n",
                "print('\\\\n📥 Download these files:')\\n",
                "print('1. food_classifier.pth')\\n",
                "print('2. food_classes.json')\\n",
                "print('\\\\nPlace them in: ml-models/models/')"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]
    
    notebook['cells'] = cells
    return notebook


def create_expiry_predictor_notebook():
    """Create notebook for expiry prediction training"""
    notebook = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {
            "colab": {"provenance": []},
            "kernelspec": {"name": "python3", "display_name": "Python 3"}
        },
        "cells": []
    }
    
    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# PantryPal Expiry Prediction Model\\n",
                "\\n",
                "**Target**: <2 days average error\\n",
                "\\n",
                "This notebook trains an LSTM model for food expiry prediction."
            ]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "!pip install -q torch pandas scikit-learn matplotlib\\n",
                "print('✅ Dependencies installed')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import torch\\n",
                "import torch.nn as nn\\n",
                "import pandas as pd\\n",
                "import numpy as np\\n",
                "from sklearn.preprocessing import LabelEncoder\\n",
                "from sklearn.metrics import mean_absolute_error\\n",
                "import matplotlib.pyplot as plt\\n",
                "\\n",
                "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\\n",
                "print(f'Using device: {device}')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Generate synthetic UK food data\\n",
                "categories = ['Dairy & Eggs', 'Meat & Poultry', 'Fish & Seafood', 'Bakery', \\n",
                "              'Fruits', 'Vegetables', 'Frozen', 'Pantry']\\n",
                "storage_types = ['fridge', 'freezer', 'pantry', 'countertop']\\n",
                "\\n",
                "# Typical shelf life in days (UK standards)\\n",
                "shelf_life_map = {\\n",
                "    'Dairy & Eggs': {'fridge': 7, 'freezer': 90, 'pantry': 180, 'countertop': 2},\\n",
                "    'Meat & Poultry': {'fridge': 3, 'freezer': 180, 'pantry': 0, 'countertop': 0},\\n",
                "    'Fish & Seafood': {'fridge': 2, 'freezer': 90, 'pantry': 0, 'countertop': 0},\\n",
                "    'Bakery': {'fridge': 7, 'freezer': 30, 'pantry': 5, 'countertop': 3},\\n",
                "    'Fruits': {'fridge': 7, 'freezer': 180, 'pantry': 5, 'countertop': 5},\\n",
                "    'Vegetables': {'fridge': 7, 'freezer': 180, 'pantry': 14, 'countertop': 3},\\n",
                "    'Frozen': {'fridge': 1, 'freezer': 365, 'pantry': 0, 'countertop': 0},\\n",
                "    'Pantry': {'fridge': 30, 'freezer': 90, 'pantry': 365, 'countertop': 180}\\n",
                "}\\n",
                "\\n",
                "# Generate 10000 samples\\n",
                "data = []\\n",
                "for _ in range(10000):\\n",
                "    cat = np.random.choice(categories)\\n",
                "    stor = np.random.choice(storage_types)\\n",
                "    base_days = shelf_life_map[cat][stor]\\n",
                "    if base_days > 0:\\n",
                "        # Add randomness\\n",
                "        actual_days = int(base_days + np.random.normal(0, base_days * 0.2))\\n",
                "        actual_days = max(1, actual_days)\\n",
                "        temp = 4 if stor == 'fridge' else (-18 if stor == 'freezer' else 20)\\n",
                "        temp += np.random.normal(0, 2)\\n",
                "        quality = np.random.uniform(0.5, 1.0)\\n",
                "        data.append([cat, stor, temp, quality, actual_days])\\n",
                "\\n",
                "df = pd.DataFrame(data, columns=['category', 'storage_type', 'storage_temp', 'package_quality', 'expiry_days'])\\n",
                "print(f'Generated {len(df)} samples')\\n",
                "df.head()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Encode categorical features\\n",
                "le_cat = LabelEncoder()\\n",
                "le_stor = LabelEncoder()\\n",
                "\\n",
                "df['category_encoded'] = le_cat.fit_transform(df['category'])\\n",
                "df['storage_type_encoded'] = le_stor.fit_transform(df['storage_type'])\\n",
                "\\n",
                "# Prepare features\\n",
                "X = df[['category_encoded', 'storage_type_encoded', 'storage_temp', 'package_quality']].values\\n",
                "y = df['expiry_days'].values\\n",
                "\\n",
                "# Split data\\n",
                "split = int(0.8 * len(X))\\n",
                "X_train, X_test = X[:split], X[split:]\\n",
                "y_train, y_test = y[:split], y[split:]\\n",
                "\\n",
                "# Convert to tensors\\n",
                "X_train = torch.FloatTensor(X_train).unsqueeze(1).to(device)\\n",
                "X_test = torch.FloatTensor(X_test).unsqueeze(1).to(device)\\n",
                "y_train = torch.FloatTensor(y_train).to(device)\\n",
                "y_test = torch.FloatTensor(y_test).to(device)\\n",
                "\\n",
                "print(f'Train: {len(X_train)}, Test: {len(X_test)}')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# LSTM Model\\n",
                "class ExpiryLSTM(nn.Module):\\n",
                "    def __init__(self, input_size, hidden_size=128):\\n",
                "        super(ExpiryLSTM, self).__init__()\\n",
                "        self.lstm = nn.LSTM(input_size, hidden_size, batch_first=True)\\n",
                "        self.fc = nn.Sequential(\\n",
                "            nn.Linear(hidden_size, 64),\\n",
                "            nn.ReLU(),\\n",
                "            nn.Dropout(0.2),\\n",
                "            nn.Linear(64, 1)\\n",
                "        )\\n",
                "    \\n",
                "    def forward(self, x):\\n",
                "        lstm_out, _ = self.lstm(x)\\n",
                "        return self.fc(lstm_out[:, -1, :])\\n",
                "\\n",
                "model = ExpiryLSTM(input_size=4).to(device)\\n",
                "criterion = nn.MSELoss()\\n",
                "optimizer = torch.optim.Adam(model.parameters(), lr=0.001)\\n",
                "\\n",
                "print('✅ Model created')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Train model\\n",
                "epochs = 50\\n",
                "losses = []\\n",
                "maes = []\\n",
                "\\n",
                "for epoch in range(epochs):\\n",
                "    model.train()\\n",
                "    optimizer.zero_grad()\\n",
                "    predictions = model(X_train).squeeze()\\n",
                "    loss = criterion(predictions, y_train)\\n",
                "    loss.backward()\\n",
                "    optimizer.step()\\n",
                "    \\n",
                "    # Evaluate\\n",
                "    model.eval()\\n",
                "    with torch.no_grad():\\n",
                "        test_pred = model(X_test).squeeze()\\n",
                "        mae = torch.mean(torch.abs(test_pred - y_test)).item()\\n",
                "    \\n",
                "    losses.append(loss.item())\\n",
                "    maes.append(mae)\\n",
                "    \\n",
                "    if (epoch + 1) % 10 == 0:\\n",
                "        print(f'Epoch {epoch+1}: Loss={loss.item():.4f}, MAE={mae:.2f} days')\\n",
                "\\n",
                "final_mae = maes[-1]\\n",
                "if final_mae < 2:\\n",
                "    print(f'\\\\n✅ TARGET ACHIEVED: {final_mae:.2f} days MAE')\\n",
                "else:\\n",
                "    print(f'\\\\n⚠️ Target not met: {final_mae:.2f} days (need <2 days)')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Plot results\\n",
                "fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))\\n",
                "\\n",
                "ax1.plot(losses)\\n",
                "ax1.set_title('Training Loss')\\n",
                "ax1.set_xlabel('Epoch')\\n",
                "ax1.set_ylabel('MSE Loss')\\n",
                "ax1.grid(True)\\n",
                "\\n",
                "ax2.plot(maes)\\n",
                "ax2.axhline(y=2, color='r', linestyle='--', label='Target (2 days)')\\n",
                "ax2.set_title('Mean Absolute Error')\\n",
                "ax2.set_xlabel('Epoch')\\n",
                "ax2.set_ylabel('Days')\\n",
                "ax2.legend()\\n",
                "ax2.grid(True)\\n",
                "\\n",
                "plt.tight_layout()\\n",
                "plt.show()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Save model\\n",
                "import json\\n",
                "\\n",
                "save_dict = {\\n",
                "    'model_state_dict': model.state_dict(),\\n",
                "    'category_encoder': {cat: int(le_cat.transform([cat])[0]) for cat in categories},\\n",
                "    'storage_encoder': {stor: int(le_stor.transform([stor])[0]) for stor in storage_types},\\n",
                "    'final_mae': final_mae\\n",
                "}\\n",
                "\\n",
                "torch.save(save_dict, 'expiry_predictor.pth')\\n",
                "\\n",
                "print('✅ Model saved!')\\n",
                "print('\\\\n📥 Download: expiry_predictor.pth')\\n",
                "print('Place in: ml-models/models/')"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]
    
    notebook['cells'] = cells
    return notebook


def create_waste_predictor_notebook():
    """Create notebook for waste prediction training"""
    notebook = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {
            "colab": {"provenance": []},
            "kernelspec": {"name": "python3", "display_name": "Python 3"}
        },
        "cells": []
    }
    
    cells = [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# PantryPal Waste Prediction Model\\n",
                "\\n",
                "**Target**: >85% accuracy\\n",
                "\\n",
                "This notebook trains an ensemble model for food waste prediction."
            ]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "!pip install -q scikit-learn pandas numpy matplotlib xgboost\\n",
                "print('✅ Dependencies installed')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "import numpy as np\\n",
                "import pandas as pd\\n",
                "from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\\n",
                "from sklearn.preprocessing import LabelEncoder\\n",
                "from sklearn.metrics import accuracy_score, classification_report\\n",
                "import matplotlib.pyplot as plt\\n",
                "import pickle\\n",
                "\\n",
                "print('✅ Libraries imported')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Generate synthetic waste data\\n",
                "categories = ['Dairy & Eggs', 'Meat & Poultry', 'Fish & Seafood', 'Bakery',\\n",
                "              'Fruits', 'Vegetables', 'Frozen', 'Pantry']\\n",
                "\\n",
                "# Waste likelihood by category (UK statistics)\\n",
                "waste_prob = {\\n",
                "    'Dairy & Eggs': 0.35,\\n",
                "    'Meat & Poultry': 0.25,\\n",
                "    'Fish & Seafood': 0.40,\\n",
                "    'Bakery': 0.45,\\n",
                "    'Fruits': 0.30,\\n",
                "    'Vegetables': 0.28,\\n",
                "    'Frozen': 0.10,\\n",
                "    'Pantry': 0.15\\n",
                "}\\n",
                "\\n",
                "data = []\\n",
                "for _ in range(15000):\\n",
                "    cat = np.random.choice(categories)\\n",
                "    days_until_exp = np.random.randint(-5, 30)\\n",
                "    quantity = np.random.uniform(0.1, 5.0)\\n",
                "    price = np.random.uniform(1, 50)\\n",
                "    freq = np.random.randint(0, 20)  # usage frequency\\n",
                "    \\n",
                "    # Determine waste (higher if expired, low frequency, high quantity)\\n",
                "    base_prob = waste_prob[cat]\\n",
                "    if days_until_exp < 0:\\n",
                "        base_prob += 0.4\\n",
                "    if days_until_exp < 3:\\n",
                "        base_prob += 0.2\\n",
                "    if freq < 5:\\n",
                "        base_prob += 0.15\\n",
                "    if quantity > 3:\\n",
                "        base_prob += 0.1\\n",
                "    \\n",
                "    was_wasted = np.random.random() < min(base_prob, 0.95)\\n",
                "    \\n",
                "    data.append([cat, days_until_exp, quantity, price, freq, int(was_wasted)])\\n",
                "\\n",
                "df = pd.DataFrame(data, columns=['category', 'days_until_expiry', 'quantity', 'price', 'usage_frequency', 'was_wasted'])\\n",
                "print(f'Generated {len(df)} samples')\\n",
                "print(f'Waste rate: {df[\\'was_wasted\\'].mean()*100:.1f}%')\\n",
                "df.head()"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Encode categories\\n",
                "le = LabelEncoder()\\n",
                "df['category_encoded'] = le.fit_transform(df['category'])\\n",
                "\\n",
                "# Prepare data\\n",
                "X = df[['category_encoded', 'days_until_expiry', 'quantity', 'price', 'usage_frequency']].values\\n",
                "y = df['was_wasted'].values\\n",
                "\\n",
                "# Split\\n",
                "split = int(0.8 * len(X))\\n",
                "X_train, X_test = X[:split], X[split:]\\n",
                "y_train, y_test = y[:split], y[split:]\\n",
                "\\n",
                "print(f'Train: {len(X_train)}, Test: {len(X_test)}')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Train ensemble models\\n",
                "print('Training Random Forest...')\\n",
                "rf_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)\\n",
                "rf_model.fit(X_train, y_train)\\n",
                "rf_acc = accuracy_score(y_test, rf_model.predict(X_test))\\n",
                "print(f'Random Forest Accuracy: {rf_acc*100:.2f}%')\\n",
                "\\n",
                "print('\\\\nTraining Gradient Boosting...')\\n",
                "gb_model = GradientBoostingClassifier(n_estimators=100, max_depth=5, random_state=42)\\n",
                "gb_model.fit(X_train, y_train)\\n",
                "gb_acc = accuracy_score(y_test, gb_model.predict(X_test))\\n",
                "print(f'Gradient Boosting Accuracy: {gb_acc*100:.2f}%')\\n",
                "\\n",
                "# Ensemble prediction (average)\\n",
                "rf_pred = rf_model.predict_proba(X_test)[:, 1]\\n",
                "gb_pred = gb_model.predict_proba(X_test)[:, 1]\\n",
                "ensemble_pred = ((rf_pred + gb_pred) / 2 > 0.5).astype(int)\\n",
                "ensemble_acc = accuracy_score(y_test, ensemble_pred)\\n",
                "\\n",
                "print(f'\\\\nEnsemble Accuracy: {ensemble_acc*100:.2f}%')\\n",
                "\\n",
                "if ensemble_acc >= 0.85:\\n",
                "    print(f'✅ TARGET ACHIEVED: {ensemble_acc*100:.2f}% accuracy')\\n",
                "else:\\n",
                "    print(f'⚠️ Target not met: {ensemble_acc*100:.2f}% (need 85%)')"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Classification report\\n",
                "print('Classification Report:')\\n",
                "print(classification_report(y_test, ensemble_pred, target_names=['Not Wasted', 'Wasted']))"
            ],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": [
                "# Save models\\n",
                "import pickle\\n",
                "\\n",
                "save_dict = {\\n",
                "    'rf_model': rf_model,\\n",
                "    'gb_model': gb_model,\\n",
                "    'category_encoder': {cat: int(le.transform([cat])[0]) for cat in categories},\\n",
                "    'ensemble_accuracy': ensemble_acc\\n",
                "}\\n",
                "\\n",
                "with open('waste_predictor.pkl', 'wb') as f:\\n",
                "    pickle.dump(save_dict, f)\\n",
                "\\n",
                "print('✅ Model saved!')\\n",
                "print('\\\\n📥 Download: waste_predictor.pkl')\\n",
                "print('Place in: ml-models/models/')"
            ],
            "execution_count": None,
            "outputs": []
        }
    ]
    
    notebook['cells'] = cells
    return notebook


def main():
    """Generate all notebooks"""
    os.makedirs('colab_notebooks', exist_ok=True)
    
    print("Generating Google Colab Notebooks...")
    
    # Food Classifier
    print("1. Creating Food Classifier notebook...")
    food_nb = create_food_classifier_notebook()
    with open('colab_notebooks/01_Food_Classifier_Training.ipynb', 'w') as f:
        json.dump(food_nb, f, indent=2)
    print("   ✅ 01_Food_Classifier_Training.ipynb")
    
    # Expiry Predictor
    print("2. Creating Expiry Predictor notebook...")
    expiry_nb = create_expiry_predictor_notebook()
    with open('colab_notebooks/02_Expiry_Predictor_Training.ipynb', 'w') as f:
        json.dump(expiry_nb, f, indent=2)
    print("   ✅ 02_Expiry_Predictor_Training.ipynb")
    
    # Waste Predictor
    print("3. Creating Waste Predictor notebook...")
    waste_nb = create_waste_predictor_notebook()
    with open('colab_notebooks/03_Waste_Predictor_Training.ipynb', 'w') as f:
        json.dump(waste_nb, f, indent=2)
    print("   ✅ 03_Waste_Predictor_Training.ipynb")
    
    print("\n✅ All notebooks created successfully!")
    print("\nNext steps:")
    print("1. Upload notebooks to Google Colab")
    print("2. Run each notebook with GPU enabled")
    print("3. Download trained models")
    print("4. Place models in ml-models/models/")

if __name__ == '__main__':
    main()

