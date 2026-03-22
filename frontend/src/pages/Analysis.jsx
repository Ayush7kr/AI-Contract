import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsAPI, analysisAPI } from '../api/client';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis 
} from 'recharts';
import { 
  ArrowLeft, RefreshCw, AlertCircle, Clock, Calendar, 
  ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_COLORS = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

function ScoreGauge({ score, size = 100 }) {
  const color = score >= 75 ? RISK_COLORS.critical : score >= 50 ? RISK_COLORS.high : '#f59e0b';
  const data = [{ value: score, fill: color }];
  
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="85%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.28, fontWeight: 900, color }}>
        {Math.round(score)}
      </div>
    </div>
  );
}

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [expandedClause, setExpandedClause] = useState(null);

  const load = () => {
    setLoading(true);
    contractsAPI.get(id)
      .then(r => setContract(r.data))
      .catch(() => toast.error('Failed to load analysis'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const reanalyze = async () => {
    setAnalyzing(true);
    try {
      await analysisAPI.analyze(id);
      load();
      toast.success('Analysis updated');
    } catch { toast.error('Analysis failed'); }
    finally { setAnalyzing(false); }
  };

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (!contract) return <div className="page-container">Contract not found.</div>;

  const analysis = contract.analysis_json || {};
  const clauses = contract.clauses_json || [];
  const riskyClauses = clauses.filter(c => c.is_risky);

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <button onClick={() => navigate('/contracts')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, cursor: 'pointer', fontSize: 13 }}>
            <ArrowLeft size={16} /> Back to dashboard
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Contract Analysis</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {contract.filename} — Analyzed {new Date(contract.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={reanalyze} disabled={analyzing} style={{ width: '100%', maxWidth: 200 }}>
          {analyzing ? <RefreshCw className="spinner" size={16} /> : <Zap size={16} />} 
          {analyzing ? 'Analyzing...' : 'Refresh AI Analysis'}
        </button>
      </div>

      {/* Overview Card */}
      <div className="card glass" style={{ padding: '32px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
        <ScoreGauge score={contract.risk_score || 0} size={100} />
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Overall Risk Score: {Math.round(contract.risk_score)}/100</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {riskyClauses.filter(c => c.risk_level === 'critical').length} critical • {riskyClauses.filter(c => c.risk_level === 'medium').length} moderate • {clauses.length - riskyClauses.length} safe clauses
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Auto-renewal', 'Liability', 'Non-compete'].map(tag => (
            <span key={tag} className="badge" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)', padding: '6px 14px', fontSize: 12 }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Tactical AI Summary */}
      {analysis.ai_summary && (
        <div className="card glass" style={{ padding: '32px', marginBottom: 24, border: '1px solid var(--border-accent)', background: 'rgba(99, 102, 241, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Zap size={18} color="var(--accent)" />
            <span style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)' }}>Tactical Executive Summary</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 500 }}>
            {analysis.ai_summary}
          </p>
        </div>
      )}

      {/* Critical Alert Card */}
      <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: '16px 24px', background: 'rgba(245, 158, 11, 0.1)', borderBottom: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auto-Renewal Risk Detected</span>
        </div>
        <div style={{ padding: '24px' }}>
          <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                 <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                 <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Renewal Period</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>12-month auto-renewal</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>30 days before renewal</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                 <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                 <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Next Renewal</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>April 7, 2026</div>
              <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 4 }}>$4,500 early termination fee</div>
            </div>
          </div>
          
          <div className="card-sm" style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', border: '1px solid var(--border)' }}>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Time to cancel before auto-renewal:</p>
             <div style={{ display: 'flex', gap: 20 }}>
                <div><span style={{ fontSize: 32, fontWeight: 800 }}>47</span> <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>DAYS</span></div>
                <div><span style={{ fontSize: 32, fontWeight: 800 }}>12</span> <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>HOURS</span></div>
                <div><span style={{ fontSize: 32, fontWeight: 800 }}>34</span> <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>MIN</span></div>
             </div>
          </div>
          
          <div className="grid-2" style={{ gap: 16, marginTop: 24 }}>
             <button className="btn btn-secondary" style={{ justifyContent: 'center' }}>Add Calendar Reminder</button>
             <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Suggest Safer Rewrite</button>
          </div>
        </div>
      </div>

      {/* Clause Section */}
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Clause Breakdown</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {clauses.map((clause, idx) => (
          <div key={idx} className="card glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div 
              onClick={() => setExpandedClause(expandedClause === idx ? null : idx)}
              style={{ padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', minWidth: 40 }}>§{idx + 1}</div>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{clause.type?.replace(/_/g, ' ')}</div>
              {clause.is_risky && <span className={`badge badge-${clause.risk_level}`} style={{ fontSize: 10 }}>{clause.risk_level}</span>}
              {expandedClause === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            {expandedClause === idx && (
              <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{clause.text}</p>
                {clause.is_risky && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: 16, borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>Risk Alert</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{clause.explanation || 'This clause contains potential legal exposure. Immediate review is recommended.'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
