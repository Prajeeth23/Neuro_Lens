"""
DeepGuard Dataset Preparation Script

Downloads and organizes a deepfake detection dataset.
Uses the '140k Real and Fake Faces' dataset structure or lets you
point to your own dataset.

Usage:
    python prepare_dataset.py --source <path_or_url> --output ./data
    python prepare_dataset.py --generate --output ./data   (creates a small demo dataset)
"""

import os
import sys
import shutil
import argparse
import random
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np


def create_demo_dataset(output_dir, n_per_class=500):
    """
    Generate a synthetic training dataset for demonstration.

    Creates realistic-looking 'real' images (natural noise, varied lighting)
    and 'fake' images (smoother, GAN-like artifacts, uniform noise).

    This is for bootstrapping -- for best accuracy, replace with a real
    dataset like FaceForensics++ or 140k Real and Fake Faces.
    """
    real_dir = os.path.join(output_dir, "train", "real")
    fake_dir = os.path.join(output_dir, "train", "fake")
    val_real_dir = os.path.join(output_dir, "val", "real")
    val_fake_dir = os.path.join(output_dir, "val", "fake")

    for d in [real_dir, fake_dir, val_real_dir, val_fake_dir]:
        os.makedirs(d, exist_ok=True)

    print(f"Generating {n_per_class} real + {n_per_class} fake images for training...")
    print(f"Generating {n_per_class // 5} real + {n_per_class // 5} fake images for validation...")

    # Generate training set
    _generate_images(real_dir, n_per_class, is_fake=False)
    _generate_images(fake_dir, n_per_class, is_fake=True)

    # Generate validation set (20% of training size)
    _generate_images(val_real_dir, n_per_class // 5, is_fake=False)
    _generate_images(val_fake_dir, n_per_class // 5, is_fake=True)

    total = n_per_class * 2 + (n_per_class // 5) * 2
    print(f"Demo dataset created: {total} images in {output_dir}")
    print(f"  Training: {n_per_class * 2} images")
    print(f"  Validation: {(n_per_class // 5) * 2} images")
    print()
    print("NOTE: For 80-95% accuracy on real deepfakes, replace this demo")
    print("dataset with a real one like FaceForensics++ or 140k Real/Fake Faces.")


def _generate_images(out_dir, count, is_fake):
    """Generate synthetic images with distinguishable real vs fake characteristics."""
    for i in range(count):
        size = 224

        if is_fake:
            # Fake images: smoother gradients, less noise, subtle grid patterns
            img = _generate_fake_image(size)
        else:
            # Real images: natural noise, varied textures, JPEG artifacts
            img = _generate_real_image(size)

        img.save(os.path.join(out_dir, f"{i:05d}.jpg"), "JPEG", quality=random.randint(85, 98))

        if (i + 1) % 100 == 0:
            label = "fake" if is_fake else "real"
            print(f"  Generated {i + 1}/{count} {label} images...")


def _generate_real_image(size):
    """Simulate a natural photograph with sensor noise and varied content."""
    # Create base with natural-looking color patches
    img = np.zeros((size, size, 3), dtype=np.float64)

    # Random color regions simulating a natural scene
    n_regions = random.randint(5, 15)
    for _ in range(n_regions):
        x1, y1 = random.randint(0, size - 1), random.randint(0, size - 1)
        w, h = random.randint(20, size // 2), random.randint(20, size // 2)
        x2, y2 = min(x1 + w, size), min(y1 + h, size)

        color = [random.randint(30, 240) for _ in range(3)]
        # Gradient fill
        for y in range(y1, y2):
            for x in range(x1, x2):
                t = (x - x1) / max(w, 1)
                fade = 0.7 + 0.3 * t
                img[y, x] = [c * fade for c in color]

    # Add realistic Gaussian sensor noise (higher variance than fake)
    noise = np.random.normal(0, random.uniform(8, 20), img.shape)
    img = np.clip(img + noise, 0, 255)

    # Add some JPEG-like artifacts via slight blur + noise
    pil_img = Image.fromarray(img.astype(np.uint8))
    if random.random() > 0.5:
        pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.3, 0.8)))

    # Vary brightness/contrast naturally
    enhancer = ImageEnhance.Brightness(pil_img)
    pil_img = enhancer.enhance(random.uniform(0.8, 1.3))
    enhancer = ImageEnhance.Contrast(pil_img)
    pil_img = enhancer.enhance(random.uniform(0.8, 1.2))

    return pil_img


def _generate_fake_image(size):
    """Simulate a GAN-generated image with smooth gradients and subtle artifacts."""
    img = np.zeros((size, size, 3), dtype=np.float64)

    # Smooth gradient background (GAN characteristic)
    for y in range(size):
        for x in range(size):
            t_x = x / size
            t_y = y / size
            img[y, x, 0] = 50 + 150 * (np.sin(t_x * np.pi) * 0.5 + 0.5)
            img[y, x, 1] = 50 + 150 * (np.cos(t_y * np.pi) * 0.5 + 0.5)
            img[y, x, 2] = 50 + 150 * (np.sin((t_x + t_y) * np.pi) * 0.5 + 0.5)

    # Add smooth color blobs (GAN tends to have smooth transitions)
    n_blobs = random.randint(3, 8)
    for _ in range(n_blobs):
        cx, cy = random.randint(0, size - 1), random.randint(0, size - 1)
        radius = random.randint(20, 60)
        color = [random.randint(60, 220) for _ in range(3)]

        for y in range(max(0, cy - radius), min(size, cy + radius)):
            for x in range(max(0, cx - radius), min(size, cx + radius)):
                dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                if dist < radius:
                    blend = 1.0 - (dist / radius) ** 2  # smooth falloff
                    for c in range(3):
                        img[y, x, c] = img[y, x, c] * (1 - blend * 0.7) + color[c] * blend * 0.7

    # Very low noise (GAN images are unnaturally clean)
    noise = np.random.normal(0, random.uniform(1, 5), img.shape)
    img = np.clip(img + noise, 0, 255)

    # Subtle periodic pattern (GAN fingerprint)
    freq = random.uniform(0.02, 0.08)
    for y in range(size):
        for x in range(size):
            pattern = np.sin(x * freq * 2 * np.pi) * np.cos(y * freq * 2 * np.pi) * 3
            img[y, x] = np.clip(img[y, x] + pattern, 0, 255)

    pil_img = Image.fromarray(img.astype(np.uint8))

    # GAN images are often slightly over-sharpened
    if random.random() > 0.3:
        pil_img = pil_img.filter(ImageFilter.SHARPEN)

    # Apply heavy blur to simulate GAN smoothness
    pil_img = pil_img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))

    return pil_img


