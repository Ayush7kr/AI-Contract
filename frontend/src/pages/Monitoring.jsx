import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { monitoringAPI } from '../api/client';
import { Bell, RefreshCw, Eye, Activity, Shield, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const SEV_META = {
  critical: { bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', dot: '#dc2626', icon: <AlertCircle size={16} /> },
  high: { bg: 'rgba(248,113,113,0.03)', border: 'rgba(248,113,113,0.2)', color: '#f87171', dot: '#ef4444', icon: <AlertCircle size={16} /> },
  medium: { bg: 'rgba(251,191,36,0.03)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', dot: '#f59e0b', icon: <AlertCircle size={16} /> },
  info: { bg: 'rgba(99,102,241,0.03)', border: 'rgba(99,102,241,0.2)', color: '#818cf8', dot: '#6366f1', icon: <Info size={16} /> },
};

export default function Monitoring() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSev, setFilterSev] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await monitoringAPI.getAlerts();
      setData(data);
    } catch { toast.error('Failed to sync risk feeds'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const filtered = (data?.alerts || []).filter(a => filterSev === 'all' || a.severity === filterSev);
  const counts = data?.severity_counts || {};

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-1px' }}>Risk Operations Center</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
             <Activity size={14} color="var(--accent)" />
             <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Live neural monitoring across {data?.total_alerts || 0} active triggers</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
             <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>System Status</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>NOMINAL</span>
             </div>
          </div>
          <button className="btn btn-secondary" onClick={load} disabled={loading} style={{ height: 44, padding: '0 20px' }}>
             <RefreshCw size={14} className={loading ? 'spinner' : ''} /> Sync Feed
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 40, gap: 20 }}>
        {[
          { label: 'Neural Triggers', val: data?.total_alerts || 0, color: 'var(--accent)', icon: <Bell size={18} /> },
          { label: 'Critical Risk', val: counts.critical || 0, color: '#ef4444', icon: <Shield size={18} /> },
          { label: 'Tactical High', val: counts.high || 0, color: '#f87171', icon: <AlertCircle size={18} /> },
          { label: 'Strategic Med', val: counts.medium || 0, color: '#fbbf24', icon: <Info size={18} /> },
        ].map(s => (
          <div key={s.label} className="card glass" style={{ padding: 24, cursor: 'pointer', border: '1px solid var(--border)' }} onClick={() => setFilterSev(s.label.toLowerCase().includes('neural') ? 'all' : s.label.split(' ')[0].toLowerCase())}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
               <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
               <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>LIVE</span>
            </div>
            <p style={{ fontSize: 32, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.val}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Tactical Alert Feed</h3>
            <div style={{ display: 'flex', gap: 6 }}>
               {['all', 'critical', 'high', 'medium', 'info'].map(s => (
                 <button key={s} className="btn-sm" style={{ 
                   background: filterSev === s ? 'var(--accent-glow)' : 'transparent',
                   border: filterSev === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                   color: filterSev === s ? 'var(--accent)' : 'var(--text-muted)',
                   padding: '5px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontWeight: 700, textTransform: 'capitalize'
                 }} onClick={() => setFilterSev(s)}>{s}</button>
               ))}
            </div>
         </div>
         {loading && !data ? (
           <div style={{ padding: 100, textAlign: 'center' }}><RefreshCw className="spinner" size={32} color="var(--accent)" /></div>
         ) : filtered.length === 0 ? (
           <div style={{ padding: 100, textAlign: 'center' }}>
             <Shield size={48} style={{ color: 'var(--text-muted)', opacity: 0.2, marginBottom: 16 }} />
             <p style={{ color: 'var(--text-secondary)' }}>Neural perimeter secure. No active triggers detected.</p>
           </div>
         ) : (
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             {filtered.map((alert, idx) => {
               const meta = SEV_META[alert.severity] || SEV_META.info;
               return (
                 <div key={alert.id} className="fade-in" style={{ padding: '24px', borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--border)', background: meta.bg, transition: 'all 0.2s', display: 'flex', gap: 20 }}>
                   <div style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${meta.border}`, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>{meta.icon}</div>
                   <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                         <div>
                            <h4 style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{alert.title}</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{alert.message}</p>
                         </div>
                         <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'RECENT'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                         <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, background: meta.bg, border: `1px solid ${meta.border}`, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>{alert.severity}</div>
                         <div style={{ width: 1, height: 12, background: 'var(--border)' }} />
                         <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={12} /> {alert.action || 'System Logs'}</div>
                      </div>
                   </div>
                   {alert.contract_id && <button className="btn btn-secondary btn-sm" style={{ height: 32 }} onClick={() => navigate(`/analysis/${alert.contract_id}`)}><Eye size={14} /> View</button>}
                 </div>
               );
             })}
           </div>
         )}
      </div>
    </div>
  );
}
