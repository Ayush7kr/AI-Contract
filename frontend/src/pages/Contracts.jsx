import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI } from '../api/client';
import { 
  FileText, Trash2, Eye, Search, Upload, 
  Calendar, Layers, Activity
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
      .catch(() => toast.error('Failed to load repository'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"?`)) return;
    setDeleting(id);
    try {
      await contractsAPI.delete(id);
      setContracts(c => c.filter(x => x.id !== id));
      toast.success('Document purged');
    } catch {
      toast.error('Purge failed');
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
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Document Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Manage and analyze your enterprise contract repository</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <Upload size={16} /> New Document
        </button>
      </div>

      <div className="card glass" style={{ marginBottom: 32, padding: '12px 20px', display: 'flex', gap: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.02)', borderColor: 'transparent' }}
            placeholder="Search documents by name or metadata..."
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
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Empty Repository</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 32px' }}>Your contract intelligence workspace is currently empty. Upload documents to start analysis.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upload')}>
            <Upload size={16} /> Initialize Library
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              className="card glass fade-in"
              style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 24px', cursor: 'pointer', border: '1px solid var(--border)' }}
              onClick={() => navigate(`/analysis/${c.id}`)}
            >
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', border: '1px solid var(--accent)', flexShrink: 0 }}>
                <FileText size={24} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                   <h3 style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.filename}</h3>
                   <span className={`badge badge-${c.risk_level || 'low'}`} style={{ fontSize: 10 }}>{c.risk_level || 'Pending'}</span>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {c.risk_score !== null && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: c.risk_level === 'critical' ? '#ef4444' : c.risk_level === 'high' ? '#f87171' : c.risk_level === 'medium' ? '#fbbf24' : '#34d399' }}>
                      {Math.round(c.risk_score)}%
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk</div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                   <button className="btn btn-secondary btn-sm" style={{ padding: 10 }} onClick={e => { e.stopPropagation(); navigate(`/analysis/${c.id}`); }}><Eye size={16} /></button>
                   <button className="btn btn-danger btn-sm" style={{ padding: 10 }} disabled={deleting === c.id} onClick={e => { e.stopPropagation(); handleDelete(c.id, c.filename); }}>{deleting === c.id ? <div className="spinner" /> : <Trash2 size={16} />}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
