import torch
import torch.nn as nn
from torchvision import models

def get_resnet_model(num_classes=10, pretrained=True):
    if pretrained:
        weights = models.ResNet18_Weights.DEFAULT
    else:
        weights = None
        
    model = models.resnet18(weights=weights)
    num_ftrs = model.fc.in_features
    # Replace the last fully connected layer
    model.fc = nn.Linear(num_ftrs, num_classes)
    return model

def get_mobilenet_model(num_classes=10, pretrained=True):
    if pretrained:
        weights = models.MobileNet_V2_Weights.DEFAULT
    else:
        weights = None
        
    model = models.mobilenet_v2(weights=weights)
    num_ftrs = model.classifier[1].in_features
    # Replace the last fully connected layer
    model.classifier[1] = nn.Linear(num_ftrs, num_classes)
    return model

def get_vit_model(num_classes=10, pretrained=True):
    if pretrained:
        weights = models.ViT_B_16_Weights.DEFAULT
    else:
        weights = None
        
    model = models.vit_b_16(weights=weights)
    num_ftrs = model.heads.head.in_features
    # Replace the last fully connected layer
    model.heads.head = nn.Linear(num_ftrs, num_classes)
    return model
