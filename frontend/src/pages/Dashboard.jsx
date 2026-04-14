import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI, aiAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer
} from 'recharts';
import { 
  Upload, FileText, Shield, AlertTriangle, 
  MessageSquare, Building2, Gavel, ChevronRight,
  Globe, Zap, ArrowUpRight
} from 'lucide-react';

const RISK_COLORS = { critical: '#dc2626', high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [legalNews, setLegalNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    contractsAPI.list()
      .then(r => setContracts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    setLoadingNews(true);
    aiAPI.legalNews()
      .then(r => setLegalNews(r.data.news || []))
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, []);

  const validContracts = contracts.filter(c => c.is_valid_contract && c.risk_score !== null);

  const avgRisk = validContracts.length
    ? Math.round(validContracts.reduce((s, c) => s + c.risk_score, 0) / validContracts.length)
    : 0;

  const gaugeData = [{ name: 'Risk', value: avgRisk, fill: avgRisk >= 75 ? '#ef4444' : avgRisk >= 50 ? '#f59e0b' : avgRisk >= 25 ? '#fbbf24' : '#10b981' }];

  // Extract all key risks from analyzed contracts
  const allRisks = validContracts.flatMap(c => 
    (c.analysis_json?.key_risks || []).map(r => ({
      ...r,
      contract: c.filename
    }))
  ).slice(0, 6);

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '100%', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {validContracts.length > 0 
            ? `Analyzing ${validContracts.length} contract${validContracts.length > 1 ? 's' : ''} in your portfolio`
            : 'Upload your first contract to get started with AI analysis'
          }
        </p>
      </div>

      {contracts.length === 0 ? (
        /* Empty state */
        <div className="card glass" style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--accent)' }}>
            <Upload size={32} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>No Contracts Yet</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Upload a legal contract (PDF, DOCX, or TXT) to unlock AI-powered risk analysis, compliance scanning, and intelligent clause negotiation.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/upload')} style={{ margin: '0 auto' }}>
            <Upload size={18} /> Upload Your First Contract
          </button>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* Risk Gauge */}
            <div className="card glass" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 360 }}>
              <div style={{ position: 'relative', height: 220, marginTop: -20 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={gaugeData} startAngle={225} endAngle={-45}>
                    <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -40%)' }}>
                  <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{avgRisk}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Risk Index</div>
                </div>
              </div>
              <div style={{ padding: '0 24px' }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Average risk across {validContracts.length} analyzed contract{validContracts.length !== 1 ? 's' : ''}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: 12 }}>
                    <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: 18 }}>{validContracts.filter(c => c.risk_level === 'low').length}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Low Risk</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(245,158,11,0.1)', borderRadius: 12 }}>
                    <div style={{ color: 'var(--warning)', fontWeight: 700, fontSize: 18 }}>{validContracts.filter(c => c.risk_level === 'medium' || c.risk_level === 'high').length}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Medium+</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>
                    <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 18 }}>{validContracts.filter(c => c.risk_level === 'critical').length}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Critical</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div className="card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 360 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>AI-Generated Insights</h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {validContracts.length > 0 ? validContracts.slice(0, 3).map(c => (
                  <div key={c.id} style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{c.filename}</span>
                      <span className={`badge badge-${c.risk_level || 'low'}`} style={{ fontSize: 10 }}>{c.risk_level}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {c.ai_summary || c.analysis_json?.summary || 'Analysis pending...'}
                    </p>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    No analyzed contracts yet.
                  </div>
                )}
              </div>
            </div>

            {/* Regulatory Intelligence */}
            <div className="card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 360 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Regulatory Intelligence</h3>
                <span className="badge badge-info" style={{ fontSize: 9 }}>Live AI Feed</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loadingNews ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fetching latest legal updates...</p>
                  </div>
                ) : legalNews.length > 0 ? legalNews.map((news, i) => (
                  <div key={i} style={{ marginBottom: 16, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{news.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: news.impact_level === 'High' ? 'var(--danger)' : 'var(--info)', textTransform: 'uppercase' }}>{news.impact_level}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{news.summary}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600 }}>#{news.category}</span>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                         {news.call_to_action} <ArrowUpRight size={10} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 12 }}>
                    No news updates available at the moment.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card glass" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {[
                { label: 'Upload Contract', icon: Upload, path: '/upload', color: 'var(--accent)' },
                { label: 'AI Assistant', icon: MessageSquare, path: '/chat', color: '#10b981' },
                { label: 'Negotiate Clause', icon: Gavel, path: '/negotiate', color: '#f59e0b' },
                { label: 'Compliance Scan', icon: Shield, path: '/compliance', color: '#3b82f6' },
                { label: 'Vendor Intel', icon: Building2, path: '/vendor', color: '#8b5cf6' },
                { label: 'View Contracts', icon: FileText, path: '/contracts', color: '#ec4899' },
              ].map(action => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
                    cursor: 'pointer', color: 'var(--text-primary)',
                    transition: 'all 0.2s', fontSize: 13, fontWeight: 600,
                  }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <span style={{ flex: 1, textAlign: 'left' }}>{action.label}</span>
                  <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
