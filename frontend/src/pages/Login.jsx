import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, Shield, Lock, Mail, Github, Chrome, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Access Granted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 460, zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
           <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--accent)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}><Shield size={32} color="var(--accent)" /></div>
           <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 8 }}>LexiSure <span className="gradient-text">AI</span></h1>
           <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>Strategic Contract Intelligence & Risk Protocol</p>
        </div>

        <div className="card glass" style={{ padding: 48, borderRadius: 32, border: '1px solid var(--border-accent)' }}>
           <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>Authenticate to access your workspace</p>
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                 <Mail size={16} style={{ position: 'absolute', left: 16, top: 40, color: 'var(--text-muted)' }} />
                 <label className="label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Identity</label>
                 <input className="input" type="email" placeholder="name@company.com" style={{ paddingLeft: 44, height: 48 }} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ position: 'relative' }}>
                 <Lock size={16} style={{ position: 'absolute', left: 16, top: 40, color: 'var(--text-muted)' }} />
                 <label className="label" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Secure Key</label>
                 <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" style={{ paddingLeft: 44, paddingRight: 44, height: 48 }} value={password} onChange={e => setPassword(e.target.value)} />
                 <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 38, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', height: 48, justifyContent: 'center', fontSize: 15, fontWeight: 700, marginTop: 12 }} disabled={loading}>{loading ? <RefreshCw className="spinner" size={18} /> : <><LogIn size={18} /> Initialize Access</>}</button>
           </form>
           <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Secure Connect</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'center', height: 44, borderRadius: 12 }}><Chrome size={18} /> Google</button>
              <button className="btn btn-secondary" style={{ justifyContent: 'center', height: 44, borderRadius: 12 }}><Github size={18} /> GitHub</button>
           </div>
           <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>New operator? <Link to="/signup" style={{ color: 'var(--accent-light)', fontWeight: 700, textDecoration: 'none' }}>Register Node</Link></p>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Shield size={12} /> SECURE PROTOCOL v4.2.0 · SHA-256 ENCRYPTED</p>
      </div>
    </div>
  );
}
