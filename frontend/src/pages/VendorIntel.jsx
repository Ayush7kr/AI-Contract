import { useState } from 'react';
import { vendorAPI } from '../api/client';
import { 
  Building2, Search, AlertTriangle, Zap, RefreshCw,
  TrendingDown, Scale, Star, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

function RiskCard({ title, icon: Icon, risk }) {
  if (!risk) return null;
  const color = RISK_COLORS[risk.level] || RISK_COLORS.medium;
  return (
    <div className="card glass" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700 }}>{title}</h4>
          <span className={`badge badge-${risk.level}`} style={{ fontSize: 10 }}>{risk.level}</span>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Risk Score</span>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>{risk.score}/100</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${risk.score}%`, background: color, borderRadius: 10 }} />
        </div>
      </div>
      {risk.factors?.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {risk.factors.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'start', fontSize: 12, color: 'var(--text-secondary)' }}>
              <AlertTriangle size={12} style={{ color, flexShrink: 0, marginTop: 2 }} />
              <span>{f}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VendorIntel() {
  const [vendorName, setVendorName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!vendorName.trim()) return toast.error('Enter a company name');
    setLoading(true);
    setResult(null);
    try {
      const { data } = await vendorAPI.analyze({ vendor_name: vendorName });
      setResult(data);
      toast.success('Vendor profile generated');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>Vendor Intelligence</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>AI-powered company risk profiling</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative' }}>
             <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input className="input" placeholder="Enter company name..." style={{ width: 300, paddingLeft: 44 }} value={vendorName} onChange={e => setVendorName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnalyze()} />
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>{loading ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />} {loading ? 'Analyzing...' : 'Analyze'}</button>
        </div>
      </div>

      {loading && (
        <div className="card glass" style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div className="spinner" style={{ width: 48, height: 48, marginBottom: 20 }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Analyzing {vendorName}...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Gemini AI is generating a risk profile</p>
        </div>
      )}

      {!result && !loading && (
        <div className="card glass" style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
           <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 20, opacity: 0.3 }} />
           <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Explore Vendor Ecosystem</h3>
           <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Enter a company name to get an AI-powered risk assessment including financial, legal, and reputation risk.</p>
        </div>
      )}

      {result && !loading && (
        <div className="fade-in">
          {/* Company header */}
          <div className="card glass" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent)', flexShrink: 0 }}>
                <Building2 size={32} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{result.company_name}</h2>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className={`badge badge-${result.overall_risk_level}`}>{result.overall_risk_level} risk</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Trust Score: <strong style={{ color: RISK_COLORS[result.overall_risk_level] || '#f59e0b' }}>{result.trust_score}/100</strong></span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: RISK_COLORS[result.overall_risk_level] || '#f59e0b' }}>{result.trust_score}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Trust Score</div>
              </div>
            </div>
          </div>

          {/* Risk categories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
            <RiskCard title="Financial Risk" icon={TrendingDown} risk={result.financial_risk} />
            <RiskCard title="Legal Risk" icon={Scale} risk={result.legal_risk} />
            <RiskCard title="Reputation Risk" icon={Star} risk={result.reputation_risk} />
          </div>

          {/* Recommendation + Key Considerations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card glass">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>AI Recommendation</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.recommendation}</p>
            </div>
            <div className="card glass">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Key Considerations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(result.key_considerations || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                    <CheckCircle2 size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
