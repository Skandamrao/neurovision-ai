import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Loader2, Info, Volume2, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function UploadPredict() {
  const [image, setImage] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null); // Original Object URL
  const [processedUrl, setProcessedUrl] = useState(null); // Image after crop/noise
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [model, setModel] = useState('resnet');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  
  // Crop state
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  
  // Noise state
  const [noiseLevel, setNoiseLevel] = useState(0);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl(url);
      setResult(null);
      setCrop(undefined);
      setNoiseLevel(0);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera.");
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setProcessedUrl(url);
        
        // Stop camera tracks
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setCameraActive(false);
      }, 'image/jpeg');
    }
  };

  const cancelCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Apply Crop and Noise
  useEffect(() => {
    if (!completedCrop || !imgRef.current) {
      // If no crop, just apply noise to original
      if (imgRef.current && noiseLevel > 0) {
        applyNoiseToCanvas(imgRef.current, 0, 0, imgRef.current.width, imgRef.current.height);
      } else if (previewUrl) {
         setProcessedUrl(previewUrl);
      }
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    if (noiseLevel > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * noiseLevel * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      if (processedUrl && processedUrl !== previewUrl) URL.revokeObjectURL(processedUrl);
      setProcessedUrl(URL.createObjectURL(blob));
    }, 'image/jpeg');
  }, [completedCrop, noiseLevel, previewUrl]);

  const applyNoiseToCanvas = (image, sx, sy, sw, sh) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * noiseLevel * 255;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (processedUrl && processedUrl !== previewUrl) URL.revokeObjectURL(processedUrl);
      setProcessedUrl(URL.createObjectURL(blob));
    }, 'image/jpeg');
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveToHistory = (resData, currentImageUrl) => {
    const existing = JSON.parse(localStorage.getItem('neurovision_history') || '[]');
    // Store image as base64 or blob URL (blob URLs might expire, base64 is safer for history but can be large)
    // We will fetch the blob and convert to base64 for persistent history
    fetch(currentImageUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newItem = {
            timestamp: new Date().toISOString(),
            model: model,
            result: resData,
            image: reader.result
          };
          const newHistory = [newItem, ...existing].slice(0, 20); // Keep last 20
          localStorage.setItem('neurovision_history', JSON.stringify(newHistory));
        };
        reader.readAsDataURL(blob);
      });
  };

  const handlePredict = async () => {
    if (!processedUrl) return;
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Fetch the processed blob to send
      const response = await fetch(processedUrl);
      const blob = await response.blob();
      const fileToSend = new File([blob], "image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append('file', fileToSend);
      formData.append('model_name', model);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to communicate with API");
      
      const data = await res.json();
      setResult(data);
      
      // Speak the prediction
      const topPred = data.predictions[0];
      const confidence = (topPred.probability * 100).toFixed(0);
      speak(`I am ${confidence}% sure this is a ${topPred.class}.`);
      
      // Save history
      saveToHistory(data, processedUrl);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setResult(null);
    setCrop(undefined);
    setCompletedCrop(null);
    setNoiseLevel(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="heading-gradient" style={{ margin: 0, fontSize: '2rem' }}>Upload & Predict</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Architecture:</span>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', color: 'white', 
              border: '1px solid var(--panel-border)', padding: '8px 16px', 
              borderRadius: '8px', outline: 'none' 
            }}
          >
            <option value="resnet">ResNet18 (Standard CNN)</option>
            <option value="mobilenet">MobileNetV2 (Edge CNN)</option>
            <option value="vit">ViT-B/16 (Vision Transformer)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Upload Column */}
        <div className="glass-card" style={{ flex: '1', minWidth: '400px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {cameraActive ? (
             <div style={{ position: 'relative', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
               <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto', background: 'black' }} />
               <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '16px' }}>
                 <button className="btn-primary" onClick={captureImage}>Capture</button>
                 <button className="btn-secondary" onClick={cancelCamera}>Cancel</button>
               </div>
             </div>
          ) : (
            <div 
              style={{ 
                border: '2px dashed rgba(255, 255, 255, 0.2)', borderRadius: '16px', 
                padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                justifyContent: 'center', minHeight: '300px', position: 'relative',
                background: 'rgba(0, 0, 0, 0.2)', transition: 'all 0.3s'
              }}
            >
              {previewUrl ? (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)}>
                    <img 
                      ref={imgRef}
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} 
                      onLoad={(e) => {
                         // Reset crop on new load
                         setCrop(undefined);
                         setCompletedCrop(null);
                      }}
                    />
                  </ReactCrop>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '8px' }}>Drag to crop. Filter applies on predict.</p>
                  
                  <button 
                    onClick={resetAll}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 10 }}
                  >✕</button>
                </div>
              ) : (
                <>
                  <Upload size={48} color="var(--accent-color)" style={{ marginBottom: '16px', opacity: 0.8 }} />
                  <h3 style={{ marginBottom: '8px' }}>Drag & Drop an image here</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Supports JPG, PNG, JPEG</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-primary" onClick={() => fileInputRef.current.click()}>Browse Files</button>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={startCamera}>
                      <Camera size={18} />
                      Use Camera
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                </>
              )}
            </div>
          )}

          {/* Adversarial Tester Controls */}
          {previewUrl && (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Sliders size={16} /> Adversarial Noise Injector
                </span>
                <span style={{ fontSize: '0.8rem', color: noiseLevel > 0.5 ? '#ef4444' : 'var(--text-secondary)' }}>{Math.round(noiseLevel * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={noiseLevel} 
                onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-color)' }}
              />
            </div>
          )}

          <button 
            className={`btn-primary ${!processedUrl ? 'disabled' : 'pulse-btn'}`} 
            style={{ width: '100%', padding: '16px', fontSize: '1.1rem', opacity: processedUrl ? 1 : 0.5, cursor: processedUrl ? 'pointer' : 'not-allowed' }}
            onClick={handlePredict}
            disabled={!processedUrl || loading}
          >
            {loading ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Loader2 className="animate-spin" /> Deep Inference Running...</div> : 'Predict Result'}
          </button>
          
          {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}
        </div>

        {/* Results Column */}
        <div className="glass-card" style={{ flex: '1', minWidth: '400px', padding: '24px', position: 'relative' }}>
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', opacity: 0.5 }}
              >
                <Info size={48} style={{ marginBottom: '16px' }} />
                <p>Upload an image and run prediction to see results.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent-color)' }}
              >
                <div className="pulse-btn" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Loader2 size={40} className="animate-spin" />
                </div>
                <p style={{ marginTop: '24px', fontWeight: 600, letterSpacing: '1px' }}>ANALYZING TENSORS...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              >
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Primary Prediction</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'capitalize', color: result.predictions[0].probability < 0.5 ? '#f59e0b' : 'white' }}>
                        {result.predictions[0].class}
                      </span>
                      <span style={{ fontSize: '1.4rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                        {(result.predictions[0].probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    {result.predictions[0].probability < 0.5 && (
                      <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={14}/> Low Confidence - Anomaly Detected
                      </div>
                    )}
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                      Inference Time: {result.inference_time_ms}ms
                    </div>
                  </div>
                  <button onClick={() => speak(`I think this is a ${result.predictions[0].class}`)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '10px', borderRadius: '50%', color: 'white', cursor: 'pointer' }}>
                    <Volume2 size={20} />
                  </button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ marginBottom: '12px', color: '#e2e8f0', fontSize: '1.1rem' }}>Confidence Distribution</h4>
                  {result.predictions.map((pred, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{pred.class}</span>
                        <span>{(pred.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${pred.probability * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          style={{ background: i === 0 ? 'var(--accent-color)' : '#64748b', height: '100%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ marginBottom: '12px', color: '#e2e8f0', fontSize: '1.1rem' }}>Multi-Method Explainability</h4>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {result.gradcam_base64 && (
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Grad-CAM (Class Activation)</p>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                          <img src={result.gradcam_base64} alt="Grad-CAM" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      </div>
                    )}
                    {result.saliency_base64 && (
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Saliency Map (Pixel Gradient)</p>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                          <img src={result.saliency_base64} alt="Saliency" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
