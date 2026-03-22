import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { contractsAPI, obligationsAPI } from '../api/client';
import { 
  Calendar, DollarSign, RefreshCw, AlertCircle, 
  Clock, Shield, Layers, ChevronRight, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_META = {
  payment: { icon: '💰', color: '#6366f1', bg: 'rgba(99,102,241,0.05)', border: 'rgba(99,102,241,0.3)' },
  renewal: { icon: '🔄', color: '#fbbf24', bg: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.3)' },
  termination: { icon: '🚫', color: '#ef4444', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.3)' },
  delivery: { icon: '📦', color: '#34d399', bg: 'rgba(52,211,153,0.05)', border: 'rgba(52,211,153,0.3)' },
  reporting: { icon: '📊', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.3)' },
  general: { icon: '📌', color: '#94a3b8', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.3)' },
};

export default function Obligations() {
  const location = useLocation();
  const [contracts, setContracts] = useState([]);
  const [selectedId, setSelectedId] = useState(location.state?.contractId?.toString() || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data)).catch(() => {}); }, []);

  const handleExtract = async () => {
    if (!selectedId) return toast.error('Selection required');
    setLoading(true); 
    setResult(null);
    try {
      const { data } = await obligationsAPI.get(selectedId);
      setResult(data);
      toast.success('Commitment vectors extracted');
    } catch { toast.error('Extraction sequence failed'); }
    finally { setLoading(false); }
  };

  const filtered = (result?.obligations || []).filter(o => filterType === 'all' || o.type === filterType);

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '40px 60px' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>Commitment Protocol</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>Neural tracking of tactical obligations, deadlines and financial milestones</p>
        </div>
        {result && (
           <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Vectors</p>
                 <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--accent)' }}>{result.total_obligations}</p>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
              <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</p>
                 <p style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>SYNALLED</p>
              </div>
           </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
               <Layers size={16} color="var(--accent)" /> Source Selection
            </h3>
            <div style={{ marginBottom: 20 }}>
               <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Contract Repository</label>
               <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
                 <option value="">— Select Target —</option>
                 {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
               </select>
            </div>
            <button className="btn btn-primary" onClick={handleExtract} disabled={loading || !selectedId} style={{ width: '100%', height: 48, justifyContent: 'center' }}>
              {loading ? <><RefreshCw className="spinner" size={16} /> Vectorizing...</> : <><Shield size={16} /> Initialize Extraction</>}
            </button>
          </div>

          {result && (
            <div className="card glass" style={{ padding: 24 }}>
               <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Classification Filters</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                 {['all', ...Object.keys(result.type_breakdown || {})].map(type => {
                   const m = TYPE_META[type] || TYPE_META.general;
                   const isActive = filterType === type;
                   return (
                     <button key={type} className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ justifyContent: 'space-between', height: 40, padding: '0 16px', background: isActive ? 'var(--accent-glow)' : 'transparent', border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)', color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} onClick={() => setFilterType(type)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                           <span style={{ fontSize: 14 }}>{type === 'all' ? '🔍' : m.icon}</span>
                           <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{type}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>{type === 'all' ? result.total_obligations : result.type_breakdown[type]}</span>
                     </button>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        <div>
           {!result ? (
             <div className="card glass" style={{ textAlign: 'center', padding: '120px 40px', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
                <Clock size={60} style={{ color: 'var(--text-muted)', opacity: 0.1, marginBottom: 24 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>No Active Protocol</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>Select a contract from the repository to extract and track neural commitment vectors.</p>
             </div>
           ) : (
             <div className="fade-in">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                   {filtered.length === 0 ? (
                     <div className="card glass" style={{ textAlign: 'center', padding: 60 }}>No commitments found for this classification.</div>
                   ) : (
                     filtered.map((obl, idx) => {
                       const m = TYPE_META[obl.type] || TYPE_META.general;
                       return (
                         <div key={idx} className="card glass fade-in" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${m.border}`, background: m.bg }}>
                            <div style={{ padding: '24px', display: 'flex', gap: 20 }}>
                               <div style={{ width: 52, height: 52, borderRadius: 12, border: `1px solid ${m.border}`, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{m.icon}</div>
                               <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                     <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                           <span style={{ fontSize: 11, fontWeight: 800, color: m.color, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', border: `1px solid ${m.border}` }}>{obl.type}</span>
                                           <span style={{ fontSize: 11, fontWeight: 800, color: obl.priority === 'high' ? '#ef4444' : '#fbbf24', textTransform: 'uppercase' }}>{obl.priority} Priority</span>
                                        </div>
                                        <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: 'var(--text-primary)' }}>{obl.description}</p>
                                     </div>
                                     {obl.amount && (
                                       <div style={{ textAlign: 'right' }}>
                                          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Value</p>
                                          <p style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>{obl.amount}</p>
                                       </div>
                                     )}
                                  </div>
                                  {obl.dates.length > 0 && (
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                                       <Clock size={14} color="var(--text-muted)" />
                                       <div style={{ display: 'flex', gap: 8 }}>{obl.dates.map((d, i) => (<span key={i} style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{d}</span>))}</div>
                                       <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 11, fontWeight: 800 }}><CheckCircle2 size={12} /> TRACKED</div>
                                    </div>
                                  )}
                               </div>
                               <div style={{ display: 'flex', alignItems: 'center' }}><ChevronRight size={20} color="var(--text-muted)" /></div>
                            </div>
                         </div>
                       );
                     })
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
