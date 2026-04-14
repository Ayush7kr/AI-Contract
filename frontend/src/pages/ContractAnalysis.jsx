/**
 * ContractAnalysis — Dedicated analysis page for a single contract (/contracts/:id)
 * Shows header, risk overview, AI summary, key risk factors, extracted clauses, and action buttons.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsAPI, aiAPI } from '../api/client';
import {
  ArrowLeft, FileText, Calendar, Clock, Shield, Gavel,
  MessageSquare, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, Copy, Layers, Activity, AlertOctagon,
  ShieldAlert, ShieldCheck, Eye, EyeOff, Globe, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const RISK_COLORS = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626'
};

const IMPORTANCE_COLORS = {
  critical: '#ef4444', recommended: '#f59e0b', optional: '#3b82f6'
};

export default function ContractAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [contractInsights, setContractInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    setLoading(true);
    contractsAPI.get(id)
      .then(r => setContract(r.data))
      .catch(() => {
        toast.error('Failed to load contract');
        navigate('/contracts');
      })
      .finally(() => setLoading(false));

    // Fetch contract insights
    setLoadingInsights(true);
    aiAPI.contractNews(id)
      .then(r => setContractInsights(r.data.contract_insights || []))
      .catch(() => {})
      .finally(() => setLoadingInsights(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="spinner" style={{ width: 48, height: 48 }} />
    </div>
  );

  if (!contract) return null;

  const analysis = contract.analysis_json || {};
  const clauses = contract.clauses_json || analysis.key_clauses || [];
  const keyRisks = analysis.key_risks || [];
  const missingClauses = analysis.missing_clauses || [];
  const weakClauses = analysis.weak_clauses || [];
  const riskExplanation = analysis.risk_explanation || '';
  const riskColor = RISK_COLORS[contract.risk_level] || '#f59e0b';
  const isNotContract = !contract.is_valid_contract;

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="page-container" style={{ maxWidth: 1200, padding: '32px 48px' }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/contracts')}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          cursor: 'pointer', fontSize: 13, transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Contracts
      </button>

      {/* ───── 1. Header ───── */}
      <div className="card glass" style={{ padding: '24px 32px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: isNotContract ? 'rgba(245,158,11,0.1)' : 'var(--accent-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${isNotContract ? 'rgba(245,158,11,0.3)' : 'var(--accent)'}`,
            color: isNotContract ? '#f59e0b' : 'var(--accent)',
            flexShrink: 0,
          }}>
            {isNotContract ? <AlertTriangle size={28} /> : <FileText size={28} />}
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 6 }}>{contract.filename}</h1>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Calendar size={14} /> {new Date(contract.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Layers size={14} /> {contract.page_count} {contract.page_count === 1 ? 'page' : 'pages'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Activity size={14} /> {contract.word_count?.toLocaleString()} words
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge badge-${isNotContract ? 'warning' : contract.status === 'done' ? 'pass' : 'info'}`} style={{ fontSize: 11, padding: '5px 14px' }}>
            {isNotContract ? 'Not a Contract' : contract.status === 'done' ? '✓ Analyzed' : contract.status}
          </span>
        </div>
      </div>

      {/* ───── Not a Contract Warning ───── */}
      {isNotContract && (
        <div className="card fade-in" style={{ padding: 32, marginBottom: 24, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <AlertOctagon size={28} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>Not a Legal Contract</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
                This document does not appear to be a legal contract and cannot be analyzed.
              </p>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Extracted Content</h4>
            <div style={{
              padding: 16, borderRadius: 10, background: 'var(--bg-input)',
              border: '1px solid var(--border)', maxHeight: 300, overflowY: 'auto',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap'
            }}>
              {contract.raw_text?.substring(0, 2000) || 'No text extracted'}
              {contract.raw_text?.length > 2000 && '...'}
            </div>
          </div>
        </div>
      )}

      {/* ───── Valid Contract Analysis ───── */}
      {!isNotContract && (
        <>
          {/* ───── 2. Risk Overview + AI Summary Row ───── */}
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, marginBottom: 24 }}>
            {/* Risk Card */}
            <div className="card glass" style={{ padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: `conic-gradient(${riskColor} ${(contract.risk_score || 0) * 3.6}deg, var(--bg-input) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20, boxShadow: `0 0 30px ${riskColor}20`,
              }}>
                <div style={{
                  width: 105, height: 105, borderRadius: '50%',
                  background: 'var(--bg-card)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: riskColor, lineHeight: 1 }}>
                    {Math.round(contract.risk_score || 0)}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                    Risk Score
                  </div>
                </div>
              </div>
              <span className={`badge badge-${contract.risk_level || 'low'}`} style={{ fontSize: 12, padding: '5px 16px', marginBottom: 12 }}>
                {(contract.risk_level || 'low').toUpperCase()} RISK
              </span>
              {riskExplanation && (
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 8 }}>
                  {riskExplanation}
                </p>
              )}
            </div>

            {/* AI Summary */}
            <div className="card glass" style={{ padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--accent)',
                }}>
                  <MessageSquare size={18} color="var(--accent)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>AI Summary</h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                {contract.ai_summary || analysis.summary || 'No summary available.'}
              </p>

              {/* Quick Stats */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <div style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clauses: </span>
                  <span style={{ fontWeight: 700 }}>{clauses.length}</span>
                </div>
                <div style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Risks: </span>
                  <span style={{ fontWeight: 700, color: keyRisks.length > 0 ? 'var(--warning)' : 'var(--success)' }}>{keyRisks.length}</span>
                </div>
                <div style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Missing: </span>
                  <span style={{ fontWeight: 700, color: missingClauses.length > 0 ? 'var(--danger)' : 'var(--success)' }}>{missingClauses.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ───── 4. Key Risk Factors ───── */}
          {(keyRisks.length > 0 || missingClauses.length > 0 || weakClauses.length > 0) && (
            <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="var(--warning)" /> Key Risk Factors
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Missing Clauses */}
                {missingClauses.length > 0 && (
                  <div style={{ padding: 20, borderRadius: 14, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={16} /> Missing Clauses
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {missingClauses.map((mc, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                            background: IMPORTANCE_COLORS[mc.importance] || '#f59e0b'
                          }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                              {mc.clause_name}
                              <span className={`badge badge-${mc.importance === 'critical' ? 'violation' : mc.importance === 'recommended' ? 'warning' : 'info'}`} style={{ fontSize: 9, marginLeft: 8 }}>{mc.importance}</span>
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{mc.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weak Clauses */}
                {weakClauses.length > 0 && (
                  <div style={{ padding: 20, borderRadius: 14, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertTriangle size={16} /> Weak Clauses
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {weakClauses.map((wc, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6, background: '#f59e0b' }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{wc.clause_name}</div>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                              <strong>Issue:</strong> {wc.issue}
                            </p>
                            <p style={{ fontSize: 11, color: 'var(--accent-light)', lineHeight: 1.4, marginTop: 2 }}>
                              💡 {wc.suggestion}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legal Risks */}
                {keyRisks.length > 0 && (
                  <div style={{ padding: 20, borderRadius: 14, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.12)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--info)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={16} /> Legal Risks
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {keyRisks.map((risk, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                            background: RISK_COLORS[risk.severity] || '#f59e0b'
                          }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                              {risk.title}
                              <span className={`badge badge-${risk.severity || 'medium'}`} style={{ fontSize: 9, marginLeft: 8 }}>{risk.severity}</span>
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{risk.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───── 4.5 Regulatory Intelligence (Specific to Contract) ───── */}
          <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Globe size={20} color="var(--info)" /> Regulatory Intelligence
              </h3>
              <span className="badge badge-info" style={{ fontSize: 9 }}>Contract-Specific Analysis</span>
            </div>

            {loadingInsights ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Analyzing regulatory impact for this agreement...</p>
              </div>
            ) : contractInsights.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                {contractInsights.map((insight, i) => (
                  <div key={i} className="fade-in" style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 10px', background: insight.risk_level === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)', fontSize: 9, fontWeight: 800, color: insight.risk_level === 'High' ? 'var(--danger)' : 'var(--info)', borderRadius: '0 0 0 12px', textTransform: 'uppercase' }}>
                      {insight.risk_level} Impact
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{insight.category}</div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, lineHeight: 1.4 }}>{insight.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{insight.impact_on_contract}</p>
                    <div style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-primary)', display: 'flex', gap: 8, alignItems: 'start' }}>
                      <Sparkles size={14} color="var(--warning)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span><strong>Recommendation:</strong> {insight.suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', borderRadius: 16, border: '1px dashed var(--border)' }}>
                 <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No specific regulatory impacts found for this contract type.</p>
              </div>
            )}
          </div>

          {/* ───── 5. Extracted Clauses ───── */}
          {clauses.length > 0 && (
            <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck size={20} color="var(--accent)" /> Extracted Clauses
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>({clauses.length})</span>
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
                {clauses.map((clause, i) => {
                  const isSelected = selectedClause === i;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedClause(isSelected ? null : i)}
                      style={{
                        padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                        background: isSelected ? 'var(--accent-glow)' : 'var(--bg-input)',
                        border: `1px solid ${isSelected ? 'var(--accent)' : clause.is_risky ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'capitalize' }}>
                          {clause.title || clause.type?.replace(/_/g, ' ') || `Clause ${i + 1}`}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {clause.is_risky && <span className="badge badge-warning" style={{ fontSize: 9 }}>Risky</span>}
                          <ChevronRight size={14} style={{
                            transform: isSelected ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s', color: 'var(--text-muted)'
                          }} />
                        </div>
                      </div>

                      {/* Collapsed: Show truncated text */}
                      {!isSelected && (
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                          {clause.text}
                        </p>
                      )}

                      {/* Expanded: full detail */}
                      {isSelected && (
                        <div className="fade-in">
                          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
                            {clause.text}
                          </p>
                          {clause.risk_reason && (
                            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 10 }}>
                              ⚠️ <strong>Risk:</strong> {clause.risk_reason}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => { e.stopPropagation(); copyText(clause.text); }}
                              style={{ fontSize: 11 }}
                            >
                              <Copy size={12} /> Copy
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/negotiate', { state: { contractId: contract.id, clauseText: clause.text, clauseType: clause.title || clause.type } });
                              }}
                              style={{ fontSize: 11 }}
                            >
                              <Gavel size={12} /> Negotiate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───── 6. Action Buttons ───── */}
          <div className="card glass" style={{ padding: '20px 32px', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/negotiate', { state: { contractId: contract.id } })}
                style={{ flex: 1, minWidth: 180, height: 52, justifyContent: 'center', fontSize: 14 }}
              >
                <Gavel size={18} /> Negotiate Clause
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/compliance', { state: { contractId: contract.id } })}
                style={{ flex: 1, minWidth: 180, height: 52, justifyContent: 'center', fontSize: 14 }}
              >
                <Shield size={18} /> Run Compliance Scan
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/chat', { state: { contractId: contract.id } })}
                style={{ flex: 1, minWidth: 180, height: 52, justifyContent: 'center', fontSize: 14 }}
              >
                <MessageSquare size={18} /> Ask AI
              </button>
            </div>
          </div>

          {/* ───── Raw Text Toggle ───── */}
          <div className="card glass" style={{ padding: '20px 32px' }}>
            <button
              onClick={() => setShowRawText(!showRawText)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                gap: 8, fontSize: 13, fontWeight: 600, transition: 'color 0.2s',
              }}
            >
              {showRawText ? <EyeOff size={16} /> : <Eye size={16} />}
              {showRawText ? 'Hide' : 'Show'} Extracted Text
            </button>
            {showRawText && (
              <div className="fade-in" style={{
                marginTop: 16, padding: 16, borderRadius: 10,
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                maxHeight: 400, overflowY: 'auto', fontSize: 12,
                color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {contract.raw_text || 'No text available'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
