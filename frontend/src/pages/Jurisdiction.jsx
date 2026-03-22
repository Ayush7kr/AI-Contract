import { useState } from 'react';
import { 
  Building2, Globe, AlertTriangle, Shield, 
  MapPin, ChevronRight, Activity, TrendingUp
} from 'lucide-react';

const JURISDICTIONS = [
  { id: 'US-CA', name: 'United States — California', risk: 78, type: 'High Risk', desc: 'Plaintiff-friendly jurisdiction. Strong consumer protections, expansive labor laws. High litigation rates.', enforcement: 'Strong', classification: 'High' },
  { id: 'UK', name: 'United Kingdom', risk: 42, type: 'Medium Risk', desc: 'Balanced legal framework. Predictable court system with efficient enforcement mechanisms.', enforcement: 'Very Strong', classification: 'Medium' },
  { id: 'SG', name: 'Singapore', risk: 22, type: 'Low Risk', desc: 'Highly business-friendly. Efficient dispute resolution via SIAC. Very low corruption index.', enforcement: 'Excellent', classification: 'Low' },
  { id: 'IN', name: 'India', risk: 65, type: 'High Risk', desc: 'Complex regulatory environment. Significant judicial backlog leads to long litigation cycles.', enforcement: 'Moderate', classification: 'High' },
  { id: 'DE', name: 'Germany', risk: 35, type: 'Medium Risk', desc: 'Civil law system. Strong focus on data privacy (GDPR) and rigid contractual structures.', enforcement: 'Strong', classification: 'Medium' },
  { id: 'US-DE', name: 'United States — Delaware', risk: 30, type: 'Low Risk', desc: 'The gold standard for corporate law. Specialized Chancery Court provides high predictability.', enforcement: 'Excellent', classification: 'Low' },
  { id: 'BR', name: 'Brazil', risk: 72, type: 'High Risk', desc: 'Highly bureaucratic legal system with protective labor courts and complex tax litigation.', enforcement: 'Moderate', classification: 'High' },
  { id: 'AE', name: 'UAE — Dubai (DIFC)', risk: 28, type: 'Low Risk', desc: 'English-language common law courts. Very efficient for international commercial disputes.', enforcement: 'Strong', classification: 'Low' },
];

export default function Jurisdiction() {
  const [selected, setSelected] = useState(JURISDICTIONS[0]);

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '24px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
           <Globe size={24} color="var(--accent)" />
           <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.8px' }}>Jurisdiction Risk Map</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Analyze legal enforcement risk and litigation trends by jurisdiction for your contracts.</p>
      </div>

      <div className="card" style={{ background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)', padding: '16px 24px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
        <AlertTriangle size={20} color="var(--warning)" />
        <div style={{ fontSize: 14 }}>
           Your current contract is governed by: <span style={{ fontWeight: 800, color: 'var(--warning)' }}>{selected.name}</span>
           <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>— This is a {selected.type.toLowerCase()} with elevated litigation exposure.</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Jurisdiction Nodes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {JURISDICTIONS.map(j => (
              <div 
                key={j.id} 
                className="card glass" 
                onClick={() => setSelected(j)}
                style={{ 
                  padding: 20, cursor: 'pointer', 
                  border: selected.id === j.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: selected.id === j.id ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
                  position: 'relative'
                }}
              >
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: j.risk > 60 ? '#ef4444' : j.risk > 30 ? '#f59e0b' : '#10b981' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{j.id}</span>
                 </div>
                 <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{j.name}</h4>
                 <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Risk: {j.risk}%</div>
                 {selected.id === j.id && (
                   <div style={{ position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                 )}
              </div>
            ))}
          </div>
        </div>

        <div className="card glass" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
           <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 20px' }}>
                 <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="64" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle 
                      cx="70" cy="70" r="64" fill="none" stroke={selected.risk > 60 ? '#ef4444' : '#10b981'} 
                      strokeWidth="8" strokeDasharray={`${selected.risk * 4}, 400`} strokeLinecap="round" transform="rotate(-90 70 70)"
                    />
                 </svg>
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: 'var(--text-primary)' }}>
                    {selected.risk}
                 </div>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selected.name}</h2>
              <span className="badge" style={{ background: selected.risk > 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: selected.risk > 60 ? '#ef4444' : '#10b981' }}>{selected.type}</span>
           </div>

           <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>{selected.desc}</p>

           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enforcement</span>
                 <span style={{ fontSize: 12, fontWeight: 700 }}>{selected.enforcement}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Risk Score</span>
                 <span style={{ fontSize: 12, fontWeight: 700 }}>{selected.risk}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                 <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Classification</span>
                 <span style={{ fontSize: 12, fontWeight: 700 }}>{selected.classification}</span>
              </div>
           </div>

           <div className="card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: 16 }}>
              <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#f87171' }}>
                 <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                 <p>Consider negotiating a change to a more business-friendly jurisdiction like Delaware (Court of Chancery) or Singapore.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
