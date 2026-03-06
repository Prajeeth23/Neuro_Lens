"""
DeepGuard Model Architecture
Dual-model system:
  - EfficientNet-B0 for IMAGE deepfake detection
  - SlowFast R50 for VIDEO deepfake detection

Both use ImageNet/Kinetics-400 pre-trained weights with custom heads
fine-tuned for binary classification (REAL vs FAKE).
"""

import torch
import torch.nn as nn
from torchvision import models, transforms


# ===========================================================================
# IMAGE MODEL: EfficientNet-B0
# ===========================================================================

class DeepGuardImageNet(nn.Module):
    """
    EfficientNet-B0 for image deepfake detection.
    Pre-trained on ImageNet, fine-tuned for binary classification.
    """

    def __init__(self, num_classes=2, dropout=0.4, pretrained=True):
        super().__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        self.backbone = models.efficientnet_b0(weights=weights)
        in_features = self.backbone.classifier[1].in_features  # 1280

        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout),
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(p=dropout * 0.5),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        return self.backbone(x)


# ===========================================================================
# VIDEO MODEL: SlowFast R50
# ===========================================================================

class DeepGuardSlowFast(nn.Module):
    """
    SlowFast R50 for video deepfake detection.

    Architecture:
      - Slow pathway: processes 8 frames (low frame rate) for spatial features
      - Fast pathway: processes 32 frames (high frame rate) for temporal features
      - Custom classification head for binary detection

    Pre-trained on Kinetics-400 (action recognition), adapted for deepfake detection
    where temporal inconsistencies and spatial artifacts matter.
    """

    def __init__(self, num_classes=2, pretrained=True):
        super().__init__()

        if pretrained:
            self.slowfast = torch.hub.load(
                "facebookresearch/pytorchvideo",
                "slowfast_r50",
                pretrained=True,
            )
        else:
            self.slowfast = torch.hub.load(
                "facebookresearch/pytorchvideo",
                "slowfast_r50",
                pretrained=False,
            )

        # The original SlowFast head outputs 400 classes (Kinetics-400)
        # Replace with binary classification head
        # The head's projection layer: in_features -> 400
        in_features = self.slowfast.blocks[-1].proj.in_features

        self.slowfast.blocks[-1].proj = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        """
        x: list of [slow_frames, fast_frames]
            slow_frames: (B, C, T_slow, H, W) - 8 frames
            fast_frames: (B, C, T_fast, H, W) - 32 frames
        """
        return self.slowfast(x)


# ===========================================================================
# Transforms
# ===========================================================================

def get_image_transforms(training=False):
    """Image transforms for EfficientNet."""
    if training:
        return transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomCrop(224),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(10),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.1),
            transforms.RandomGrayscale(p=0.05),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            transforms.RandomErasing(p=0.1),
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])


def get_video_transforms(training=False):
    """Video transforms for SlowFast."""
    from pytorchvideo.transforms import (
        Normalize,
        UniformTemporalSubsample,
    )
    from torchvision.transforms import Compose, Lambda

    if training:
        return Compose([
            Lambda(lambda x: x / 255.0),
            Normalize(mean=[0.45, 0.45, 0.45], std=[0.225, 0.225, 0.225]),
        ])
    else:
        return Compose([
            Lambda(lambda x: x / 255.0),
            Normalize(mean=[0.45, 0.45, 0.45], std=[0.225, 0.225, 0.225]),
        ])


# ===========================================================================
# Utilities
# ===========================================================================

def load_image_model(model_path, device="cpu"):
    """Load a trained image model."""
    model = DeepGuardImageNet(pretrained=False)
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()
    return model


def load_video_model(model_path, device="cpu"):
    """Load a trained video model."""
    model = DeepGuardSlowFast(pretrained=False)
    checkpoint = torch.load(model_path, map_location=device, weights_only=False)
    if "model_state_dict" in checkpoint:
        model.load_state_dict(checkpoint["model_state_dict"])
    else:
        model.load_state_dict(checkpoint)
    model.to(device)
    model.eval()
    return model


def pack_slowfast_input(frames_tensor, alpha=4):
    """
    Pack a single video tensor into SlowFast format.

    Args:
        frames_tensor: (C, T, H, W) float tensor, normalized
        alpha: temporal stride ratio (fast/slow frame rate ratio)

    Returns:
        [slow_frames, fast_frames] list for SlowFast input
    """
    # Fast pathway: high frame rate (all frames, subsampled to 32)
    T = frames_tensor.shape[1]
    fast_indices = torch.linspace(0, T - 1, 32).long()
    fast = frames_tensor[:, fast_indices, :, :]

    # Slow pathway: low frame rate (every alpha-th frame from fast, = 8 frames)
    slow_indices = torch.linspace(0, 31, 8).long()
    slow = fast[:, slow_indices, :, :]

    return [slow.unsqueeze(0), fast.unsqueeze(0)]


# Keep backward compatibility
DeepGuardNet = DeepGuardImageNet
get_transforms = get_image_transforms
load_model = load_image_model
