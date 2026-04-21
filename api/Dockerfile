FROM python:3.11-slim

# Install necessary system dependencies for OpenCV and general operation
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project context (ml module is imported by api)
COPY . .

WORKDIR /app/api

# Run using Gunicorn with Uvicorn workers for production
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000", "--timeout", "120"]
