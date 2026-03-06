"""Quick test: load trained model and verify it works."""
import torch
from model import DeepGuardImageNet
from PIL import Image
import numpy as np

print("Loading model...")
model = DeepGuardImageNet(pretrained=False)
ckpt = torch.load("./checkpoints/deepguard_best_image.pth", map_location="cpu", weights_only=False)
model.load_state_dict(ckpt["model_state_dict"])
model.eval()
print(f"Model loaded from epoch {ckpt.get('epoch')}, val_acc={ckpt.get('val_acc')}%")

# Test with a dummy image
from torchvision import transforms
tf = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

# Create a test image
img = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
tensor = tf(img).unsqueeze(0)

with torch.no_grad():
    logits = model(tensor)
    probs = torch.softmax(logits, dim=1)[0]

print(f"Test prediction - Real: {probs[0].item()*100:.1f}%, Fake: {probs[1].item()*100:.1f}%")
print("Model verification PASSED")