def organize_existing_dataset(source_dir, output_dir):
    """
    Organize an existing dataset into train/val splits.

    Expects source_dir to have real/ and fake/ subdirectories.
    Creates output_dir/train/ and output_dir/val/ with 80/20 split.
    """
    real_dir = os.path.join(source_dir, "real")
    fake_dir = os.path.join(source_dir, "fake")

    if not os.path.isdir(real_dir) or not os.path.isdir(fake_dir):
        print(f"Error: Expected {real_dir} and {fake_dir} directories")
        sys.exit(1)

    real_images = [f for f in os.listdir(real_dir) if _is_image(f)]
    fake_images = [f for f in os.listdir(fake_dir) if _is_image(f)]

    print(f"Found {len(real_images)} real and {len(fake_images)} fake images")

    random.shuffle(real_images)
    random.shuffle(fake_images)

    val_ratio = 0.2
    n_val_real = max(1, int(len(real_images) * val_ratio))
    n_val_fake = max(1, int(len(fake_images) * val_ratio))

    splits = {
        "train/real": real_images[n_val_real:],
        "train/fake": fake_images[n_val_fake:],
        "val/real": real_images[:n_val_real],
        "val/fake": fake_images[:n_val_fake],
    }

    for split_name, files in splits.items():
        dest = os.path.join(output_dir, split_name)
        os.makedirs(dest, exist_ok=True)
        src_parent = real_dir if "real" in split_name else fake_dir
        for f in files:
            shutil.copy2(os.path.join(src_parent, f), os.path.join(dest, f))
        print(f"  {split_name}: {len(files)} images")


def _is_image(fname):
    return os.path.splitext(fname)[1].lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prepare deepfake dataset")
    parser.add_argument("--source", type=str, help="Path to existing dataset with real/fake dirs")
    parser.add_argument("--output", type=str, default="./data", help="Output directory")
    parser.add_argument("--generate", action="store_true", help="Generate a demo dataset")
    parser.add_argument("--count", type=int, default=500, help="Images per class for demo")
    args = parser.parse_args()

    if args.generate:
        create_demo_dataset(args.output, n_per_class=args.count)
    elif args.source:
        organize_existing_dataset(args.source, args.output)
    else:
        print("Usage:")
        print("  python prepare_dataset.py --generate --output ./data")
        print("  python prepare_dataset.py --source /path/to/dataset --output ./data")
        print()
        print("For real datasets, download one of:")
        print("  - FaceForensics++: https://github.com/ondyari/FaceForensics")
        print("  - 140k Real/Fake Faces: https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces")
        print("  - Celeb-DF: https://github.com/yuezunli/celeb-deepfakeforensics")
