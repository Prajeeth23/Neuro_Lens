"""
DeepGuard Dataset Loader
Handles loading images organized into real/ and fake/ directories.
"""

import os
from PIL import Image
from torch.utils.data import Dataset


class DeepfakeDataset(Dataset):
    """
    Expects directory structure:
        root_dir/
            real/
                img001.jpg
                img002.png
                ...
            fake/
                img001.jpg
                img002.png
                ...

    Labels: 0 = REAL, 1 = FAKE
    """

    VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []  # list of (path, label)

        real_dir = os.path.join(root_dir, "real")
        fake_dir = os.path.join(root_dir, "fake")

        if os.path.isdir(real_dir):
            for fname in os.listdir(real_dir):
                if self._is_image(fname):
                    self.samples.append((os.path.join(real_dir, fname), 0))

        if os.path.isdir(fake_dir):
            for fname in os.listdir(fake_dir):
                if self._is_image(fname):
                    self.samples.append((os.path.join(fake_dir, fname), 1))

        if len(self.samples) == 0:
            raise ValueError(
                f"No images found in {root_dir}. "
                f"Expected subdirectories: real/ and fake/ containing images."
            )

        # Count per class
        n_real = sum(1 for _, l in self.samples if l == 0)
        n_fake = sum(1 for _, l in self.samples if l == 1)
        print(f"Dataset loaded: {len(self.samples)} images "
              f"({n_real} real, {n_fake} fake) from {root_dir}")

    def _is_image(self, filename):
        return os.path.splitext(filename)[1].lower() in self.VALID_EXTENSIONS

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        try:
            image = Image.open(path).convert("RGB")
        except Exception as e:
            print(f"Warning: could not load {path}: {e}")
            # Return a blank image as fallback
            image = Image.new("RGB", (224, 224), (0, 0, 0))

        if self.transform:
            image = self.transform(image)

        return image, label
