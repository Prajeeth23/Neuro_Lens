"""
DeepGuard Training Script
Trains both image (EfficientNet-B0) and video (SlowFast R50) deepfake detectors.

Usage:
  Image model:
    python train.py --mode image --data ./data --epochs 20 --batch-size 32

  Video model:
    python train.py --mode video --data ./video_data --epochs 15 --batch-size 4

Dataset structure:
  For images:   data/{train,val}/{real,fake}/*.jpg
  For videos:   video_data/{train,val}/{real,fake}/*.mp4
"""

import os
import sys
import time
import argparse

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torch.optim.lr_scheduler import CosineAnnealingLR

from model import (
    DeepGuardImageNet,
    DeepGuardSlowFast,
    get_image_transforms,
    pack_slowfast_input,
)
from dataset import DeepfakeDataset


# ===========================================================================
# Video Dataset
# ===========================================================================

class DeepfakeVideoDataset(Dataset):
    """
    Load videos from real/ and fake/ directories.
    Extracts frames and packs them into SlowFast input format.
    """

    VALID_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}

    def __init__(self, root_dir, num_frames=64, frame_size=256):
        self.root_dir = root_dir
        self.num_frames = num_frames
        self.frame_size = frame_size
        self.samples = []

        for label, subdir in [(0, "real"), (1, "fake")]:
            folder = os.path.join(root_dir, subdir)
            if os.path.isdir(folder):
                for f in os.listdir(folder):
                    if os.path.splitext(f)[1].lower() in self.VALID_EXTENSIONS:
                        self.samples.append((os.path.join(folder, f), label))

        n_real = sum(1 for _, l in self.samples if l == 0)
        n_fake = sum(1 for _, l in self.samples if l == 1)
        print(f"Video dataset: {len(self.samples)} videos ({n_real} real, {n_fake} fake)")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        frames = self._extract_frames(path)
        # Pack into SlowFast format
        slow, fast = self._pack_slowfast(frames)
        return [slow, fast], label

    def _extract_frames(self, video_path):
        """Extract frames from video using av (PyAV)."""
        import av
        import numpy as np
        from PIL import Image
        from torchvision.transforms import Compose, Resize, ToTensor, Normalize

        transform = Compose([
            Resize((self.frame_size, self.frame_size)),
            ToTensor(),
            Normalize(mean=[0.45, 0.45, 0.45], std=[0.225, 0.225, 0.225]),
        ])

        try:
            container = av.open(video_path)
            stream = container.streams.video[0]
            total_frames = stream.frames or 300

            # Sample frame indices uniformly
            indices = torch.linspace(0, total_frames - 1, self.num_frames).long().tolist()
            indices_set = set(indices)

            frames = []
            for i, frame in enumerate(container.decode(video=0)):
                if i in indices_set:
                    pil_img = frame.to_image().convert("RGB")
                    frames.append(transform(pil_img))
                if len(frames) >= self.num_frames:
                    break

            container.close()

            # Pad if not enough frames
            while len(frames) < self.num_frames:
                frames.append(frames[-1] if frames else torch.zeros(3, self.frame_size, self.frame_size))

        except Exception as e:
            print(f"Warning: Failed to read {video_path}: {e}")
            frames = [torch.zeros(3, self.frame_size, self.frame_size)] * self.num_frames

        # Stack: (T, C, H, W) -> (C, T, H, W)
        video_tensor = torch.stack(frames).permute(1, 0, 2, 3)
        return video_tensor

    def _pack_slowfast(self, video_tensor, alpha=4):
        """Pack video tensor into [slow, fast] pathways."""
        C, T, H, W = video_tensor.shape

        # Fast pathway: 32 frames
        fast_indices = torch.linspace(0, T - 1, 32).long()
        fast = video_tensor[:, fast_indices, :, :]

        # Slow pathway: 8 frames
        slow_indices = torch.linspace(0, T - 1, 8).long()
        slow = video_tensor[:, slow_indices, :, :]

        return slow, fast


def slowfast_collate(batch):
    """Custom collate for SlowFast that handles the [slow, fast] list input."""
    slow_list, fast_list, labels = [], [], []
    for (slow, fast), label in batch:
        slow_list.append(slow)
        fast_list.append(fast)
        labels.append(label)

    slow_batch = torch.stack(slow_list)
    fast_batch = torch.stack(fast_list)
    labels_batch = torch.tensor(labels, dtype=torch.long)

    return [slow_batch, fast_batch], labels_batch


# ===========================================================================
# Training functions
# ===========================================================================

def train_one_epoch(model, loader, criterion, optimizer, device, epoch, mode="image"):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, batch in enumerate(loader):
        if mode == "video":
            inputs, labels = batch
            inputs = [x.to(device) for x in inputs]
        else:
            inputs, labels = batch
            inputs = inputs.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * labels.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

        if (batch_idx + 1) % 10 == 0 or (batch_idx + 1) == len(loader):
            print(f"  Epoch {epoch} | Batch {batch_idx+1}/{len(loader)} | "
                  f"Loss: {running_loss/total:.4f} | Acc: {100.*correct/total:.1f}%")

    return running_loss / total, 100. * correct / total


def validate(model, loader, criterion, device, mode="image"):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    class_correct = {0: 0, 1: 0}
    class_total = {0: 0, 1: 0}

    with torch.no_grad():
        for batch in loader:
            if mode == "video":
                inputs, labels = batch
                inputs = [x.to(device) for x in inputs]
            else:
                inputs, labels = batch
                inputs = inputs.to(device)
            labels = labels.to(device)

            outputs = model(inputs)
            loss = criterion(outputs, labels)

            running_loss += loss.item() * labels.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()

            for i in range(labels.size(0)):
                l = labels[i].item()
                class_total[l] += 1
                if predicted[i].item() == l:
                    class_correct[l] += 1

    acc = 100. * correct / total
    real_acc = 100. * class_correct[0] / max(class_total[0], 1)
    fake_acc = 100. * class_correct[1] / max(class_total[1], 1)

    return running_loss / total, acc, real_acc, fake_acc


