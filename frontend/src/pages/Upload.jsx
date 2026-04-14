import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { contractsAPI } from '../api/client';
import { 
  Upload, CheckCircle, X, 
  Zap, RefreshCw, AlertTriangle, FileText
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

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Invalid document format. PDF, DOCX, or TXT required.');
      return;
    }
    if (accepted[0].size > MAX_MB * 1024 * 1024) {
      toast.error(`Exceeds ${MAX_MB}MB limit.`);
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

    try {
      const { data } = await contractsAPI.upload(formData, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 60));
      });
      // Simulate final processing animation
      let p = 60;
      const interval = setInterval(() => {
        p += 8;
        setProgress(Math.min(p, 100));
        if (p >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          if (data.is_valid_contract) {
            toast.success('Contract analyzed successfully! Redirecting...');
            // Auto-redirect to the dedicated analysis page
            setTimeout(() => {
              navigate(`/contracts/${data.id}`);
            }, 800);
          } else {
            setResult(data);
            toast('Document uploaded but is not a valid contract', { icon: '⚠️' });
          }
        }
      }, 150);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed');
      setUploading(false);
    }
  };

  const isNotContract = result && !result.is_valid_contract;

  return (
    <div className="page-container" style={{ maxWidth: 900, padding: '40px 60px' }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>Upload Document</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 8 }}>Upload a legal contract for AI-powered analysis</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, margin: '0 auto' }}>
        {/* Drop zone */}
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
          {isDragActive ? <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>Release to upload...</p> : (
            <>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{file ? file.name : 'Drop your document here'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drag & drop or click to select PDF, DOCX, TXT'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>Max file size: {MAX_MB}MB</p>
            </>
          )}
          {uploading && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 4, background: 'var(--border)' }}>
              <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.3s ease', boxShadow: '0 0 10px var(--accent)' }} />
            </div>
          )}
        </div>

        {/* Upload button */}
        {!result && (
          <div style={{ display: 'flex', gap: 16 }}>
            <button className="btn btn-primary btn-lg" style={{ flex: 1, height: 56, fontSize: 16, fontWeight: 800, justifyContent: 'center' }} onClick={handleUpload} disabled={!file || uploading}>
              {uploading ? <><RefreshCw className="spinner" size={20} /> Analyzing... {progress}%</> : <><Zap size={20} /> Upload & Analyze</>}
            </button>
            {file && !uploading && <button className="btn btn-secondary btn-lg" style={{ width: 56, padding: 0, justifyContent: 'center' }} onClick={() => setFile(null)}><X size={20} /></button>}
          </div>
        )}

        {/* Invalid contract warning */}
        {isNotContract && (
          <div className="card fade-in" style={{ padding: 32, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <AlertTriangle size={24} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f59e0b' }}>Not a Legal Contract</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>This document does not appear to be a valid legal contract and cannot be analyzed.</p>
              </div>
            </div>
            
            {/* Extracted text preview */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Extracted Content Preview</h4>
              <div style={{ padding: 16, borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', maxHeight: 200, overflowY: 'auto', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {result.raw_text?.substring(0, 1000) || 'No text extracted'}
                {result.raw_text?.length > 1000 && '...'}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => { setFile(null); setResult(null); setUploading(false); setProgress(0); }}>
              <Upload size={16} /> Upload a Different Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
