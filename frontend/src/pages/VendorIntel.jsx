import { useState } from 'react';
import { vendorAPI } from '../api/client';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { 
  Building2, Search, Globe, Mail, ShieldCheck, 
  Activity, AlertTriangle, Zap, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const HEALTH_DATA = [
  { month: 'Oct', health: 82 },
  { month: 'Nov', health: 78 },
  { month: 'Dec', health: 85 },
  { month: 'Jan', health: 81 },
  { month: 'Feb', health: 89 },
  { month: 'Mar', health: 84 },
];

function TrustGauge({ score, size = 120 }) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const data = [{ value: score, fill: color }];
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="85%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color }}>{score}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Trust</div>
      </div>
    </div>
  );
}

export default function VendorIntel() {
  const [vendorName, setVendorName] = useState('');
  const [industry, setIndustry] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!vendorName.trim()) return toast.error('Enter a vendor name');
    setLoading(true);
    try {
      const { data } = await vendorAPI.analyze({ vendor_name: vendorName, industry });
      setResult(data);
      toast.success('Vendor profile generated');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Vendor Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Strategic Partner Ecosystem & Risk Profiling</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
             <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input className="input" placeholder="Search vendors..." style={{ width: 300, paddingLeft: 44 }} value={vendorName} onChange={e => setVendorName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>{loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />} {loading ? 'Analyzing...' : 'Analyze Vendor'}</button>
        </div>
      </div>

      {!result ? (
        <div className="card glass" style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.3 }} />
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Explore Vendor Ecosystem</h3>
           <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Analyze any vendor to uncover hidden risks, performance metrics, and relationship health scores.</p>
        </div>
      ) : (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, marginBottom: 32 }}>
             <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 40 }}>
                <div style={{ width: 80, height: 80, borderRadius: 20, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid var(--accent)' }}><Building2 size={36} color="var(--accent)" /></div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{result.vendor_name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>{result.industry || 'Technology Solutions'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 12 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}><Globe size={14} /> <span>www.{result.vendor_name.toLowerCase().replace(/\s/g, '')}.com</span></div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}><Mail size={14} /> <span>contact@{result.vendor_name.toLowerCase().replace(/\s/g, '')}.com</span></div>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div className="grid-3">
                   <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}><TrustGauge score={result.trust_score} size={100} /></div>
                   <div className="card glass" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><Activity size={16} style={{ color: '#3b82f6' }} /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Performance</span></div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>92.4%</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginTop: 12, overflow: 'hidden' }}><div style={{ height: '100%', width: '92%', background: '#3b82f6' }} /></div>
                   </div>
                   <div className="card glass" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><ShieldCheck size={16} style={{ color: result.trust_score > 70 ? '#10b981' : '#f59e0b' }} /><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk tier</span></div>
                      <div style={{ fontSize: 20, fontWeight: 800, textTransform: 'capitalize' }}>{result.risk_level}</div>
                   </div>
                </div>
                <div className="card glass" style={{ flex: 1 }}>
                   <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 24 }}>Relationship Health History</h3>
                   <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={HEALTH_DATA}>
                            <defs><linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                            <Area type="monotone" dataKey="health" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
          </div>
          <div className="card glass">
             <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 24 }}>Critical Risk Factors</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {result.risk_indicators?.map((indicator, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                     <div style={{ width: 40, height: 40, borderRadius: 12, background: indicator.severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><AlertTriangle size={20} style={{ color: indicator.severity === 'high' ? '#ef4444' : '#f59e0b' }} /></div>
                     <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 700 }}>{indicator.label.replace(/_/g, ' ')}</span><span className={`badge badge-${indicator.severity}`} style={{ fontSize: 10 }}>{indicator.severity}</span></div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{indicator.description}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
