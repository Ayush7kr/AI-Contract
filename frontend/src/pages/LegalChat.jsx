import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { contractsAPI, aiAPI } from '../api/client';
import { 
  MessageSquare, Send, Bot, User, 
  Maximize2, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LegalChat() {
  const location = useLocation();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(location.state?.contractId?.toString() || '');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm LexiSure AI, your legal contract assistant. Select a contract from the dropdown above, then ask me anything about it — I'll answer based solely on the document content.\n\nYou can ask me to:\n• Summarize the contract\n• Explain specific clauses\n• Identify obligations and deadlines\n• Analyze risk areas",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { 
    contractsAPI.list().then(r => setContracts(r.data.filter(c => c.is_valid_contract))).catch(() => {}); 
  }, []);
  
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const activeContractObj = contracts.find(c => c.id.toString() === selectedContract);

  const SUGGESTIONS = activeContractObj ? [
    { label: 'Summarize this contract', desc: 'Get a quick overview' },
    { label: 'What are the key risks?', desc: 'Identify potential issues' },
    { label: 'What are the payment terms?', desc: 'Financial obligations' },
    { label: 'When does this contract expire?', desc: 'Termination & renewal' },
  ] : [
    { label: 'What should I look for in an NDA?', desc: 'General guidance' },
    { label: 'Explain indemnification clauses', desc: 'Legal concept' },
    { label: 'Common contract red flags', desc: 'Risk awareness' },
  ];

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data } = await aiAPI.chat({
        question: q,
        contract_id: selectedContract ? Number(selectedContract) : undefined,
      });
      setMessages(m => [...m, {
        role: 'bot',
        text: data.answer,
        source: data.source_contract,
      }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: '❌ Sorry, I encountered an error processing your question. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)', background: 'transparent' }}>
        {/* Header */}
        <div style={{ padding: '16px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>LexiSure AI Assistant</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                 <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                 <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                   Context: {activeContractObj ? activeContractObj.filename : 'No contract selected — general mode'}
                 </span>
              </div>
           </div>
           <div style={{ display: 'flex', gap: 12 }}>
              <select className="input" value={selectedContract} onChange={e => setSelectedContract(e.target.value)} style={{ width: 260, padding: '7px 12px' }}>
                 <option value="">No Contract (General Q&A)</option>
                 {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
              </select>
           </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
           <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                   <div style={{ 
                     width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                     background: msg.role === 'bot' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     border: `1px solid ${msg.role === 'bot' ? 'var(--accent)' : 'var(--border)'}`
                   }}>
                      {msg.role === 'bot' ? <Bot size={18} color="var(--accent)" /> : <User size={18} />}
                   </div>
                   <div style={{ 
                     maxWidth: '75%', padding: '16px 20px', borderRadius: 18,
                     background: msg.role === 'bot' ? 'rgba(255,255,255,0.03)' : 'var(--accent)',
                     color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                     lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-wrap',
                     boxShadow: msg.role === 'user' ? '0 8px 16px -4px rgba(99, 102, 241, 0.3)' : 'none',
                     border: msg.role === 'bot' ? '1px solid var(--border)' : 'none'
                   }}>
                      {msg.text}
                      {msg.source && (
                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FileText size={10} /> Based on: {msg.source}
                        </div>
                      )}
                   </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 16 }}>
                   <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent)' }}>
                      <Bot size={18} color="var(--accent)" />
                   </div>
                   <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 18, display: 'flex', gap: 6, border: '1px solid var(--border)' }}>
                      {[0,1,2].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5, animation: 'pulse-glow 1s infinite', animationDelay: `${n*0.2}s` }} />)}
                   </div>
                </div>
              )}
              <div ref={bottomRef} />
           </div>
        </div>

        {/* Input area */}
        <div style={{ padding: '16px 40px 32px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
           {messages.length <= 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(SUGGESTIONS.length, 4)}, 1fr)`, gap: 10, marginBottom: 20 }}>
                 {SUGGESTIONS.map((s, i) => (
                   <button key={i} onClick={() => send(s.label)} style={{ padding: '14px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
                   </button>
                 ))}
              </div>
           )}
           <div className="card glass" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 24, border: '1px solid var(--border-accent)' }}>
              <input className="input" placeholder={activeContractObj ? `Ask about ${activeContractObj.filename}...` : 'Ask a legal question...'} style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '8px 4px' }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
              <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={loading || !input.trim()} style={{ borderRadius: 16, height: 40, width: 40, minWidth: 40, padding: 0, justifyContent: 'center' }}>
                <Send size={18} />
              </button>
           </div>
        </div>
    </div>
  );
}
