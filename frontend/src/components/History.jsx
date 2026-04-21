import React, { useState, useEffect } from 'react';
import { Clock, Download, Trash2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('neurovision_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('neurovision_history');
    setHistory([]);
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const header = "Date,Model,Top Prediction,Confidence,Latency (ms)\n";
    const rows = history.map(h => 
      `${new Date(h.timestamp).toLocaleString()},${h.model},${h.result.predictions[0].class},${(h.result.predictions[0].probability*100).toFixed(1)}%,${h.result.inference_time_ms}`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'neurovision_history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="heading-gradient" style={{ margin: 0, fontSize: '2rem' }}>Prediction History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your recent inferences and their explanations.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={exportCSV} disabled={history.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-secondary" onClick={clearHistory} disabled={history.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={18} /> Clear
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <Clock size={48} style={{ marginBottom: '16px' }} />
          <p>No predictions in history yet. Go to Predict to run some tests.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card" 
              style={{ padding: '20px', display: 'flex', gap: '24px', alignItems: 'center' }}
            >
              <img src={item.image} alt="Original" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ textTransform: 'capitalize', margin: 0, fontSize: '1.2rem' }}>{item.result.predictions[0].class}</h3>
                  <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                    {(item.result.predictions[0].probability * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span><strong>Model:</strong> {item.model.toUpperCase()}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={14} color="#14b8a6"/> {item.result.inference_time_ms}ms</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {item.result.gradcam_base64 && (
                  <img src={item.result.gradcam_base64} alt="Grad-CAM" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--panel-border)' }} />
                )}
                {item.result.saliency_base64 && (
                  <img src={item.result.saliency_base64} alt="Saliency" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--panel-border)' }} />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
