import { useState, useEffect, useRef } from 'react';
import { contractsAPI, aiAPI } from '../api/client';
import { 
  MessageSquare, Send, Bot, User, Paperclip, 
  Plus, Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LegalChat() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm your AI Legal Assistant. I've indexed your contracts and I'm ready to help you analyze risks, clarify clauses, or draft amendments. How can I assist you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { contractsAPI.list().then(r => setContracts(r.data)).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const SUGGESTIONS = [
    { label: 'Analyze Clause 8.2', desc: 'Liability limitations' },
    { label: 'Summarize Liability', desc: 'Key exposure areas' },
    { label: 'Draft Amendment', desc: 'Termination terms' },
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
      }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: '❌ Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const activeContractObj = contracts.find(c => c.id.toString() === selectedContract);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 40px)', background: 'transparent' }}>
      <div style={{ borderRight: '1px solid var(--border)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 32, gap: 8 }}>
            <Plus size={16} /> New Consultation
          </button>
          <div style={{ flex: 1, overflowY: 'auto' }}>
             <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Today</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['Liability analysis for MSA', 'GDPR Clause review product', 'Vendor Risk - Acme Corp'].map((t, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 8, fontSize: 13, color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)', background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                     <MessageSquare size={14} style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }} />
                     <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span>
                  </div>
                ))}
             </div>
          </div>
          <div className="card glass" style={{ marginTop: 'auto', padding: 12 }}>
             <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>LexiSure Pro AI <span style={{ color: 'var(--accent-light)' }}>v4.2</span></p>
          </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>LexiSure AI Assistant</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                   <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Context: {activeContractObj ? activeContractObj.filename : 'General Counsel'}</span>
                </div>
             </div>
             <div style={{ display: 'flex', gap: 12 }}>
                <select className="input" value={selectedContract} onChange={e => setSelectedContract(e.target.value)} style={{ width: 220, padding: '7px 12px' }}>
                   <option value="">Global Context</option>
                   {contracts.map(c => <option key={c.id} value={c.id}>{c.filename}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm"><Maximize2 size={14} /></button>
             </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
             <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                     <div style={{ 
                       width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                       background: msg.role === 'bot' ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       border: `1px solid ${msg.role === 'bot' ? 'var(--accent)' : 'var(--border)'}`
                     }}>
                        {msg.role === 'bot' ? <Bot size={20} color="var(--accent)" /> : <User size={20} />}
                     </div>
                     <div style={{ 
                       maxWidth: '70%', padding: '20px 24px', borderRadius: 20,
                       background: msg.role === 'bot' ? 'rgba(255,255,255,0.03)' : 'var(--accent)',
                       color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                       lineHeight: 1.6, fontSize: 15,
                       boxShadow: msg.role === 'user' ? '0 10px 20px -5px rgba(99, 102, 241, 0.3)' : 'none',
                       border: msg.role === 'bot' ? '1px solid var(--border)' : 'none'
                     }}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: 20 }}>
                     <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent)' }}>
                        <Bot size={20} color="var(--accent)" />
                     </div>
                     <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, display: 'flex', gap: 6, border: '1px solid var(--border)' }}>
                        {[0,1,2].map(n => <div key={n} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', opacity: 0.5, animation: 'pulse-glow 1s infinite', animationDelay: `${n*0.2}s` }} />)}
                     </div>
                  </div>
                )}
                <div ref={bottomRef} />
             </div>
          </div>

          <div style={{ padding: '20px 40px 40px', maxWidth: '880px', margin: '0 auto', width: '100%' }}>
             {messages.length <= 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                   {SUGGESTIONS.map((s, i) => (
                     <button key={i} onClick={() => send(s.label)} style={{ padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', textAlign: 'left', cursor: 'pointer' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.desc}</div>
                     </button>
                   ))}
                </div>
             )}
             <div className="card glass" style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 24, border: '1px solid var(--border-accent)' }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: 8, borderRadius: '50%', minWidth: 40, height: 40 }}><Paperclip size={18} /></button>
                <input className="input" placeholder="Ask a legal question or request an analysis..." style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()} />
                <button className="btn btn-primary btn-sm" onClick={() => send()} disabled={loading || !input.trim()} style={{ borderRadius: 16, height: 40, width: 40, minWidth: 40, padding: 0, justifyContent: 'center' }}>
                  <Send size={18} />
                </button>
             </div>
          </div>
      </div>
    </div>
  );
}
