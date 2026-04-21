# NeuroVision AI - Image Classification System

A production-grade, visually stunning deep learning web application built with PyTorch, FastAPI, and React. NeuroVision uses ResNet and MobileNet architectures to classify images (trained on CIFAR-10) and provides real-time Explainable AI insights via Grad-CAM.

![NeuroVision UI](https://via.placeholder.com/800x450.png?text=NeuroVision+AI+Glassmorphism+UI)

## 🚀 Features
- **Transfer Learning ML Pipeline**: Code to fine-tune ResNet18 and MobileNetV2 on CIFAR-10.
- **Explainable AI (Grad-CAM)**: Heatmaps explaining which regions influenced the prediction.
- **Real-Time Predictions**: Instant classification via Drag & Drop or Live Webcam.
- **Model Comparison Panel**: Compare ResNet and MobileNet side-by-side (Latency, Confidence).
- **Interactive Analytics Dashboard**: Training curves and dataset distribution.
- **Premium Aesthetics**: Glassmorphism UI, Dark Mode, Smooth Animations (React + Vite).

---

## 🛠️ Tech Stack
- **Backend**: Python, FastAPI, PyTorch, TorchVision, OpenCV
- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism), Recharts, Lucide React
- **Dataset**: CIFAR-10

---

## ⚙️ Setup Instructions

### 1. Backend (FastAPI & PyTorch)

Navigate to the root project directory and set up your Python environment:

```bash
# Create virtual environment
python -m venv venv

# Activate venv (Windows)
.\venv\Scripts\activate
# Activate venv (Mac/Linux)
source venv/bin/activate

# Install dependencies
cd api
pip install -r requirements.txt
```

#### Train the Models (Optional but Recommended)
The API anticipates the presence of saved `.pth` files. To generate them quickly using 1 epoch:
```bash
cd ../ml
python train.py --model resnet --epochs 1
python train.py --model mobilenet --epochs 1
```

#### Start the API Server
```bash
cd ../api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API is now running at `http://localhost:8000`.

### 2. Frontend (React + Vite)
Open a new terminal window to start the frontend:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 🚀 Deployment

### Option 1: Docker Compose (Unified Deployment)
You can containerize both the backend and frontend.

1. Create a `Dockerfile` for the backend ensuring `torch` and `fastapi` are installed.
2. Create a `Dockerfile` for the frontend running a static server (like `nginx`) serving the output of `npm run build`.
3. Orchestrate with `docker-compose.yml`.

### Option 2: Cloud Deployment
- **Frontend**: Deploy the output of `cd frontend && npm run build` to **Vercel**, **Netlify**, or **GitHub Pages**. Ensure you configure environment variables to point to your cloud backend URL.
- **Backend API**: Deploy the `/api` and `/ml` modules to **Render**, **Railway**, or **AWS EC2** using Docker or standard Python buildpacks.

---

## 🧠 File Structure Overview
- `/ml/`: Core PyTorch dataloaders, model architectures, Grad-CAM, and training logic.
- `/api/`: FastAPI web server and inference endpoints.
- `/models/`: Directory where trained `.pth` files are stored.
- `/frontend/`: React components and Glassmorphism CSS design system.
