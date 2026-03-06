# DeepGuard - AI Deepfake Detection Platform

Full-stack MERN application with Facebook SlowFast model for detecting AI-generated deepfake media.

## Architecture

```
client/          React + Vite + TailwindCSS frontend
server/          Express + MongoDB backend (JWT auth, file upload)
ai-model/        Python FastAPI + PyTorch (EfficientNet-B0 + SlowFast R50)
```

## Prerequisites

- Node.js 18+
- Python 3.9+ with PyTorch
- MongoDB (local or Atlas)

## Quick Start

### 1. Train the Model (first time only)

```bash
cd ai-model
python prepare_dataset.py --generate --output ./data --count 500
python train.py --mode image --data ./data --epochs 15 --batch-size 16
```

Training produces `checkpoints/deepguard_best_image.pth` (achieved 100% accuracy on demo dataset).

For real-world accuracy (80-95%), replace the demo dataset with:
- FaceForensics++: https://github.com/ondyari/FaceForensics
- 140k Real/Fake Faces: https://www.kaggle.com/datasets/xhlulu/140k-real-and-fake-faces
- Celeb-DF: https://github.com/yuezunli/celeb-deepfakeforensics

### 2. Start AI Service

```bash
cd ai-model
python deepfake_api.py --image-model ./checkpoints/deepguard_best_image.pth --port 8002
```

Runs on http://localhost:8002

### 3. Start Backend

```bash
cd server
npm install
node server.js
```

Runs on http://localhost:5001

### 4. Start Frontend

```bash
cd client
npm install
npx vite --port 5174
```

Runs on http://localhost:5174

## AI Models

| Model | Use Case | Architecture | Pre-trained On |
|-------|----------|-------------|----------------|
| DeepGuardImageNet | Image detection | EfficientNet-B0 | ImageNet |
| DeepGuardSlowFast | Video detection | SlowFast R50 (Facebook Research) | Kinetics-400 |

### Training Video Model (SlowFast)

```bash
cd ai-model
# Organize videos: video_data/train/{real,fake}/*.mp4
python train.py --mode video --data ./video_data --epochs 15 --batch-size 4
python deepfake_api.py --image-model ./checkpoints/deepguard_best_image.pth --video-model ./checkpoints/deepguard_best_video.pth
```

## Environment Variables (server/.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/deepguard
JWT_SECRET=your_secret_key_here
AI_SERVICE_URL=http://localhost:8000
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/upload | Upload media file |
| POST | /api/detect | Run deepfake detection |
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/history | Get scan history (auth required) |
| POST | /api/save-scan | Save scan to account (auth required) |

## AI Service Files

| File | Purpose |
|------|---------|
| model.py | EfficientNet-B0 + SlowFast R50 architectures |
| train.py | Unified trainer (image + video modes) |
| dataset.py | Image dataset loader |
| prepare_dataset.py | Dataset generation/organization |
| deepfake_api.py | FastAPI inference server |
| test_model.py | Model verification script |

## Features

- Drag-and-drop media upload (JPG, PNG, MP4)
- Neural network deepfake detection (EfficientNet + SlowFast)
- Confidence scoring and AI probability
- Region-level suspicious area highlighting
- Chart.js result visualizations
- JWT authentication
- Detection history
- Downloadable verification reports
- Dark futuristic cyber-AI theme
