import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { contractsAPI } from '../api/client';
import { 
  Upload, CheckCircle, X, Eye, 
  Shield, Cpu, Zap, RefreshCw, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_MB = 20;
const ALLOWED = { 
  'application/pdf': ['.pdf'], 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 
  'application/msword': ['.doc'], 
  'text/plain': ['.txt'] 
};

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [protocol, setProtocol] = useState('standard');

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Invalid document format. PDF, DOCX, or TXT required.');
      return;
    }
    if (accepted[0].size > MAX_MB * 1024 * 1024) {
      toast.error(`Exceeds ${MAX_MB}MB extraction limit.`);
      return;
    }
    setFile(accepted[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ALLOWED, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('protocol', protocol);

    try {
      const { data } = await contractsAPI.upload(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 70));
      });
      let p = 70;
      const interval = setInterval(() => {
        p += 5;
        setProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setResult(data);
          toast.success('Vector extraction & risk mapping complete');
        }
      }, 200);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Extraction sequence failed');
      setUploading(false);
    }
  };

  const riskColor = (score) => score >= 75 ? '#ef4444' : score >= 50 ? '#f87171' : score >= 25 ? '#fbbf24' : '#34d399';

  return (
    <div className="page-container" style={{ maxWidth: 900, padding: '40px 60px' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px' }}>Document Intake Protocol</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginTop: 8 }}>Securely inject legal documents for tactical risk intelligence</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            {...getRootProps()}
            className="card glass"
            style={{
              padding: '60px 40px', textAlign: 'center', cursor: 'pointer', position: 'relative',
              borderColor: isDragActive ? 'var(--accent)' : 'var(--border)',
              background: isDragActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.01)',
              overflow: 'hidden'
            }}
          >
            <input {...getInputProps()} />
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent)', border: '1px solid var(--accent)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' }}>
              <Upload size={32} />
            </div>
            {isDragActive ? <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>Release to begin sequence...</p> : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{file ? file.name : 'Inject Document'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Drag & drop or click to select PDF, DOCX, TXT</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>System Capacity: {MAX_MB}MB / document</p>
              </>
            )}
            {uploading && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, background: 'var(--border)' }}>
                 <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.3s ease', boxShadow: '0 0 10px var(--accent)' }} />
              </div>
            )}
          </div>

          {!result && (
             <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-primary btn-lg" style={{ flex: 1, height: 56, fontSize: 16, fontWeight: 800, justifyContent: 'center' }} onClick={handleUpload} disabled={!file || uploading}>
                   {uploading ? <><RefreshCw className="spinner" size={20} /> Processing Vector {progress}%</> : <><Zap size={20} /> Initialize Extraction</>}
                </button>
                {file && !uploading && <button className="btn btn-secondary btn-lg" style={{ width: 56, padding: 0, justifyContent: 'center' }} onClick={() => setFile(null)}><X size={20} /></button>}
             </div>
          )}

          {result && (
            <div className="card glass fade-in" style={{ padding: 40, border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--success)' }}><CheckCircle size={24} color="var(--success)" /></div>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>Analysis Sequence Alpha Complete</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Vector extraction and risk mapping finalized</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                 <div className="card" style={{ padding: 20, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Risk Index</p>
                    <p style={{ fontSize: 32, fontWeight: 900, color: riskColor(result.risk_score) }}>{Math.round(result.risk_score || 0)}%</p>
                 </div>
                 <div className="card" style={{ padding: 20, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Classification</p>
                    <p style={{ fontSize: 24, fontWeight: 900, color: riskColor(result.risk_score) }}>{(result.risk_level || 'low').toUpperCase()}</p>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={() => navigate(`/analysis/${result.id}`)} style={{ flex: 1, height: 48, justifyContent: 'center' }}><Eye size={18} /> Review Tactical Report</button>
                <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); }} style={{ height: 48 }}>New Injection</button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
           <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Select Protocol</h4>
           {[
             { id: 'standard', icon: <Cpu size={18} />, title: 'Standard Neural', desc: 'Fast extraction & core risk audit' },
             { id: 'deep', icon: <Shield size={18} />, title: 'Deep Sentinel', desc: 'Full semantic audit & cross-ref' },
             { id: 'compliance', icon: <Layers size={18} />, title: 'Compliance Scan', desc: 'Regulatory alignment (GDPR/HIPAA)' },
           ].map(p => (
             <div key={p.id} className={`card ${protocol === p.id ? 'glass' : ''}`} style={{ padding: '16px 20px', cursor: 'pointer', border: protocol === p.id ? '1px solid var(--accent)' : '1px solid var(--border)', background: protocol === p.id ? 'var(--accent-glow)' : 'transparent' }} onClick={() => setProtocol(p.id)}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 4 }}>
                   <span style={{ color: protocol === p.id ? 'var(--accent)' : 'var(--text-muted)' }}>{p.icon}</span>
                   <span style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 30 }}>{p.desc}</p>
             </div>
           ))}
           <div className="card glass" style={{ marginTop: 'auto', padding: 20 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                 <Shield size={20} color="var(--accent)" />
                 <span style={{ fontWeight: 800, fontSize: 13 }}>Enterprise Shield</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>All documents are encrypted using AES-256 at rest. Neural processing occurs in an isolated secure sandbox.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
