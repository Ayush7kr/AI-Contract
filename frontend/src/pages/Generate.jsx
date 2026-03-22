import { useState } from 'react';
import { 
  FileText, Shield, User, Briefcase, 
  Settings, ChevronRight, Zap, CheckCircle2,
  Download, Copy, RefreshCw, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = ['Type', 'Details', 'Generate', 'Review'];
const CONTRACT_TYPES = [
  { id: 'nda', title: 'Non-Disclosure Agreement', desc: 'Protect confidential information between parties', icon: Shield },
  { id: 'freelancer', title: 'Freelancer Agreement', desc: 'Independent contractor engagement terms', icon: Briefcase },
  { id: 'vendor', title: 'Vendor Agreement', desc: 'Third-party service provider contract', icon: User },
  { id: 'saas', title: 'SaaS Agreement', desc: 'Software-as-a-service subscription terms', icon: Settings },
];

export default function Generate() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleGenerate = () => {
    setLoading(true);
    setStep(2);
    // Mimic AI generation
    setTimeout(() => {
      setResult("# " + selectedType.title + "\n\nThis Agreement is made on [Date] between [Party A] and [Party B]...\n\n1. SCOPE OF SERVICES\n2. CONFIDENTIALITY\n3. INTELLECTUAL PROPERTY\n4. TERMINATION...");
      setLoading(false);
      setStep(3);
      toast.success('Contract generated successfully');
    }, 2000);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1000, padding: '24px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.8px' }}>AI Contract Generator</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Generate legally sound, customized contracts in minutes using tactical AI.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 48, background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 16, border: '1px solid var(--border)' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ 
            flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 12,
            background: step === i ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            color: step === i ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'all 0.3s'
          }}>
            <div style={{ 
              width: 24, height: 24, borderRadius: '50%', background: step >= i ? 'var(--accent)' : 'var(--bg-card-hover)', 
              color: step >= i ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: 12, fontWeight: 800 
            }}>
              {step > i ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{s}</span>
            {i < STEPS.length - 1 && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }} className="fade-in">
          {CONTRACT_TYPES.map(t => (
            <div 
              key={t.id} 
              className="card glass" 
              onClick={() => { setSelectedType(t); setStep(1); }}
              style={{ 
                padding: 32, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s',
                border: '1px solid var(--border)',
              }}
            >
               <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)' }}>
                  <t.icon size={32} />
               </div>
               <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>{t.title}</h3>
               <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="card glass fade-in" style={{ padding: 40 }}>
           <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Contract Parameters</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                 <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Governing Law</label>
                 <select className="input" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <option>Delaware, USA</option>
                    <option>United Kingdom</option>
                    <option>Singapore</option>
                 </select>
              </div>
              <div>
                 <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Key Parties</label>
                 <div className="grid-2" style={{ gap: 16 }}>
                    <input className="input" placeholder="Company Name" style={{ background: 'rgba(255,255,255,0.02)' }} />
                    <input className="input" placeholder="Contractor/Vendor Name" style={{ background: 'rgba(255,255,255,0.02)' }} />
                 </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={handleGenerate}
                style={{ height: 52, justifyContent: 'center', fontSize: 16, fontWeight: 800, marginTop: 12 }}
              >
                 <Zap size={18} /> Initialize AI Protocol
              </button>
           </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '80px 0' }} className="fade-in">
           <RefreshCw size={60} className="spinner" style={{ color: 'var(--accent)', marginBottom: 24 }} />
           <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Synthesizing Clauses</h3>
           <p style={{ color: 'var(--text-secondary)' }}>Our neural engine is generating a legally sound {selectedType?.title}...</p>
        </div>
      )}

      {step === 3 && (
        <div className="fade-in">
           <div className="card glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={18} color="var(--accent)" />
                    <span style={{ fontWeight: 800, fontSize: 14 }}>{selectedType?.title} (Draft 1.0)</span>
                 </div>
                 <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-secondary btn-sm"><Copy size={14} /> Copy</button>
                    <button className="btn btn-primary btn-sm"><Download size={14} /> Download</button>
                 </div>
              </div>
              <div style={{ padding: 40, height: 500, overflowY: 'auto' }}>
                 <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.8, color: 'var(--text-primary)' }}>
                    {result}
                 </pre>
              </div>
           </div>
           
           <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
              <input className="input" placeholder="Ask AI to modify this contract (e.g., 'Make it mutual', 'Add a 30-day notice period')..." style={{ flex: 1, background: 'rgba(255,255,255,0.02)' }} />
              <button className="btn btn-primary" style={{ width: 52, height: 52, justifyContent: 'center', padding: 0 }}><Send size={20} /></button>
           </div>
        </div>
      )}
    </div>
  );
}
