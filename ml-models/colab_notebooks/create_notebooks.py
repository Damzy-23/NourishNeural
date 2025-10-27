import json

# Food Classifier Notebook
food_nb = {
    "nbformat": 4,
    "nbformat_minor": 0,
    "metadata": {
        "colab": {"provenance": [], "gpuType": "T4"},
        "kernelspec": {"name": "python3", "display_name": "Python 3"},
        "accelerator": "GPU"
    },
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": ["# PantryPal Food Classifier Training\n", "\n", "**Target**: >95% accuracy on UK foods\n", "\n", "## Instructions:\n", "1. Runtime → Change runtime type → Select T4 GPU\n", "2. Run all cells in order\n", "3. Download the trained model at the end"]
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["!pip install -q torch torchvision pillow tqdm scikit-learn matplotlib\n", "print('✅ Dependencies installed')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["import torch\n", "import torch.nn as nn\n", "import torch.optim as optim\n", "from torch.utils.data import Dataset, DataLoader\n", "import torchvision.transforms as transforms\n", "import torchvision.models as models\n", "from PIL import Image\n", "import json\n", "import os\n", "import numpy as np\n", "from tqdm import tqdm\n", "from sklearn.metrics import classification_report, accuracy_score\n", "import matplotlib.pyplot as plt\n", "\n", "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\n", "print(f'Using device: {device}')\n", "if torch.cuda.is_available():\n", "    print(f'GPU: {torch.cuda.get_device_name(0)}')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["# Download Food-101 dataset\n", "!wget -q http://data.vision.ee.ethz.ch/cvl/food-101.tar.gz\n", "!tar -xzf food-101.tar.gz\n", "print('✅ Dataset downloaded')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["class FoodDataset(Dataset):\n", "    def __init__(self, data_dir, transform=None):\n", "        self.data_dir = data_dir\n", "        self.transform = transform\n", "        self.samples = []\n", "        self.class_to_idx = {}\n", "        \n", "        categories = sorted(os.listdir(data_dir))\n", "        for idx, category in enumerate(categories):\n", "            self.class_to_idx[category] = idx\n", "            category_path = os.path.join(data_dir, category)\n", "            if os.path.isdir(category_path):\n", "                for img_name in os.listdir(category_path):\n", "                    if img_name.endswith(('.jpg', '.jpeg', '.png')):\n", "                        self.samples.append((os.path.join(category_path, img_name), idx))\n", "    \n", "    def __len__(self):\n", "        return len(self.samples)\n", "    \n", "    def __getitem__(self, idx):\n", "        img_path, label = self.samples[idx]\n", "        image = Image.open(img_path).convert('RGB')\n", "        if self.transform:\n", "            image = self.transform(image)\n", "        return image, label\n", "\n", "train_transform = transforms.Compose([\n", "    transforms.Resize((224, 224)),\n", "    transforms.RandomHorizontalFlip(),\n", "    transforms.RandomRotation(15),\n", "    transforms.ColorJitter(brightness=0.2),\n", "    transforms.ToTensor(),\n", "    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])\n", "])\n", "\n", "test_transform = transforms.Compose([\n", "    transforms.Resize((224, 224)),\n", "    transforms.ToTensor(),\n", "    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])\n", "])\n", "\n", "print('✅ Dataset class created')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["class FoodClassifier(nn.Module):\n", "    def __init__(self, num_classes):\n", "        super(FoodClassifier, self).__init__()\n", "        self.backbone = models.efficientnet_b0(pretrained=True)\n", "        in_features = self.backbone.classifier[1].in_features\n", "        self.backbone.classifier = nn.Sequential(\n", "            nn.Dropout(0.3),\n", "            nn.Linear(in_features, num_classes)\n", "        )\n", "    \n", "    def forward(self, x):\n", "        return self.backbone(x)\n", "\n", "print('✅ Model defined')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["def train_epoch(model, loader, criterion, optimizer):\n", "    model.train()\n", "    running_loss = 0.0\n", "    for images, labels in tqdm(loader, desc='Training'):\n", "        images, labels = images.to(device), labels.to(device)\n", "        optimizer.zero_grad()\n", "        outputs = model(images)\n", "        loss = criterion(outputs, labels)\n", "        loss.backward()\n", "        optimizer.step()\n", "        running_loss += loss.item()\n", "    return running_loss / len(loader)\n", "\n", "def validate(model, loader):\n", "    model.eval()\n", "    preds, labels_list = [], []\n", "    with torch.no_grad():\n", "        for images, labels in loader:\n", "            images = images.to(device)\n", "            outputs = model(images)\n", "            _, predicted = torch.max(outputs, 1)\n", "            preds.extend(predicted.cpu().numpy())\n", "            labels_list.extend(labels.numpy())\n", "    return accuracy_score(labels_list, preds)\n", "\n", "print('✅ Training functions ready')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["# Load datasets\n", "train_dataset = FoodDataset('food-101/images', transform=train_transform)\n", "test_dataset = FoodDataset('food-101/images', transform=test_transform)\n", "\n", "train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)\n", "test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)\n", "\n", "num_classes = len(train_dataset.class_to_idx)\n", "model = FoodClassifier(num_classes).to(device)\n", "criterion = nn.CrossEntropyLoss()\n", "optimizer = optim.Adam(model.parameters(), lr=0.001)\n", "\n", "print(f'Training on {len(train_dataset)} samples')\n", "print(f'Number of classes: {num_classes}')\n", "\n", "# Train\n", "num_epochs = 15\n", "train_losses = []\n", "val_accuracies = []\n", "\n", "for epoch in range(num_epochs):\n", "    print(f'\\nEpoch {epoch+1}/{num_epochs}')\n", "    loss = train_epoch(model, train_loader, criterion, optimizer)\n", "    acc = validate(model, test_loader)\n", "    train_losses.append(loss)\n", "    val_accuracies.append(acc)\n", "    print(f'Loss: {loss:.4f}, Accuracy: {acc:.4f} ({acc*100:.2f}%)')\n", "\n", "final_accuracy = val_accuracies[-1]\n", "if final_accuracy >= 0.95:\n", "    print(f'\\n✅ TARGET ACHIEVED: {final_accuracy*100:.2f}% accuracy')\n", "else:\n", "    print(f'\\n⚠️ Target not met: {final_accuracy*100:.2f}% (need 95%)')"],
            "execution_count": None,
            "outputs": []
        },
        {
            "cell_type": "code",
            "metadata": {},
            "source": ["# Save model\n", "idx_to_class = {v: k for k, v in train_dataset.class_to_idx.items()}\n", "\n", "save_dict = {\n", "    'model_state_dict': model.state_dict(),\n", "    'class_to_idx': train_dataset.class_to_idx,\n", "    'idx_to_class': idx_to_class,\n", "    'num_classes': num_classes,\n", "    'final_accuracy': final_accuracy\n", "}\n", "\n", "torch.save(save_dict, 'food_classifier.pth')\n", "\n", "with open('food_classes.json', 'w') as f:\n", "    json.dump(idx_to_class, f, indent=2)\n", "\n", "print('✅ Model saved!')\n", "print('\\n📥 Download these files:')\n", "print('1. food_classifier.pth')\n", "print('2. food_classes.json')\n", "print('\\nPlace them in: ml-models/models/')"],
            "execution_count": None,
            "outputs": []
        }
    ]
}

# Save notebook
with open('01_Food_Classifier_Training.ipynb', 'w') as f:
    json.dump(food_nb, f, indent=2)

print("✅ Created: 01_Food_Classifier_Training.ipynb")
print("\nNotebook is ready to upload to Google Colab!")

