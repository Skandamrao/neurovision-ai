import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Network, Home, UploadCloud, BarChart2, SplitSquareHorizontal, History as HistoryIcon, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadPredict from './components/UploadPredict';
import Dashboard from './components/Dashboard';
import CompareModels from './components/CompareModels';
import History from './components/History';
import './App.css';

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Predict', path: '/predict', icon: <UploadCloud size={20} /> },
    { name: 'History', path: '/history', icon: <HistoryIcon size={20} /> },
    { name: 'Insights', path: '/insights', icon: <BarChart2 size={20} /> },
    { name: 'Compare', path: '/compare', icon: <SplitSquareHorizontal size={20} /> }
  ];

  return (
    <div className="glass-panel" style={{ 
      width: '260px', 
      padding: '32px 24px', 
      margin: '20px', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-color)', filter: 'blur(80px)', opacity: 0.3, zIndex: -1 }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, var(--accent-color) 0%, #a855f7 100%)', 
          padding: '10px', 
          borderRadius: '12px', 
          display: 'flex',
          boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
        }}>
          <Network size={26} color="white" />
        </div>
        <h2 className="heading-gradient" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>NeuroVision</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={isActive ? 'nav-active' : 'nav-item'}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                borderRadius: '12px', textDecoration: 'none',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: isActive ? 600 : 500,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && <motion.div layoutId="active-indicator" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: 'linear-gradient(to bottom, var(--accent-color), var(--accent-secondary))' }}></motion.div>}
              {item.icon}
              <span style={{ fontSize: '1.05rem' }}>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="glass-card" style={{ marginTop: 'auto', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '50%' }}>
          <Sparkles size={16} color="var(--accent-secondary)" />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Enterprise Mode Active</div>
          <div style={{ fontSize: '0.75rem' }}>Extreme Features Unlocked</div>
        </div>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', height: '100%', textAlign: 'center', position: 'relative' }}
    >
      <div style={{ marginTop: '80px', marginBottom: '24px', position: 'relative' }}>
        <div className="animate-spin-slow" style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>
        <div style={{ background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))', padding: '24px', borderRadius: '30%', boxShadow: '0 0 50px rgba(99, 102, 241, 0.6)', position: 'relative', zIndex: 2 }}>
          <Network size={54} color="white" />
        </div>
      </div>
      
      <h1 className="heading-gradient" style={{ fontSize: '4.5rem', marginBottom: '20px', fontWeight: 800 }}>NeuroVision AI Extreme</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', lineHeight: '1.7', marginBottom: '40px', fontWeight: 300 }}>
        The ultimate, production-ready deep learning system. Featuring ResNet, MobileNet, and Vision Transformers (ViT) 
        for real-time image classification, adversarial testing, and multi-method explainability.
      </p>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <NavLink to="/predict">
          <button className="btn-primary pulse-btn" style={{ padding: '16px 36px', fontSize: '1.15rem' }}>Start Predicting</button>
        </NavLink>
        <NavLink to="/history">
          <button className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.15rem' }}>View History</button>
        </NavLink>
      </div>
    </motion.div>
  );
}

function PerformanceHUD() {
  const [fps, setFps] = useState(60);
  
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateFPS);
    };
    const handle = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, pointerEvents: 'none' }}>
      <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity size={18} color="#10b981" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>System HUD</span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{fps} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>FPS</span></span>
        </div>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/predict" element={<UploadPredict />} />
        <Route path="/history" element={<History />} />
        <Route path="/insights" element={<Dashboard />} />
        <Route path="/compare" element={<CompareModels />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <PerformanceHUD />
      <div style={{ display: 'flex', width: '100%', minHeight: '100vh', padding: '0px' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '20px 20px 20px 0', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ height: '100%', padding: '40px', position: 'relative', overflow: 'auto' }}>
            <AnimatedRoutes />
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
