import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI } from '../api/client';
import { 
  FileText, Trash2, Search, Upload, 
  Calendar, Layers, Activity, AlertTriangle, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_LEVEL_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function Contracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    contractsAPI.list()
      .then(r => setContracts(r.data))
      .catch(() => toast.error('Failed to load contracts'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await contractsAPI.delete(id);
      setContracts(c => c.filter(x => x.id !== id));
      toast.success('Contract deleted');
    } catch {
      toast.error('Delete failed');
    } finally { setDeleting(null); }
  };

  const filtered = contracts
    .filter(c => c.filename.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterLevel === 'all' || c.risk_level === filterLevel)
    .sort((a, b) => (RISK_LEVEL_ORDER[a.risk_level] ?? 4) - (RISK_LEVEL_ORDER[b.risk_level] ?? 4));

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>My Contracts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Manage and review your uploaded contracts</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Upload size={16} /> Upload New
        </button>
      </div>

      <div className="card glass" style={{ marginBottom: 32, padding: '12px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.02)', borderColor: 'transparent' }}
            placeholder="Search by filename..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ height: 24, width: 1, background: 'var(--border)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'critical', 'high', 'medium', 'low'].map(level => (
            <button
              key={level}
              className={`btn ${filterLevel === level ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ fontSize: 11, textTransform: 'capitalize' }}
              onClick={() => setFilterLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
          <div className="spinner" style={{ width: 48, height: 48 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '100px 24px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
             <FileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>No Contracts Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 32px' }}>Upload your first contract to get started with AI analysis.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} /> Upload Contract
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              className="card glass fade-in"
              style={{ overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => navigate(`/contracts/${c.id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 24px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: c.is_valid_contract ? 'var(--accent-glow)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.is_valid_contract ? 'var(--accent)' : '#f59e0b', border: `1px solid ${c.is_valid_contract ? 'var(--accent)' : 'rgba(245,158,11,0.3)'}`, flexShrink: 0 }}>
                  {c.is_valid_contract ? <FileText size={24} /> : <AlertTriangle size={24} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                     <h3 style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.filename}</h3>
                     {c.is_valid_contract ? (
                       <span className={`badge badge-${c.risk_level || 'low'}`} style={{ fontSize: 10 }}>{c.risk_level || 'Pending'}</span>
                     ) : (
                       <span className="badge badge-warning" style={{ fontSize: 10 }}>Not a Contract</span>
                     )}
                  </div>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Layers size={14} /> <span>{c.page_count} Pages</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Activity size={14} /> <span>{c.word_count?.toLocaleString()} words</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Calendar size={14} /> <span>{new Date(c.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {c.risk_score !== null && c.is_valid_contract && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: c.risk_level === 'critical' ? '#ef4444' : c.risk_level === 'high' ? '#f87171' : c.risk_level === 'medium' ? '#fbbf24' : '#34d399' }}>
                        {Math.round(c.risk_score)}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk</div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                     <button
                       className="btn btn-secondary btn-sm"
                       style={{ padding: 10, color: 'var(--accent)' }}
                       onClick={e => { e.stopPropagation(); navigate(`/contracts/${c.id}`); }}
                       title="View Analysis"
                     >
                       <ChevronRight size={16} />
                     </button>
                     <button className="btn btn-danger btn-sm" style={{ padding: 10 }} disabled={deleting === c.id} onClick={e => { e.stopPropagation(); handleDelete(c.id, c.filename); }}>
                       {deleting === c.id ? <div className="spinner" /> : <Trash2 size={16} />}
                     </button>
                  </div>
                </div>
              </div>

              {/* Summary preview on hover — no expand, just a subtle hint */}
              {c.ai_summary && c.is_valid_contract && (
                <div style={{ padding: '0 24px 16px 92px' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                    {c.ai_summary}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
