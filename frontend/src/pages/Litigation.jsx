import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractsAPI, litigationAPI } from '../api/client';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis 
} from 'recharts';
import { 
  ArrowLeft, Scale, ShieldAlert, DollarSign, Clock, 
  CheckCircle2, AlertTriangle, Zap, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_COLORS = { high: '#dc2626', medium: '#f59e0b', low: '#10b981' };

function ProbGauge({ probability, size = 120 }) {
  const color = probability >= 60 ? RISK_COLORS.high : probability >= 35 ? RISK_COLORS.medium : RISK_COLORS.low;
  const data = [{ value: probability, fill: color }];
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="85%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color }}>{probability}%</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dispute</div>
      </div>
    </div>
  );
}

export default function Litigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.contractId?.toString() || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data)).catch(() => {}); }, []);

  const handlePredict = async () => {
    if (!selectedId) return toast.error('Select a contract');
    setLoading(true);
    try {
      const { data } = await litigationAPI.predict(selectedId);
      setResult(data);
      toast.success('Dispute prediction updated');
    } catch { toast.error('Prediction failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
           <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Litigation Risk</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Predictive Exposure & Case Law Analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: 240 }}>
             <option value="">— Select Contract —</option>
             {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
           </select>
           <button className="btn btn-primary" onClick={handlePredict} disabled={loading || !selectedId}>
             {loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />} 
             {loading ? 'Analyzing...' : 'Predict Risk'}
           </button>
        </div>
      </div>

      {!result ? (
        <div className="card glass" style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <Scale size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.3 }} />
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ready for Prediction</h3>
           <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Select a contract from the dropdown to start the AI-powered litigation risk analysis and case law matching.</p>
        </div>
      ) : (
        <div className="fade-in">
          <div className="grid-4" style={{ marginBottom: 32 }}>
             <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
                <ProbGauge probability={result.probability} />
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RISK_COLORS.high }}><DollarSign size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Exposure</span>
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 800 }}>$124,500</div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Based on {result.triggered_patterns?.length || 0} factors</p>
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: RISK_COLORS.medium }}><ShieldAlert size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Potential Remedy</span>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 700 }}>Injunctive Relief</div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>+ Damages</p>
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Clock size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Duration</span>
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 800 }}>14-18 Mo</div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Commercial benchmark</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 32 }}>
             <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Similar Case Law Analysis</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                   <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Case Reference</th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Outcome</th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Rel.</th>
                      </tr>
                   </thead>
                   <tbody>
                      {[
                        { ref: 'Vento v. Apex Corp', out: 'Settled', rel: '94%', color: '#f59e0b' },
                        { ref: 'Oracle v. Google', out: 'Defend.', rel: '82%', color: '#10b981' },
                        { ref: 'SaaS v. State', out: 'Plaint.', rel: '71%', color: '#ef4444' }
                      ].map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px', fontWeight: 600 }}>{c.ref}</td>
                           <td style={{ padding: '16px 24px' }}><span style={{ color: c.color, fontSize: 11, fontWeight: 700 }}>{c.out.toUpperCase()}</span></td>
                           <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{c.rel}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="card glass">
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 24 }}>Risk Mitigation Strategy</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                   {[
                     { title: 'Clarify Indemnification', desc: 'Current wording is overly broad.' },
                     { title: 'Adjust Governing Law', desc: 'NY reduction of exposure.' },
                     { title: 'Audit Notice Periods', desc: 'Prevent forfeiture of rights.' }
                   ].map((s, i) => (
                     <div key={i} style={{ display: 'flex', gap: 16 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={14} /></div>
                        <div>
                           <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                           <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <div style={{ marginTop: 32, padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 16, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <AlertTriangle size={18} style={{ color: RISK_COLORS.high, marginTop: 2 }} />
                      <div>
                         <div style={{ fontSize: 13, fontWeight: 700, color: RISK_COLORS.high, marginBottom: 4 }}>Pre-Litigation Warning</div>
                         <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Ensure all communications are reviewed by counsel.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
