import sys
import os
import pytest
from fastapi.testclient import TestClient
from PIL import Image
import io

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'api'))
from main import app

client = TestClient(app)

def create_test_image():
    # Create a simple 224x224 black image
    img = Image.new('RGB', (224, 224), color = 'black')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    return img_byte_arr

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "healthy"

def test_insights():
    response = client.get("/insights")
    assert response.status_code == 200
    data = response.json()
    assert "accuracy" in data
    assert "vit" in data["accuracy"]

def test_predict_resnet():
    img_bytes = create_test_image()
    response = client.post(
        "/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        data={"model_name": "resnet"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data
    assert "gradcam_base64" in data
    assert "saliency_base64" in data
    assert len(data["predictions"]) == 3

def test_predict_vit():
    img_bytes = create_test_image()
    response = client.post(
        "/predict",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")},
        data={"model_name": "vit"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "predictions" in data

def test_compare():
    img_bytes = create_test_image()
    response = client.post(
        "/compare",
        files={"file": ("test.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert "resnet" in data
    assert "mobilenet" in data
    assert "vit" in data