# ===========================================================================
# Main
# ===========================================================================

def main():
    parser = argparse.ArgumentParser(description="Train DeepGuard detector")
    parser.add_argument("--mode", type=str, choices=["image", "video"], default="image")
    parser.add_argument("--data", type=str, default="./data")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--weight-decay", type=float, default=1e-4)
    parser.add_argument("--output", type=str, default="./checkpoints")
    parser.add_argument("--resume", type=str, default=None)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    print(f"Mode: {args.mode.upper()}")

    # Create model
    if args.mode == "image":
        model = DeepGuardImageNet(pretrained=True).to(device)
        print("Model: EfficientNet-B0 (ImageNet pre-trained)")
    else:
        model = DeepGuardSlowFast(pretrained=True).to(device)
        print("Model: SlowFast R50 (Kinetics-400 pre-trained)")

    # Create datasets
    train_dir = os.path.join(args.data, "train")
    val_dir = os.path.join(args.data, "val")

    if not os.path.isdir(train_dir):
        print(f"Error: {train_dir} not found.")
        if args.mode == "image":
            print("Run: python prepare_dataset.py --generate --output ./data")
        else:
            print(f"Create: {train_dir}/real/ and {train_dir}/fake/ with videos")
        sys.exit(1)

    if args.mode == "image":
        train_ds = DeepfakeDataset(train_dir, transform=get_image_transforms(training=True))
        val_ds = DeepfakeDataset(val_dir, transform=get_image_transforms(training=False))
        train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0, pin_memory=True)
        val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0, pin_memory=True)
    else:
        train_ds = DeepfakeVideoDataset(train_dir, num_frames=64, frame_size=256)
        val_ds = DeepfakeVideoDataset(val_dir, num_frames=64, frame_size=256)
        train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=0, collate_fn=slowfast_collate)
        val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=0, collate_fn=slowfast_collate)

    # Optimizer
    criterion = nn.CrossEntropyLoss()

    # Freeze backbone for initial epochs
    freeze_epochs = min(3, args.epochs // 4)
    print(f"Strategy: freeze backbone for {freeze_epochs} epochs, then fine-tune all")

    if args.mode == "image":
        for param in model.backbone.features.parameters():
            param.requires_grad = False
    else:
        # Freeze all slowfast blocks except the last one (head)
        for name, param in model.slowfast.named_parameters():
            if "blocks.6" not in name:  # block 6 is the head
                param.requires_grad = False

    trainable = [p for p in model.parameters() if p.requires_grad]
    optimizer = optim.AdamW(trainable, lr=args.lr, weight_decay=args.weight_decay)
    scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs, eta_min=1e-6)

    # Resume
    start_epoch = 1
    best_val_acc = 0.0
    if args.resume and os.path.isfile(args.resume):
        ckpt = torch.load(args.resume, map_location=device, weights_only=False)
        model.load_state_dict(ckpt["model_state_dict"])
        start_epoch = ckpt.get("epoch", 0) + 1
        best_val_acc = ckpt.get("val_acc", 0)
        print(f"Resumed from epoch {start_epoch-1}, best acc: {best_val_acc:.1f}%")

    os.makedirs(args.output, exist_ok=True)

    # Training loop
    print("\n" + "=" * 60)
    print("TRAINING START")
    print("=" * 60 + "\n")

    for epoch in range(start_epoch, args.epochs + 1):
        t0 = time.time()

        # Unfreeze at the right epoch
        if epoch == freeze_epochs + 1:
            print(">> Unfreezing backbone for full fine-tuning...")
            for param in model.parameters():
                param.requires_grad = True
            optimizer = optim.AdamW(model.parameters(), lr=args.lr * 0.1, weight_decay=args.weight_decay)
            scheduler = CosineAnnealingLR(optimizer, T_max=args.epochs - epoch + 1, eta_min=1e-6)

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimizer, device, epoch, args.mode
        )
        val_loss, val_acc, real_acc, fake_acc = validate(
            model, val_loader, criterion, device, args.mode
        )
        scheduler.step()

        elapsed = time.time() - t0
        print(f"\nEpoch {epoch}/{args.epochs} ({elapsed:.0f}s)")
        print(f"  Train - Loss: {train_loss:.4f} | Acc: {train_acc:.1f}%")
        print(f"  Val   - Loss: {val_loss:.4f} | Acc: {val_acc:.1f}%")
        print(f"  Val   - Real: {real_acc:.1f}% | Fake: {fake_acc:.1f}%")

        suffix = "image" if args.mode == "image" else "video"
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            path = os.path.join(args.output, f"deepguard_best_{suffix}.pth")
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc, "val_loss": val_loss,
                "mode": args.mode,
            }, path)
            print(f"  >> Best model saved: {val_acc:.1f}% -> {path}")

        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "val_acc": val_acc, "mode": args.mode,
        }, os.path.join(args.output, f"deepguard_latest_{suffix}.pth"))

        print()

    print("=" * 60)
    print(f"DONE -- Best validation accuracy: {best_val_acc:.1f}%")
    print(f"Model: {os.path.join(args.output, f'deepguard_best_{suffix}.pth')}")
    print("=" * 60)


if __name__ == "__main__":
    main()
