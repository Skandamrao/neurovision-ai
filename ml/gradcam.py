import torch
import torch.nn.functional as F
import cv2
import numpy as np

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        target_layer.register_forward_hook(self.save_activation)
        target_layer.register_full_backward_hook(self.save_gradient)

    def save_activation(self, module, input, output):
        self.activations = output

    def save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_heatmap(self, input_tensor, target_class=None):
        self.model.eval()
        output = self.model(input_tensor)

        if target_class is None:
            target_class = output.argmax(dim=1).item()

        self.model.zero_grad()
        # Create a one-hot tensor for the target class
        target = torch.zeros_like(output)
        target[0][target_class] = 1
        
        # Backpropagate to get gradients
        output.backward(gradient=target, retain_graph=True)

        gradients = self.gradients.cpu().data.numpy()[0]
        activations = self.activations.cpu().data.numpy()[0]

        # Global average pooling on the gradients
        weights = np.mean(gradients, axis=(1, 2))

        # Weight the activations
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        # ReLU on CAM
        cam = np.maximum(cam, 0)
        # Normalize
        cam = cam - np.min(cam)
        if np.max(cam) != 0:
            cam = cam / np.max(cam)
            
        cam = cv2.resize(cam, (224, 224))
        return cam

def overlay_heatmap(img_np, heatmap, alpha=0.5):
    heatmap = 1.0 - heatmap # Invert so high activation is red, wait standard is high=red already
    heatmap = np.uint8(255 * heatmap)
    colormap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    
    img_np = np.uint8(255 * img_np)
    # Convert BGR to RGB for colormap if needed? OpenCV applycolormap returns BGR. 
    # Let's convert colormap to RGB
    colormap = cv2.cvtColor(colormap, cv2.COLOR_BGR2RGB)
    
    superimposed_img = colormap * alpha + img_np * (1.0 - alpha)
    superimposed_img = np.clip(superimposed_img, 0, 255).astype(np.uint8)
    return superimposed_img

class SaliencyMap:
    def __init__(self, model):
        self.model = model

    def generate_saliency(self, input_tensor, target_class=None):
        self.model.eval()
        input_tensor.requires_grad_()
        
        output = self.model(input_tensor)
        if target_class is None:
            target_class = output.argmax(dim=1).item()

        self.model.zero_grad()
        target = torch.zeros_like(output)
        target[0][target_class] = 1
        
        output.backward(gradient=target)
        
        saliency = input_tensor.grad.data.abs().squeeze().cpu().numpy()
        saliency = np.max(saliency, axis=0) # take max across color channels
        
        # Normalize
        saliency = saliency - np.min(saliency)
        if np.max(saliency) != 0:
            saliency = saliency / np.max(saliency)
            
        saliency = cv2.resize(saliency, (224, 224))
        return saliency
