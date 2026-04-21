import React, { useState, useRef } from 'react';
import { Upload, Loader2, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompareModels() {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleCompare = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', image);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/compare`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to communicate with API");
      
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}
    >
      <h2 className="heading-gradient" style={{ margin: 0, fontSize: '2rem' }}>Architecture Comparison</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        Evaluate the trade-offs between model architectures in real-time. Compare ResNet (Heavy), MobileNet (Edge), and ViT (Transformer).
      </p>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>Choose Image</button>
        {previewUrl && (
          <img src={previewUrl} alt="Thumb" style={{ height: '50px', width: '50px', objectFit: 'cover', borderRadius: '8px' }} />
        )}
        <button 
          className={`btn-primary ${!image ? 'disabled' : ''}`} 
          style={{ opacity: image ? 1 : 0.5, cursor: image ? 'pointer' : 'not-allowed' }}
          onClick={handleCompare}
          disabled={!image || loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Run Comparison Analysis'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>{error}</div>}

      {results && (
        <div style={{ display: 'flex', gap: '24px', marginTop: '12px', flexWrap: 'wrap' }}>
          {/* ResNet Card */}
          <div className="glass-card" style={{ flex: '1', minWidth: '250px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #93c5fd)' }}></div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>ResNet-18</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Prediction</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {results.resnet.prediction}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Target size={20} color="#10b981" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{(results.resnet.confidence * 100).toFixed(1)}%</div>
                   </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Zap size={20} color="#f59e0b" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{results.resnet.inference_time_ms}ms</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* MobileNet Card */}
          <div className="glass-card" style={{ flex: '1', minWidth: '250px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #10b981, #6ee7b7)' }}></div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>MobileNetV2</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Prediction</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {results.mobilenet.prediction}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Target size={20} color="#10b981" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{(results.mobilenet.confidence * 100).toFixed(1)}%</div>
                   </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Zap size={20} color="#f59e0b" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{results.mobilenet.inference_time_ms}ms</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* ViT Card */}
          <div className="glass-card" style={{ flex: '1', minWidth: '250px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #8b5cf6, #c4b5fd)' }}></div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>ViT-B/16</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Prediction</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 600, textTransform: 'capitalize' }}>
                  {results.vit ? results.vit.prediction : 'N/A'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Target size={20} color="#10b981" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{results.vit ? (results.vit.confidence * 100).toFixed(1) : 0}%</div>
                   </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Zap size={20} color="#f59e0b" />
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 500 }}>{results.vit ? results.vit.inference_time_ms : 0}ms</div>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
