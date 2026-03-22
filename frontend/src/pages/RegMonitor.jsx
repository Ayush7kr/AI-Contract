import { useState } from 'react';
import { 
  Shield, Globe, AlertCircle, Search, 
  TrendingDown, FileCheck, ExternalLink,
  Filter, Calendar, Info, CheckCircle2
} from 'lucide-react';

const UPDATES = [
  { id: 1, title: 'Digital Personal Data Protection Act — Amendment', jurisdiction: 'India', date: 'Feb 20, 2026', severity: 'critical', contracts: 3, desc: 'New consent requirements for cross-border data transfers effective March 15.' },
  { id: 2, title: 'EU AI Act — Phase 2 Enforcement', jurisdiction: 'European Union', date: 'Feb 18, 2026', severity: 'critical', contracts: 2, desc: 'AI liability provisions now enforceable. Contracts involving AI must include transparency disclosures.' },
  { id: 3, title: 'Consumer Protection Directive — Update', jurisdiction: 'United Kingdom', date: 'Feb 15, 2026', severity: 'warning', contracts: 5, desc: 'Trial periods for subscription boxes now limited to 14 days without explicit opt-in.' },
  { id: 4, title: 'Commercial Rent Tax Reform', jurisdiction: 'US — New York', date: 'Feb 12, 2026', severity: 'warning', contracts: 1, desc: 'Incremental tax changes for commercial leases over $250k annual value.' },
  { id: 5, title: 'Standard Contractual Clauses (SCCs) — New Annex', jurisdiction: 'International', date: 'Feb 10, 1026', severity: 'info', contracts: 8, desc: 'Updated annexures for data processing agreements outside the EEA.' },
];

export default function RegMonitor() {
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '24px' }}>
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Shield size={24} color="var(--accent)" />
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px' }}>Regulation Monitor</h1>
           </div>
           <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Monitoring global legal changes and assessing contract compliance in real time.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 500 }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
              <input className="input" placeholder="Search laws..." style={{ width: '100%', paddingLeft: 40, height: 44, background: 'rgba(255,255,255,0.02)' }} />
           </div>
           <button className="btn btn-secondary" style={{ height: 44 }}><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className="grid-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
         {[ 
           { label: 'Active Alerts', val: '5', icon: AlertCircle, color: '#ef4444' },
           { label: 'Critical Updates', val: '2', icon: Shield, color: 'var(--accent)' },
           { label: 'Compliance Index', val: '68%', icon: FileCheck, color: '#10b981' },
           { label: 'Jurisdictions', val: '12', icon: Globe, color: '#f59e0b' }
         ].map(s => (
           <div key={s.label} className="card glass" style={{ padding: 24, textAlign: 'center' }}>
              <s.icon size={20} style={{ color: s.color, marginBottom: 16 }} />
              <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
           </div>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
         <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Live Update Feed</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {UPDATES.map(u => (
                 <div 
                   key={u.id} 
                   className="card glass" 
                   onClick={() => setSelectedUpdate(u)}
                   style={{ 
                     padding: 24, cursor: 'pointer', transition: 'all 0.2s', 
                     border: selectedUpdate?.id === u.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                     background: selectedUpdate?.id === u.id ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)'
                   }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={`badge badge-${u.severity}`} style={{ fontSize: 9 }}>{u.severity}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.jurisdiction}</span>
                       </div>
                       <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.date}</span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{u.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>{u.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                       <FileCheck size={14} /> {u.contracts} contracts affected
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="card glass" style={{ position: 'sticky', top: 100, padding: 32, height: 'fit-content' }}>
            {selectedUpdate ? (
              <div className="fade-in">
                 <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Impact Analysis</h3>
                 <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>Detailed evaluation of how the {selectedUpdate.title} affects your current legal portfolio.</p>
                 
                 <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>Remediation Required</div>
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                       <li style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', gap: 10 }}><CheckCircle2 size={16} color="#10b981" /> Update privacy policies</li>
                       <li style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', gap: 10 }}><CheckCircle2 size={16} color="#10b981" /> Re-trigger consent emails</li>
                       <li style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', gap: 10 }}><CheckCircle2 size={16} color="#10b981" /> Add Annex A-4 to 3 contracts</li>
                    </ul>
                 </div>

                 <button className="btn btn-primary" style={{ width: '100%', height: 48, justifyContent: 'center' }}>Automate Remediation</button>
                 <button className="btn btn-secondary" style={{ width: '100%', height: 48, justifyContent: 'center', marginTop: 12 }}>Assign to Legal Team</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                 <Info size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.5 }} />
                 <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Select a regulation update to see impact analysis and required actions.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
