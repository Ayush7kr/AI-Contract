import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contractsAPI, aiAPI } from '../api/client';
import { 
  ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, 
  MessageSquare, RefreshCw, Send, Shield, Zap, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Negotiate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState(location.state?.contractId?.toString() || '');
  const [clauses, setClauses] = useState(location.state?.clauses || []);
  const [selectedClauseId, setSelectedClauseId] = useState(null);
  const [tone, setTone] = useState('Collaborative');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    contractsAPI.list().then(r => setContracts(r.data)).catch(() => {});
    if (selectedContractId) loadContract(selectedContractId);
  }, [selectedContractId]);

  const loadContract = (id) => {
    contractsAPI.get(id).then(r => {
      setClauses((r.data.clauses_json || []).filter(c => c.is_risky));
    });
  };

  const activeClause = clauses.find(c => c.id === selectedClauseId) || clauses[0];

  const handleSuggest = async () => {
    if (!activeClause) return toast.error('No clause selected');
    setLoading(true);
    try {
      const { data } = await aiAPI.suggest({ 
        clause_text: activeClause.text, 
        clause_type: activeClause.type,
        tone: tone.toLowerCase()
      });
      setSuggestion(data.suggestion);
      toast.success('Negotiation strategy updated');
    } catch { toast.error('Failed to generate suggestion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '32px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
           <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800 }}>Clause Negotiation</h1>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Draft v2.4</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            {contracts.find(c => c.id.toString() === selectedContractId)?.filename || 'Select a contract to begin'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
           <button className="btn btn-secondary">Invite Legal Team</button>
           <button className="btn btn-primary" style={{ background: '#3b82f6', border: 'none' }}>Finalize & Sign</button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          {[
            { label: 'AI Drafting', status: 'done' },
            { label: 'Legal Review', status: 'done' },
            { label: 'Counter-party Review', status: 'active' },
            { label: 'Finalized', status: 'pending' }
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <div style={{ 
                 width: 24, height: 24, borderRadius: '50%', 
                 background: step.status === 'done' ? 'var(--success)' : step.status === 'active' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: step.status === 'pending' ? 'var(--text-muted)' : 'white'
               }}>
                 {step.status === 'done' ? <CheckCircle2 size={14} /> : (i + 1)}
               </div>
               <span style={{ fontSize: 12, fontWeight: 600, color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{step.label}</span>
               {i < 3 && <div style={{ width: 40, height: 1, background: 'var(--border)', margin: '0 12px' }} />}
            </div>
          ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32 }}>
        
        {/* Main Content: Split Comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Original */}
            <div className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Original Clause</div>
              <div style={{ padding: '24px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                {activeClause ? activeClause.text : 'Select a clause from the sidebar to begin analysis.'}
              </div>
            </div>

            {/* Suggested */}
            <div className="card glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ padding: '16px 24px', background: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                <span>Suggested Revision</span>
                {suggestion && <Copy size={14} style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(suggestion); toast.success('Copied!'); }} />}
              </div>
              <div style={{ padding: '24px', fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)' }}>
                {loading ? <div className="spinner" /> : (suggestion || 'Click "Generate Suggestion" to see AI recommended revisions based on your tone.')}
              </div>
            </div>
          </div>

          {/* Action Log / Chat */}
          <div className="card glass" style={{ flex: 1 }}>
             <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Negotiation History</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>AI</div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>LegalAI <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>10:45 AM</span></div>
                       <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>I've analyzed the liability limitations. The current draft exposes us to indirect damages which is significantly above market standard for this contract type.</p>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card-hover)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>JD</div>
                    <div style={{ flex: 1 }}>
                       <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>John Doe (You) <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>11:02 AM</span></div>
                       <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Let's push for a mutual indemnification with a cap at 1.5x annual contract value.</p>
                    </div>
                 </div>
             </div>
             <div style={{ marginTop: 24, position: 'relative' }}>
                <input className="input" placeholder="Type a message or instruction for the AI..." style={{ paddingRight: 100 }} />
                <button className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 8, top: 8, height: 32 }}>Send</button>
             </div>
          </div>
        </div>

        {/* Right Sidebar: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card glass">
             <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Negotiation Tone</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Assertive', 'Collaborative', 'Protective'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTone(t)}
                    style={{ 
                      padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer',
                      background: tone === t ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      borderColor: tone === t ? '#3b82f6' : 'var(--border)',
                      color: tone === t ? '#60a5fa' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    {t}
                    {tone === t && <CheckCircle2 size={14} />}
                  </button>
                ))}
             </div>
             <button className="btn btn-primary" style={{ width: '100%', marginTop: 24, justifyContent: 'center' }} onClick={handleSuggest} disabled={loading}>
               {loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />} 
               Regenerate Suggested Clause
             </button>
          </div>

          <div className="card glass">
             <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Risky Clauses</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {clauses.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => { setSelectedClauseId(c.id); setSuggestion(null); }}
                    style={{ 
                      padding: '16px', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer',
                      background: selectedClauseId === c.id ? 'rgba(255,255,255,0.03)' : 'transparent',
                      borderColor: selectedClauseId === c.id ? 'var(--accent)' : 'var(--border)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                       <span className={`badge badge-${c.risk_level}`} style={{ fontSize: 10 }}>{c.risk_level}</span>
                       <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>§{c.id}</span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.type.replace(/_/g, ' ')}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{c.text}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
