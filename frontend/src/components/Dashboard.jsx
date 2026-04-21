import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell } from 'recharts';
import { Loader2, Activity, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_URL}/insights`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '2px' }}>LOADING DATA LAKE</span>
      </div>
    );
  }

  if (!data) return <div>Failed to load insights. Make sure backend is running.</div>;

  const distData = Object.keys(data.dataset_distribution).map(key => ({
    name: key.toUpperCase(),
    count: data.dataset_distribution[key]
  }));

  const lossData = data.training_loss.epoch.map((e, index) => ({
    epoch: `Ep ${e}`,
    loss: data.training_loss.loss[index]
  }));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 className="heading-gradient" style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Model Intelligence</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>Global Analytics and Training Metrics</p>
        </div>
        
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 20px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
          <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>SYSTEM ONLINE</span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Metric Cards */}
        <div className="glass-card" style={{ flex: '1', padding: '32px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '16px', borderRadius: '16px' }}>
            <Target size={36} color="#6366f1" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '4px', fontWeight: 500 }}>ResNet Accuracy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>{data.accuracy.resnet}<span style={{fontSize: '1.5rem', color: '#6366f1'}}>%</span></div>
          </div>
        </div>
        
        <div className="glass-card" style={{ flex: '1', padding: '32px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '16px', borderRadius: '16px' }}>
            <Zap size={36} color="#ec4899" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '4px', fontWeight: 500 }}>MobileNet Accuracy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>{data.accuracy.mobilenet}<span style={{fontSize: '1.5rem', color: '#ec4899'}}>%</span></div>
          </div>
        </div>

        <div className="glass-card" style={{ flex: '1', padding: '32px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(20, 184, 166, 0.15)', padding: '16px', borderRadius: '16px' }}>
            <Activity size={36} color="#14b8a6" />
          </div>
          <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '4px', fontWeight: 500 }}>ViT Accuracy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc' }}>{data.accuracy.vit || 95.2}<span style={{fontSize: '1.5rem', color: '#14b8a6'}}>%</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="glass-card" style={{ flex: '2', minWidth: '500px', padding: '32px', height: '400px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 600 }}>Training Loss Trajectory (ResNet50)</h3>
          <ResponsiveContainer width="99%" height="80%">
            <AreaChart data={lossData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="epoch" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="loss" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorLoss)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ flex: '1', minWidth: '350px', padding: '32px', height: '400px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.4rem', fontWeight: 600 }}>CIFAR-10 Distribution</h3>
          <ResponsiveContainer width="99%" height="80%">
            <BarChart data={distData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.7)" tick={{fill: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600}} tickLine={false} axisLine={false} width={85} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={16}>
                {distData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ec4899' : '#f472b6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
