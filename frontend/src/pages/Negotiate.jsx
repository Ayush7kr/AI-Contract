/**
 * Negotiate — Clause Negotiation with auto-fetch clauses, click-to-fill, and tone selection.
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractsAPI, aiAPI } from '../api/client';
import { 
  ArrowLeft, CheckCircle2, RefreshCw, Zap, Copy, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'collaborative', label: 'Collaborative', desc: 'Balanced, partnership-focused approach' },
  { id: 'protective', label: 'Protective', desc: 'Defensive language maximizing your safeguards' },
  { id: 'formal', label: 'Formal', desc: 'Standard legal language, neutral and precise' },
  { id: 'simplified', label: 'Simplified', desc: 'Plain English, easier to understand' },
  { id: 'assertive', label: 'Assertive', desc: 'Strong, firm language that protects your position' },
];

export default function Negotiate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(location.state?.contractId?.toString() || '');
  const [clauseText, setClauseText] = useState(location.state?.clauseText || '');
  const [tone, setTone] = useState('collaborative');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [allClauses, setAllClauses] = useState([]);
  const [selectedClauseIdx, setSelectedClauseIdx] = useState(null);
  const [loadingClauses, setLoadingClauses] = useState(false);

  // If navigating from analysis page with a specific clause type, try to select it
  const initialClauseType = location.state?.clauseType || '';

  useEffect(() => {
    contractsAPI.list().then(r => setContracts(r.data.filter(c => c.is_valid_contract))).catch(() => {});
  }, []);

  // Auto-fetch clauses when a contract is selected
  useEffect(() => {
    if (selectedContractId) {
      setLoadingClauses(true);
      contractsAPI.get(selectedContractId).then(r => {
        const clauses = r.data.clauses_json || r.data.analysis_json?.key_clauses || [];
        setAllClauses(clauses);
        
        // If we have a clauseText from navigation state, try to find & highlight it
        if (location.state?.clauseText && clauses.length > 0) {
          const matchIdx = clauses.findIndex(c => c.text === location.state.clauseText);
          if (matchIdx >= 0) {
            setSelectedClauseIdx(matchIdx);
          }
        }
      }).catch(() => {
        setAllClauses([]);
      }).finally(() => setLoadingClauses(false));
    } else {
      setAllClauses([]);
      setSelectedClauseIdx(null);
    }
  }, [selectedContractId]);

  const handleClauseSelect = (clause, idx) => {
    setSelectedClauseIdx(idx);
    setClauseText(clause.text);
    setResult(null);
  };

  const handleNegotiate = async () => {
    if (!clauseText.trim() || clauseText.trim().length < 10) {
      return toast.error('Enter a clause with at least 10 characters');
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await aiAPI.negotiate({ 
        clause_text: clauseText,
        tone: tone,
      });
      setResult(data);
      toast.success('Clause rewritten successfully');
    } catch { toast.error('Failed to rewrite clause'); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
           <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Clause Negotiation</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Select a clause from your contract and rewrite it in your desired tone
          </p>
        </div>
        <select className="input" value={selectedContractId} onChange={e => { setSelectedContractId(e.target.value); setClauseText(''); setResult(null); setSelectedClauseIdx(null); }} style={{ width: 280 }}>
          <option value="">— Select a Contract —</option>
          {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Selected clause display (read-only) */}
          {selectedClauseIdx !== null && allClauses[selectedClauseIdx] && (
            <div className="card glass fade-in" style={{ border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} color="var(--accent)" />
                  Selected: {allClauses[selectedClauseIdx].title || allClauses[selectedClauseIdx].type?.replace(/_/g, ' ') || 'Clause'}
                </h3>
                {allClauses[selectedClauseIdx].is_risky && (
                  <span className="badge badge-warning" style={{ fontSize: 10 }}>Risky</span>
                )}
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {allClauses[selectedClauseIdx].text}
              </div>
              {allClauses[selectedClauseIdx].risk_reason && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 11, color: 'var(--text-secondary)' }}>
                  ⚠️ <strong>Risk:</strong> {allClauses[selectedClauseIdx].risk_reason}
                </div>
              )}
            </div>
          )}

          {/* Input area */}
          <div className="card glass">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              {selectedClauseIdx !== null ? 'Clause Text (editable)' : 'Original Clause'}
            </h3>
            <textarea
              className="input"
              placeholder={selectedContractId ? 'Select a clause from the sidebar, or paste one here...' : 'Select a contract first, then pick a clause to rewrite...'}
              style={{ minHeight: 130, resize: 'vertical', lineHeight: 1.6 }}
              value={clauseText}
              onChange={e => setClauseText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{clauseText.length} characters</span>
              <button className="btn btn-primary" onClick={handleNegotiate} disabled={loading || clauseText.trim().length < 10}>
                {loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />}
                {loading ? 'Rewriting...' : 'Rewrite Clause'}
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="card glass" style={{ padding: 40, textAlign: 'center' }}>
              <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Gemini AI is rewriting your clause in a <strong>{tone}</strong> tone...</p>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="card glass fade-in" style={{ border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Rewritten Clause</h3>
                  <span className="badge badge-info" style={{ fontSize: 10, marginTop: 4 }}>Tone: {result.tone_used}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => copyToClipboard(result.rewritten_clause)}>
                  <Copy size={14} /> Copy
                </button>
              </div>
              
              <div style={{ padding: 20, borderRadius: 12, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', marginBottom: 20 }}>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>{result.rewritten_clause}</p>
              </div>

              {result.changes_made?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Key Changes</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.changes_made.map((change, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'start', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={12} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.legal_notes && (
                <div style={{ padding: 12, borderRadius: 8, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  ⚖️ <strong>Legal Note:</strong> {result.legal_notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Tone selector */}
          <div className="card glass">
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Negotiation Tone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TONES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{ 
                    padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer',
                    background: tone === t.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    borderColor: tone === t.id ? 'var(--accent)' : 'var(--border)',
                    color: tone === t.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                    textAlign: 'left', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</span>
                    {tone === t.id && <CheckCircle2 size={14} />}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Extracted clauses from selected contract */}
          {selectedContractId && (
            <div className="card glass">
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                Contract Clauses
                {allClauses.length > 0 && <span style={{ color: 'var(--accent)', marginLeft: 8 }}>({allClauses.length})</span>}
              </h3>

              {loadingClauses ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading clauses...</p>
                </div>
              ) : allClauses.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
                  No clauses extracted from this contract.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {allClauses.map((c, i) => (
                    <button 
                      key={i}
                      onClick={() => handleClauseSelect(c, i)}
                      style={{ 
                        padding: 12, borderRadius: 10,
                        border: `1px solid ${selectedClauseIdx === i ? 'var(--accent)' : c.is_risky ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        background: selectedClauseIdx === i ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        textAlign: 'left', transition: 'all 0.2s',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                          {c.title || c.type?.replace(/_/g, ' ') || `Clause ${i + 1}`}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {c.is_risky && <span className="badge badge-warning" style={{ fontSize: 9 }}>risky</span>}
                          {selectedClauseIdx === i && <CheckCircle2 size={12} color="var(--accent)" />}
                        </div>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>
                        {c.text}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty state — no contract selected */}
          {!selectedContractId && (
            <div className="card glass" style={{ padding: 24, textAlign: 'center' }}>
              <FileText size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Select a contract from the dropdown above to see its extracted clauses. Click any clause to auto-fill it for rewriting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
