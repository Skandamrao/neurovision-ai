# NeuroVision AI Extreme 🧠👁️

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg?logo=fastapi)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)
![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C.svg?logo=pytorch)

A production-ready, full-stack deep learning platform for real-time image classification and model explainability. Experience real-time inference, multi-method explainability (Grad-CAM & Saliency Maps), and adversarial robustness testing, all wrapped in a stunning, high-performance **Framer Motion** glassmorphic UI.

---

## 🌟 Key Features

### 🚀 Cutting-Edge Machine Learning
- **Multi-Architecture Support**: Compare inferences between **ResNet-18** (Accuracy), **MobileNetV2** (Edge Performance), and **Vision Transformer (ViT-B/16)** (State-of-the-art spatial attention).
- **Extreme Explainability**: Peer into the "black box" using dual-explainability visualization:
  - **Grad-CAM**: Class Activation Maps showing regional importance.
  - **Saliency Maps**: Pixel-level gradient maps highlighting the exact features driving predictions.
- **Adversarial Robustness Tester**: A live UI slider to inject controlled static noise into images to evaluate model confidence drops and architectural resilience.

### 💻 Premium User Experience
- **Fluid UI**: Seamless page transitions and micro-animations powered by **Framer Motion**.
- **Live System HUD**: Real-time FPS and latency tracking.
- **In-Browser Image Editing**: Crop images perfectly before inference using `react-image-crop`.
- **Text-to-Speech (TTS)**: High-confidence predictions are audibly announced.
- **Prediction History & Export**: All sessions are saved locally with visual heatmaps and can be exported as `.csv` data logs.

### 🏗️ Enterprise Architecture
- **Dockerized**: Unified `docker-compose.yml` for instant, isolated cluster deployment.
- **FastAPI Backend**: Asynchronous inference pipeline served via Uvicorn/Gunicorn.
- **Automated Testing**: 100% core endpoint coverage via `pytest`.

---

## ⚙️ Quick Start (Docker)

The absolute fastest way to get started is using Docker Compose.

1. Ensure Docker Desktop is running.
2. Clone the repository:
   ```bash
   git clone https://github.com/Skandamrao/neurovision-ai.git
   cd neurovision-ai
   ```
3. Build and launch the cluster:
   ```bash
   docker-compose up --build
   ```
4. Access the application:
   - **Frontend UI**: [http://localhost:5173](http://localhost:5173)
   - **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Local Development Setup

If you wish to run the app manually for development purposes without Docker:

### 1. Backend (FastAPI + PyTorch)
```bash
# Navigate to the root directory
python -m venv venv

# Activate Virtual Environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install -r api/requirements.txt

# Start Server
cd api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Vite + React)
Open a new terminal window:
```bash
cd frontend

# Install Node modules
npm install

# Start Dev Server
npm run dev
```

---

## 🧪 Running Tests

The backend uses `pytest` to validate API integrity. With the virtual environment active:
```bash
pytest tests/
```

---

## 📁 Directory Structure

```text
neurovision-ai/
├── api/                    # FastAPI Backend
│   ├── main.py             # Inference & Server logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # React + Vite Frontend
│   ├── src/                # UI Components (Framer Motion, Recharts)
│   ├── Dockerfile
│   └── nginx.conf          # Prod proxy configuration
├── ml/                     # Machine Learning Logic
│   ├── models.py           # PyTorch architecture definitions (ViT, ResNet)
│   ├── gradcam.py          # Explainability logic
│   └── train.py            # Local training scripts
├── models/                 # Saved `.pth` weight files
├── tests/                  # Pytest integration tests
├── docker-compose.yml      # Orchestrator
└── README.md
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check [issues page](https://github.com/Skandamrao/neurovision-ai/issues).

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
