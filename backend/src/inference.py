import os
import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms.functional as F

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def load_slicktrace_model(model_path: str = "models/slicktrace_mobilenetv3.pth") -> nn.Module:
    """
    Loads the trained MobileNetV3-Small model for SlickTrace from a checkpoint file.
    
    Args:
        model_path: Path to the .pth checkpoint file.
        
    Returns:
        Loaded PyTorch model in evaluation mode on CPU.
        
    Raises:
        FileNotFoundError: If the checkpoint file does not exist.
    """
    if not os.path.exists(model_path):
        # Try parent or alternative paths if needed
        alt_path = os.path.join(os.path.dirname(__file__), "..", model_path)
        if os.path.exists(alt_path):
            model_path = alt_path
        else:
            raise FileNotFoundError(f"Model file '{model_path}' not found.")

    # Re-create MobileNetV3-Small with classifier for 2 classes
    model = torchvision.models.mobilenet_v3_small(weights=None)
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, 2)

    # Load state dict on CPU
    checkpoint = torch.load(model_path, map_location="cpu")
    if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)

    model.eval()
    return model


def predict_oil_probability(crop_gray: np.ndarray, model: nn.Module) -> float:
    """
    Accepts a grayscale OpenCV/Numpy candidate crop, preprocesses it according to
    training parameters, and returns the oil-like probability (class index 1).
    
    Args:
        crop_gray: 2D uint8 numpy array representing candidate image crop.
        model: PyTorch model in evaluation mode.
        
    Returns:
        float: Oil-like probability score between 0.0 and 1.0.
    """
    if crop_gray is None or crop_gray.size == 0 or crop_gray.shape[0] == 0 or crop_gray.shape[1] == 0:
        return 0.0

    # Ensure crop is 2D grayscale
    if len(crop_gray.shape) == 3:
        crop_gray = cv2.cvtColor(crop_gray, cv2.COLOR_BGR2GRAY)

    # Convert to 3 grayscale channels
    crop_3ch = cv2.cvtColor(crop_gray, cv2.COLOR_GRAY2RGB)

    # Resize to 224x224
    resized = cv2.resize(crop_3ch, (224, 224), interpolation=cv2.INTER_LINEAR)

    # Convert to FloatTensor [0.0, 1.0] with shape (C, H, W)
    tensor = torch.from_numpy(resized).permute(2, 0, 1).float() / 255.0

    # ImageNet normalization
    normalized = F.normalize(tensor, mean=MEAN, std=STD)

    # Add batch dimension (1, C, H, W)
    input_batch = normalized.unsqueeze(0)

    # CPU Inference
    with torch.no_grad():
        logits = model(input_batch)
        probabilities = torch.softmax(logits, dim=1)
        oil_prob = probabilities[0, 1].item()

    return float(oil_prob)
