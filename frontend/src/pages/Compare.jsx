import { useState, useEffect } from 'react';
import { contractsAPI, analysisAPI } from '../api/client';
import { 
  GitCompare, Plus, Minus, Equal, 
  Cpu, Zap, Layers, RefreshCw, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Compare() {
  const [contracts, setContracts] = useState([]);
  const [id1, setId1] = useState('');
  const [id2, setId2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('added');

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data)).catch(() => {}); }, []);

  const handleCompare = async () => {
    if (!id1 || !id2) return toast.error('Select target vectors');
    if (id1 === id2) return toast.error('Duplicate target detected');
    setLoading(true); 
    setResult(null);
    try {
      const { data } = await analysisAPI.compare(Number(id1), Number(id2));
      setResult(data);
      toast.success('Vector collision analysis complete');
    } catch { toast.error('Comparison sequence failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '40px 60px' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px' }}>Neural Version Comparison</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 8 }}>Execute tactical vector collision analysis between contract iterations</p>
      </div>

      {/* Selectors */}
      <div className="card glass" style={{ marginBottom: 40, padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 24, alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Primary Vector (Base)</label>
            <select className="input" value={id1} onChange={e => setId1(e.target.value)} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
              <option value="">— Select Target Alpha —</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
               <GitCompare size={20} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Secondary Vector (Compare)</label>
            <select className="input" value={id2} onChange={e => setId2(e.target.value)} style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
              <option value="">— Select Target Beta —</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleCompare} disabled={loading || !id1 || !id2} style={{ marginTop: 32, justifyContent: 'center', width: '100%', height: 52, fontSize: 16, fontWeight: 800 }}>
          {loading ? <><RefreshCw className="spinner" size={18} /> Syncing Vectors...</> : <><Zap size={18} /> Initialize Comparison</>}
        </button>
      </div>

      {result ? (
        <div className="fade-in">
          <div className="grid-4" style={{ marginBottom: 32, gap: 20 }}>
            {[
              { label: 'Neural Similarity', val: `${result.similarity_percent}%`, icon: Activity, color: 'var(--accent)' },
              { label: 'Injected (Added)', val: result.added_count, icon: Plus, color: '#10b981' },
              { label: 'Purged (Removed)', val: result.removed_count, icon: Minus, color: '#ef4444' },
              { label: 'Static (Stable)', val: result.unchanged_count, icon: Equal, color: 'var(--text-muted)' },
            ].map(s => (
              <div key={s.label} className="card glass" style={{ textAlign: 'center', padding: 24, border: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: s.color }}>
                  <s.icon size={20} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 2 }}>{s.val}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
            <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border)', display: 'flex', background: 'rgba(255,255,255,0.01)' }}>
                {[
                  { id: 'added', label: 'Injected Vector', icon: <Plus size={14} /> },
                  { id: 'removed', label: 'Purged Vector', icon: <Minus size={14} /> },
                  { id: 'diff', label: 'Unified Protocol', icon: <Layers size={14} /> }
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '20px 24px', fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)', borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: 24, maxHeight: 600, overflowY: 'auto' }}>
                {tab === 'added' && (
                  result.added_lines.length === 0
                    ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No additional vector data injected.</div>
                    : result.added_lines.map((l, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Plus size={12} /></div>
                        <span style={{ fontSize: 13, color: '#6ee7b7', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>{l}</span>
                      </div>
                    ))
                )}
                {tab === 'removed' && (
                  result.removed_lines.length === 0
                    ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No legacy vector data purged.</div>
                    : result.removed_lines.map((l, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}><Minus size={12} /></div>
                        <span style={{ fontSize: 13, color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>{l}</span>
                      </div>
                    ))
                )}
                {tab === 'diff' && (
                  <pre style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.8 }}>
                    {result.unified_diff || 'No unified protocol generated.'}
                  </pre>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div className="card glass" style={{ padding: 24, border: '1px solid var(--border-accent)', background: 'var(--accent-glow)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                     <Cpu size={16} color="var(--accent)" /> Neural Insights
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{result.summary}"</p>
               </div>
               <div className="card glass" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Vector Integrity</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Semantic Alignment</span>
                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>{result.similarity_percent}%</span>
                     </div>
                     <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--accent)', width: `${result.similarity_percent}%` }} />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : !loading && (
        <div className="card glass" style={{ textAlign: 'center', padding: '120px 40px', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
          <GitCompare size={64} style={{ color: 'var(--text-muted)', opacity: 0.1, marginBottom: 24 }} />
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Standby for Comparison</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>Select two distinct vector targets to initialize the neural cross-document collision analysis.</p>
        </div>
      )}
    </div>
  );
}
