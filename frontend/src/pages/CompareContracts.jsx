import { useState, useEffect } from 'react';
import { contractsAPI, aiAPI } from '../api/client';
import { 
  GitCompare, FileStack, ArrowRightLeft, AlertCircle, 
  CheckCircle2, FileText, Search, ChevronDown, 
  ShieldAlert, Sparkles, TrendingUp, TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompareContracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    contractsAPI.list()
      .then(r => setContracts(r.data))
      .catch(() => toast.error('Failed to load contracts'))
      .finally(() => setLoading(false));
  }, []);

  const handleCompare = async () => {
    if (!id1 || !id2) return toast.error('Select two contracts to compare');
    if (id1 === id2) return toast.error('Please select two different contracts');

    setComparing(true);
    try {
      const res = await aiAPI.compare({ contract_id_1: id1, contract_id_2: id2 });
      setResult(res.data);
      toast.success('Comparison complete');
    } catch {
      toast.error('Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  const c1 = contracts.find(c => c.id === parseInt(id1));
  const c2 = contracts.find(c => c.id === parseInt(id2));

  return (
    <div className="page-container" style={{ maxWidth: 1400, padding: '32px 48px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 12 }}>
          <GitCompare size={32} color="var(--accent)" /> Contract Comparison
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Compare two contract versions and analyze legal differences.</p>
      </div>

      {/* Selectors */}
      <div className="card glass" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Contract 1 (Base)</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input" 
                value={id1} 
                onChange={e => setId1(e.target.value)}
                style={{ appearance: 'none', paddingRight: 40 }}
              >
                <option value="">Select a contract...</option>
                {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>

          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-input)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <ArrowRightLeft size={20} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Contract 2 (Comparison)</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="input" 
                value={id2} 
                onChange={e => setId2(e.target.value)}
                style={{ appearance: 'none', paddingRight: 40 }}
              >
                <option value="">Select a contract...</option>
                {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          disabled={comparing || !id1 || !id2} 
          onClick={handleCompare}
          style={{ width: '100%', marginTop: 32, height: 52, fontSize: 16, fontWeight: 700 }}
        >
          {comparing ? <div className="spinner" style={{ width: 20, height: 20 }} /> : <><GitCompare size={20} /> Compare Contracts</>}
        </button>
      </div>

      {result && (
        <div className="fade-in">
          {/* Comparison Summary */}
          <div className="card glass" style={{ padding: 32, marginBottom: 32, border: '1px solid var(--accent)' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'start' }}>
               <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-glow)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <Sparkles size={24} />
               </div>
               <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>AI Difference Analysis</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12 }}>{result.difference_analysis?.overall_summary}</p>
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                     {result.difference_analysis?.risk_impact?.toLowerCase().includes('increase') ? <TrendingUp size={18} color="var(--danger)" /> : <TrendingDown size={18} color="var(--success)" />}
                     <span style={{ fontSize: 13, fontWeight: 600 }}>{result.difference_analysis?.risk_impact}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Differential Sections */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
            {/* Modified Clauses */}
            <div className="card glass" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                 <AlertCircle size={18} color="var(--warning)" /> Modified Clauses
                 <span className="badge badge-warning" style={{ fontSize: 10 }}>{result.difference_analysis?.modified_clauses?.length || 0}</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.difference_analysis?.modified_clauses?.map((m, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 12, background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{m.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: 10, borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div style={{ fontWeight: 800, marginBottom: 4, label: 'BEFORE' }}>WAS:</div>
                        {m.before}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-primary)', padding: 10, borderRadius: 8, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                        <div style={{ fontWeight: 800, marginBottom: 4, label: 'AFTER' }}>NOW:</div>
                        {m.after}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--accent-light)', display: 'flex', gap: 6, alignItems: 'start' }}>
                      <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{m.change_impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Added/Removed Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               {/* Added Clauses */}
               <div className="card glass" style={{ padding: 24, flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                     <CheckCircle2 size={18} color="var(--success)" /> Added Clauses
                     <span className="badge badge-pass" style={{ fontSize: 10 }}>{result.difference_analysis?.added_clauses?.length || 0}</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {result.difference_analysis?.added_clauses?.map((a, i) => (
                      <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{a.text}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Removed Clauses */}
               <div className="card glass" style={{ padding: 24, flex: 1 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                     <ShieldAlert size={18} color="var(--danger)" /> Removed Clauses
                     <span className="badge badge-violation" style={{ fontSize: 10 }}>{result.difference_analysis?.removed_clauses?.length || 0}</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {result.difference_analysis?.removed_clauses?.map((r, i) => (
                      <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', fontSize: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 11, textDecoration: 'line-through' }}>{r.text}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {loading && !contracts.length && (
        <div style={{ textAlign: 'center', padding: 100 }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      )}
    </div>
  );
}
