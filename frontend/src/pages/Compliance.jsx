import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractsAPI, complianceAPI } from '../api/client';
import { 
  ArrowLeft, Shield, CheckCircle2, AlertTriangle, 
  XCircle, Info, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY_COLORS = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
const STATUS_COLORS = { compliant: '#10b981', partial: '#f59e0b', 'non-compliant': '#ef4444' };

export default function Compliance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.contractId?.toString() || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data.filter(c => c.is_valid_contract))).catch(() => {}); }, []);

  const handleScan = async () => {
    if (!selectedId) return toast.error('Select a contract');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await complianceAPI.scan(selectedId);
      setResult(data);
      toast.success('Compliance scan complete');
    } catch { toast.error('Scan failed'); }
    finally { setLoading(false); }
  };

  const statusIcon = (status) => {
    if (status === 'compliant') return <CheckCircle2 size={16} color="#10b981" />;
    if (status === 'partial') return <AlertTriangle size={16} color="#f59e0b" />;
    return <XCircle size={16} color="#ef4444" />;
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
           <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Compliance Scan</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>AI-powered analysis for GDPR, HIPAA, and legal compliance</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <select className="input" value={selectedId} onChange={e => { setSelectedId(e.target.value); setResult(null); }} style={{ width: 260 }}>
             <option value="">— Select Contract —</option>
             {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
           </select>
           <button className="btn btn-primary" onClick={handleScan} disabled={loading || !selectedId}>
             {loading ? <RefreshCw className="spinner" size={16} /> : <Shield size={16} />} 
             {loading ? 'Scanning...' : 'Run Scan'}
           </button>
        </div>
      </div>

      {loading && (
        <div className="card glass" style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="spinner" style={{ width: 48, height: 48, marginBottom: 20 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Analyzing Compliance...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Gemini AI is scanning your contract against regulatory frameworks</p>
        </div>
      )}

      {!result && !loading && (
        <div className="card glass" style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <Shield size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.3 }} />
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Compliance Scan Ready</h3>
           <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Select a contract and run an AI-powered scan to check GDPR, HIPAA, and general legal compliance.</p>
        </div>
      )}

      {result && !loading && (
        <div className="fade-in">
          {/* Overall score */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
              <div style={{ fontSize: 56, fontWeight: 900, color: STATUS_COLORS[result.overall_status] || '#f59e0b', marginBottom: 8 }}>
                {result.overall_score}%
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Overall Score</div>
              <span className={`badge badge-${result.overall_status === 'compliant' ? 'pass' : result.overall_status === 'partial' ? 'warning' : 'violation'}`}>
                {statusIcon(result.overall_status)} {result.overall_status}
              </span>
            </div>
            <div className="card glass" style={{ padding: 32, gridColumn: 'span 2' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Summary</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
            </div>
          </div>

          {/* Frameworks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {(result.frameworks || []).map((fw, i) => (
              <div key={i} className="card glass">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${STATUS_COLORS[fw.status] || '#f59e0b'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {statusIcon(fw.status)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800 }}>{fw.name}</h3>
                      <span className={`badge badge-${fw.status === 'compliant' ? 'pass' : fw.status === 'partial' ? 'warning' : 'violation'}`} style={{ fontSize: 10 }}>
                        {fw.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: STATUS_COLORS[fw.status] || '#f59e0b' }}>{fw.score}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Score</div>
                  </div>
                </div>

                {/* Score bar */}
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
                  <div style={{ height: '100%', width: `${fw.score}%`, background: STATUS_COLORS[fw.status] || '#f59e0b', borderRadius: 10, transition: 'width 0.8s ease' }} />
                </div>

                {/* Issues */}
                {fw.issues?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {fw.issues.map((issue, j) => (
                      <div key={j} style={{ display: 'flex', gap: 12, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${SEVERITY_COLORS[issue.severity] || '#3b82f6'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {issue.severity === 'critical' ? <XCircle size={14} color={SEVERITY_COLORS.critical} /> :
                           issue.severity === 'warning' ? <AlertTriangle size={14} color={SEVERITY_COLORS.warning} /> :
                           <Info size={14} color={SEVERITY_COLORS.info} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{issue.title}</span>
                            <span className={`badge badge-${issue.severity === 'critical' ? 'violation' : issue.severity}`} style={{ fontSize: 10 }}>{issue.severity}</span>
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{issue.description}</p>
                          {issue.recommendation && (
                            <p style={{ fontSize: 11, color: 'var(--accent-light)', lineHeight: 1.4 }}>💡 {issue.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!fw.issues || fw.issues.length === 0) && (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
                    <CheckCircle2 size={20} style={{ marginBottom: 8, color: '#10b981' }} />
                    <p>No issues found for this framework</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
