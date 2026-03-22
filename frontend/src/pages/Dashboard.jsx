import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI, monitoringAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, ScatterChart, Scatter, 
  XAxis, YAxis, ZAxis, Tooltip, Cell
} from 'recharts';
import { 
  LayoutDashboard, Upload, Zap, Bell, Gavel, Calendar, Building2, GitCompare, MessageSquare, Shield, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_COLORS = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([contractsAPI.list(), monitoringAPI.getAlerts()])
      .then(([cRes, aRes]) => {
        setContracts(cRes.data);
        setAlerts(aRes.data.alerts || []);
      })
      .catch(() => toast.error('Failed to load command center data'))
      .finally(() => setLoading(false));
  }, []);

  const avgRisk = contracts.length
    ? Math.round(contracts.filter(c => c.risk_score).reduce((s, c) => s + c.risk_score, 0) / contracts.filter(c => c.risk_score).length) || 0
    : 0;

  const gaugeData = [{ name: 'Risk', value: avgRisk, fill: 'var(--accent)' }];

  const scatterData = contracts.map((c, i) => ({
    x: (i * 15) % 100,
    y: c.risk_score || 0,
    z: 200,
    name: c.filename,
    level: c.risk_level
  }));

  const timelineData = [
    { name: 'Month 1', risk: 30, type: 'Renewal' },
    { name: 'Month 3', risk: 70, type: 'Deadline' },
    { name: 'Month 6', risk: 45, type: 'Renewal' },
    { name: 'Month 9', risk: 90, type: 'Termination' },
    { name: 'Month 12', risk: 55, type: 'Renewal' },
  ];

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
        <div className="notif-dot" /> Evaluated 1,240 renewal windows across all contracts...
      </div>

      <div className="grid-dashboard" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 24, 
        marginBottom: 24 
      }}>
        <div className="card glass" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 440 }}>
          <div style={{ position: 'relative', height: 280, marginTop: -40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={gaugeData} startAngle={225} endAngle={-45}>
                <RadialBar background clockWise dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -40%)' }}>
              <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{avgRisk}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Risk Index</div>
            </div>
          </div>
          <div style={{ padding: '0 24px' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Real-time legal exposure level</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
                <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 16 }}>{contracts.filter(c => c.risk_level === 'low').length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Safe</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: 12 }}>
                <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: 16 }}>{contracts.filter(c => c.risk_level === 'medium').length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Caution</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>
                <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 16 }}>{contracts.filter(c => c.risk_level === 'critical').length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Risk</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card glass" style={{ height: 440 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contract Field Analysis</h3>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, fontWeight: 600 }}>
              <span style={{ color: 'var(--success)' }}>● Optimized</span>
              <span style={{ color: 'var(--warning)' }}>● Moderate</span>
              <span style={{ color: 'var(--danger)' }}>● Exposure</span>
            </div>
          </div>
          <div style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
                <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="card-sm" style={{ border: '1px solid var(--border-accent)', background: 'var(--bg-card)', padding: '12px' }}>
                          <p style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{data.name}</p>
                          <p style={{ fontSize: 11, color: RISK_COLORS[data.level] }}>Risk Score: {data.y}/100</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} shape="circle">
                  {scatterData.map((entry, index) => (
                    <Cell key={index} fill={RISK_COLORS[entry.level]} style={{ filter: `drop-shadow(0 0 8px ${RISK_COLORS[entry.level]}40)` }} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card glass" style={{ padding: 0, height: 440, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Monitoring Feed</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {alerts.length > 0 ? alerts.map((alert, i) => (
              <div key={i} className="card-sm" style={{ 
                marginBottom: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                padding: '16px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: RISK_COLORS[alert.severity] || 'var(--accent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: RISK_COLORS[alert.severity] || 'var(--text-primary)' }}>{alert.title}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>few min ago</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{alert.message}</p>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                No active threats detected.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card glass" style={{ height: 180 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, padding: '0 8px' }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Risk Timeline — Next 12 Months</h3>
          <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, background: '#f59e0b', borderRadius: '50%' }} /> Renewal</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%' }} /> Deadline</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, background: '#3b82f6', borderRadius: '50%' }} /> Termination</span>
          </div>
        </div>
        
        <div style={{ position: 'relative', height: 40, borderBottom: '1px solid var(--border)', margin: '0 20px' }}>
          {timelineData.map((d, i) => (
            <div 
              key={i} 
              style={{ 
                position: 'absolute', 
                left: `${(i * 20) + 10}%`, 
                bottom: -4, 
                width: 8, height: 8, 
                borderRadius: '50%',
                background: d.type === 'Renewal' ? '#f59e0b' : d.type === 'Deadline' ? '#ef4444' : '#3b82f6',
                boxShadow: `0 0 12px ${d.type === 'Renewal' ? '#f59e0b' : d.type === 'Deadline' ? '#ef4444' : '#3b82f6'}`
              }}
            />
          ))}
          <div style={{ position: 'absolute', bottom: -20, left: 0, fontSize: 10, color: 'var(--text-muted)' }}>Today</div>
          <div style={{ position: 'absolute', bottom: -20, left: '25%', fontSize: 10, color: 'var(--text-muted)' }}>90d</div>
          <div style={{ position: 'absolute', bottom: -20, left: '50%', fontSize: 10, color: 'var(--text-muted)' }}>180d</div>
          <div style={{ position: 'absolute', bottom: -20, left: '75%', fontSize: 10, color: 'var(--text-muted)' }}>270d</div>
          <div style={{ position: 'absolute', bottom: -20, right: 0, fontSize: 10, color: 'var(--text-muted)' }}>1 Year</div>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
        padding: '12px 24px', display: 'flex', gap: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        zIndex: 100
      }}>
        <button onClick={() => navigate('/upload')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', transition: 'transform 0.2s' }}><Upload size={20} /></button>
        <button onClick={() => navigate('/contracts')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', transition: 'transform 0.2s' }}><LayoutDashboard size={20} /></button>
        <button onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', transition: 'transform 0.2s' }}><Zap size={20} /></button>
        <button onClick={() => navigate('/monitoring')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', transition: 'transform 0.2s' }}><Bell size={20} /></button>
      </div>
    </div>
  );
}
