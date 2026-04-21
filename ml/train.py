import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
from torch.utils.data import DataLoader
from models import get_resnet_model, get_mobilenet_model
from utils import get_transforms
import os
import argparse

def train_model(model_name="resnet", epochs=1, batch_size=32, lr=0.001):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    train_transforms = get_transforms(is_train=True)
    val_transforms = get_transforms(is_train=False)

    print("Loading CIFAR-10 dataset...")
    trainset = torchvision.datasets.CIFAR10(root='./data', train=True, download=True, transform=train_transforms)
    trainloader = DataLoader(trainset, batch_size=batch_size, shuffle=True, num_workers=2)

    valset = torchvision.datasets.CIFAR10(root='./data', train=False, download=True, transform=val_transforms)
    valloader = DataLoader(valset, batch_size=batch_size, shuffle=False, num_workers=2)

    if model_name == "resnet":
        model = get_resnet_model(num_classes=10, pretrained=True)
    elif model_name == "mobilenet":
        model = get_mobilenet_model(num_classes=10, pretrained=True)
    else:
        raise ValueError("Invalid model name")
        
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    os.makedirs('../models', exist_ok=True)

    print(f"Starting training for {model_name} over {epochs} epochs...")
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        for i, data in enumerate(trainloader, 0):
            inputs, labels = data
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            if i % 100 == 99:    # print every 100 mini-batches
                print(f'[{epoch + 1}, {i + 1:5d}] loss: {running_loss / 100:.3f}')
                running_loss = 0.0
        
        # Validation
        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for data in valloader:
                inputs, labels = data
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, predicted = torch.max(outputs.data, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()

        print(f'Validation Accuracy after epoch {epoch+1}: {100 * correct / total:.2f} %')

    print('Finished Training')
    save_path = f'../models/{model_name}_cifar10.pth'
    torch.save(model.state_dict(), save_path)
    print(f'Model saved to {save_path}')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="resnet", choices=["resnet", "mobilenet"])
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--batch_size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=0.001)
    args = parser.parse_args()
    
    train_model(args.model, args.epochs, args.batch_size, args.lr)
