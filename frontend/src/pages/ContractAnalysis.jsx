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
  ShieldAlert, ShieldCheck, Eye, EyeOff, Globe, Sparkles,
  TrendingUp, TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const RISK_COLORS = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#dc2626'
};

const BREAKDOWN_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export default function ContractAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClause, setSelectedClause] = useState(null);
  const [showRawText, setShowRawText] = useState(false);
  const [contractInsights, setContractInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  // Simulator state
  const [showSimulator, setShowSimulator] = useState(false);
  const [simText, setSimText] = useState('');
  const [simResult, setSimResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setLoading(true);
    contractsAPI.get(id)
      .then(r => {
        setContract(r.data);
        setSimText(r.data.raw_text || '');
      })
      .catch(() => {
        toast.error('Failed to load contract');
        navigate('/contracts');
      })
      .finally(() => setLoading(false));

    setLoadingInsights(true);
    aiAPI.contractNews(id)
      .then(r => setContractInsights(r.data.contract_insights || []))
      .catch(() => {})
      .finally(() => setLoadingInsights(false));
  }, [id, navigate]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await aiAPI.simulate({ contract_id: id, modified_text: simText });
      setSimResult(res.data);
      toast.success('Simulation complete');
    } catch {
      toast.error('Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

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

  const breakdownData = contract.risk_breakdown_json ? Object.entries(contract.risk_breakdown_json).map(([name, value]) => ({
    name: name.replace('_risk', '').toUpperCase(),
    value
  })) : [];

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{contract.filename}</h1>
              <span className="badge badge-info" style={{ fontSize: 10, textTransform: 'uppercase' }}>{contract.contract_type || 'General'}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Calendar size={14} /> {new Date(contract.created_at).toLocaleDateString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Layers size={14} /> {contract.page_count} Pages
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Sparkles size={14} color="var(--warning)" /> {contract.confidence_score}% Confidence
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isNotContract && (
            <button 
              className={`btn ${showSimulator ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowSimulator(!showSimulator)}
              style={{ fontSize: 11 }}
            >
              <Activity size={14} /> {showSimulator ? 'Close Simulator' : 'What-If Simulator'}
            </button>
          )}
          <span className={`badge badge-${isNotContract ? 'warning' : contract.status === 'done' ? 'pass' : 'info'}`} style={{ fontSize: 11, padding: '5px 14px' }}>
            {isNotContract ? 'Not a Contract' : contract.status === 'done' ? '✓ Analyzed' : contract.status}
          </span>
        </div>
      </div>

      {/* ───── Simulator Panel ───── */}
      {showSimulator && (
        <div className="card glass fade-in" style={{ padding: 32, marginBottom: 24, border: '1px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Activity size={20} color="var(--accent)" /> Risk Simulator (What-If)
            </h3>
            <div className="badge badge-info">Transient Analysis</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div>
              <textarea
                className="input"
                style={{ height: 400, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, padding: 20 }}
                value={simText}
                onChange={e => setSimText(e.target.value)}
                placeholder="Modify any clause here to see how it affects the risk score..."
              />
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 16 }} 
                disabled={simulating}
                onClick={handleSimulate}
              >
                {simulating ? <div className="spinner" /> : <><Sparkles size={16} /> Re-Run Analysis</>}
              </button>
            </div>
            <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
               {simResult ? (
                 <div className="fade-in">
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <div style={{ fontSize: 48, fontWeight: 900, color: RISK_COLORS[simResult.new_level] }}>{simResult.new_score}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Simulated Risk Score</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: 12 }}>
                       {simResult.new_score > simResult.original_score ? <TrendingUp size={18} color="var(--danger)" /> : <TrendingDown size={18} color="var(--success)" />}
                       <span>Score changed from <strong>{simResult.original_score}</strong> to <strong>{simResult.new_score}</strong></span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{simResult.explanation}</p>
                 </div>
               ) : (
                 <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                   <Activity size={48} style={{ marginBottom: 16 }} />
                   <p style={{ fontSize: 13 }}>Modify the text and click analyze to see how risk levels shift.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* ───── Case 1: Not a Legal Contract ───── */}
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

      {/* ───── Case 2: Valid Contract Analysis ───── */}
      {!isNotContract && !showSimulator && (
        <>
          {/* ───── 2. Risk Overview + Chart Row ───── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 320px', gap: 24, marginBottom: 24 }}>
            {/* Risk Breakdown Chart */}
            <div className="card glass" style={{ padding: 32 }}>
               <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20 }}>Risk Breakdown</h3>
               <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdownData} layout="vertical">
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} style={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                      labelStyle={{ color: 'var(--text-primary)', fontWeight: 800 }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BREAKDOWN_COLORS[index % BREAKDOWN_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
               </div>
            </div>

            {/* Overall Risk Card */}
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
          </div>
          
          {/* ───── AI Summary ───── */}
          <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
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
          </div>

          {/* ───── 4. Key Risk Factors ───── */}
          {(keyRisks.length > 0 || missingClauses.length > 0 || weakClauses.length > 0) && (
            <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="var(--warning)" /> Key Risk Factors
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                {/* Missing Clauses & Smart Suggestions */}
                {missingClauses.length > 0 && (
                  <div style={{ padding: 20, borderRadius: 14, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <XCircle size={16} /> Missing Clauses (Fix with AI)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {missingClauses.map((mc, i) => (
                        <div key={i} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{mc.clause_name}</div>
                            <span className={`badge badge-${mc.importance === 'critical' ? 'violation' : 'warning'}`} style={{ fontSize: 8 }}>{mc.importance}</span>
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>{mc.description}</p>
                          <button 
                            className="btn btn-secondary btn-sm" 
                            style={{ width: '100%', fontSize: 10, height: 32 }}
                            onClick={() => {
                              toast.loading(`Generating template for ${mc.clause_name}...`);
                              aiAPI.getTemplate(mc.clause_name).then(res => {
                                toast.dismiss();
                                setSelectedClause({ 
                                  title: res.data.clause_title, 
                                  text: res.data.suggested_text, 
                                  is_template: true,
                                  reasons: res.data.key_points
                                });
                              }).catch(() => {
                                toast.dismiss();
                                toast.error('Failed to generate template');
                              });
                            }}
                          >
                            <Sparkles size={12} /> Generate Recommended Clause
                          </button>
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
                        <div key={i} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{wc.clause_name}</div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            <strong>Issue:</strong> {wc.issue}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--accent-light)', lineHeight: 1.4, marginTop: 4 }}>
                            💡 {wc.suggestion}
                          </p>
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
                        <div key={i} style={{ padding: 12, borderRadius: 10, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                            {risk.title}
                            <span className={`badge badge-${risk.severity || 'medium'}`} style={{ fontSize: 9, marginLeft: 8 }}>{risk.severity}</span>
                          </div>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{risk.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───── Clause Template Modal (from suggestions) ───── */}
          {selectedClause && selectedClause.is_template && (
            <div className="card glass fade-in" style={{ padding: 32, marginBottom: 24, border: '1px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>AI Generated Clause: {selectedClause.title}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedClause(null)}>Close</button>
              </div>
              <div style={{ padding: 20, borderRadius: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 20, whiteSpace: 'pre-wrap' }}>
                {selectedClause.text}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={() => copyText(selectedClause.text)} style={{ flex: 1 }}><Copy size={16} /> Copy to Clipboard</button>
                <div style={{ flex: 1, padding: '0 12px', borderLeft: '1px solid var(--border)' }}>
                   <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8 }}>KEY PROTECTIONS:</div>
                   {selectedClause.reasons?.map((r, i) => <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>• {r}</div>)}
                </div>
              </div>
            </div>
          )}

          {/* ───── 5. Extracted Clauses & Interactive Highlighter ───── */}
          <div className="card glass" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={20} color="var(--accent)" /> Detailed Clause Analysis
              </h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(239,68,68,0.2)' }} /> Risky</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(16,185,129,0.2)' }} /> Safe</div>
              </div>
            </div>

            <div style={{ 
              maxHeight: 600, overflowY: 'auto', padding: 24, borderRadius: 16, 
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap'
            }}>
               {(() => {
                 let text = contract.raw_text || '';
                 if (!text) return 'No text extracted.';
                 
                 const sortedClauses = [...clauses].filter(c => c.exact_text).sort((a,b) => b.exact_text.length - a.exact_text.length);
                 
                 let elements = [];
                 let lastIndex = 0;
                 
                 sortedClauses.forEach((c, i) => {
                    const idx = text.indexOf(c.exact_text, lastIndex);
                    if (idx !== -1) {
                      if (idx > lastIndex) {
                        elements.push(text.substring(lastIndex, idx));
                      }
                      
                      const highlightColor = c.classification === 'risky' ? 'rgba(239,68,68,0.15)' : c.classification === 'safe' ? 'rgba(16,185,129,0.15)' : 'transparent';
                      const borderColor = c.classification === 'risky' ? 'rgba(239,68,68,0.3)' : c.classification === 'safe' ? 'rgba(16,185,129,0.3)' : 'transparent';
                      
                      elements.push(
                        <span 
                          key={i} 
                          title={c.risk_reason || c.title}
                          style={{ 
                            background: highlightColor, 
                            borderBottom: `2px solid ${borderColor}`,
                            cursor: 'help',
                            transition: 'all 0.2s',
                            padding: '1px 0'
                          }}
                          onClick={() => toast(c.risk_reason || 'Neutral Clause', { icon: c.classification === 'risky' ? '⚠️' : '✅' })}
                        >
                          {c.exact_text}
                        </span>
                      );
                      lastIndex = idx + c.exact_text.length;
                    }
                 });
                 
                 if (lastIndex < text.length) {
                   elements.push(text.substring(lastIndex));
                 }
                 
                 return elements.length > 0 ? elements : text;
               })()}
            </div>
          </div>

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
        </>
      )}

      {/* ───── 7. Raw Text Toggle (Always available at bottom) ───── */}
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
    </div>
  );
}
