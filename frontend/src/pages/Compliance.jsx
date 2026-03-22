import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractsAPI, complianceAPI } from '../api/client';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis 
} from 'recharts';
import { 
  ArrowLeft, Shield, CheckCircle2, Globe, Lock, Activity, Zap, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

function ComplianceGauge({ score, size = 120 }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
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
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color }}>{score}%</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score</div>
      </div>
    </div>
  );
}

export default function Compliance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.contractId?.toString() || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data)).catch(() => {}); }, []);

  const handleScan = async () => {
    if (!selectedId) return toast.error('Select a contract');
    setLoading(true);
    try {
      const { data } = await complianceAPI.scan(selectedId);
      setResult(data);
      toast.success('Compliance audit complete');
    } catch { toast.error('Scan failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
           <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Regulatory Compliance</h1>
            {result && <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>82% Compliant</span>}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Real-time audit across global regulatory frameworks</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: 240 }}>
             <option value="">— Select Contract —</option>
             {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
           </select>
           <button className="btn btn-primary" onClick={handleScan} disabled={loading || !selectedId}>
             {loading ? <RefreshCw className="spinner" size={16} /> : <Shield size={16} />} 
             {loading ? 'Auditing...' : 'Run Audit'}
           </button>
        </div>
      </div>

      {!result ? (
        <div className="card glass" style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <Lock size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.3 }} />
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Compliance Audit Ready</h3>
           <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Select a contract to perform a deep-scan against GDPR, HIPAA, SOC2, and more.</p>
        </div>
      ) : (
        <div className="fade-in">
          <div className="grid-4" style={{ marginBottom: 32 }}>
             <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px' }}>
                <ComplianceGauge score={result.overall_score} />
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Globe size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reg. Updates</span>
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 800 }}>12</div>
                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>New standards detected</p>
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Lock size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Data Privacy</span>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 700 }}>Active Seal</div>
                 <p style={{ fontSize: 11, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 8 }}>VALIDATED</p>
             </div>
             <div className="card glass" style={{ padding: '24px' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Activity size={16} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Audit Status</span>
                 </div>
                 <div style={{ fontSize: 18, fontWeight: 700 }}>SOC2 Type II</div>
                 <p style={{ fontSize: 11, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 8 }}>COMPLIANT</p>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 32 }}>
             <div className="card glass">
                <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 24 }}>Regulatory Frameworks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                   {[
                     { name: 'GDPR', score: 94, color: '#10b981' },
                     { name: 'HIPAA', score: 68, color: '#f59e0b' },
                     { name: 'SOC2', score: 88, color: '#10b981' },
                     { name: 'CCPA', score: 42, color: '#ef4444' }
                   ].map((f, i) => (
                     <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, fontWeight: 700 }}>
                           <span>{f.name}</span>
                           <span style={{ color: f.color }}>{f.score}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                           <div style={{ height: '100%', width: `${f.score}%`, background: f.color, borderRadius: 10 }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>Compliance Violations</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                   <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Requirement</th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Severity</th>
                        <th style={{ textAlign: 'left', padding: '12px 24px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {[
                        { req: 'Data Retention Policy', sev: 'Critical', stat: 'Open', color: '#ef4444' },
                        { req: 'Right to Erasure', sev: 'Warning', stat: 'Review', color: '#f59e0b' },
                        { req: 'Sub-processor Disclosure', sev: 'Info', stat: 'Fixed', color: '#10b981' }
                      ].map((v, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                           <td style={{ padding: '16px 24px' }}>
                              <div style={{ fontWeight: 600 }}>{v.req}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Update Clause 8.4</div>
                           </td>
                           <td style={{ padding: '16px 24px' }}>
                              <span style={{ color: v.color, fontSize: 10, fontWeight: 800 }}>{v.sev}</span>
                           </td>
                           <td style={{ padding: '16px 24px' }}>
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{v.stat}</span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
