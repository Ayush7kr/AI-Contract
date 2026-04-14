import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, Activity, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ROUTE_LABELS = {
  '/dashboard': 'Command Center',
  '/upload': 'Document Intake',
  '/contracts': 'Intelligence Library',
  '/negotiate': 'Clause Negotiation',
  '/compliance': 'Compliance Hub',
  '/litigation': 'Litigation Risk',
  '/obligations': 'Commitment Protocol',
  '/compare': 'Neural Comparison',
  '/vendor': 'Vendor Intel',
  '/monitoring': 'Risk Ops',
  '/chat': 'AI Assistant',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isLight = theme === 'light';

  // Dynamic route label — supports /contracts/:id
  let pageTitle = ROUTE_LABELS[location.pathname];
  if (!pageTitle) {
    if (location.pathname.match(/^\/contracts\/\d+$/)) {
      pageTitle = 'Contract Analysis';
    } else if (location.pathname.startsWith('/analysis')) {
      pageTitle = 'Neural Analysis';
    } else {
      pageTitle = 'LexiSure AI';
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      height: 72,
      background: isLight ? 'rgba(249, 250, 251, 0.85)' : 'rgba(10, 11, 14, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <button
        onClick={onMenuClick}
        style={{
          background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
          cursor: 'pointer', color: 'var(--text-secondary)',
          width: 40, height: 40, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        <Menu size={20} />
      </button>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
          {pageTitle}
        </h1>
        <div style={{ width: 1, height: 20, background: isLight ? '#E5E7EB' : 'var(--border)' }} className="mobile-hide" />
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
           <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
           <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>System Live</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={toggleTheme}
          className="mobile-hide"
          style={{
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
            borderRadius: 12, width: 40, height: 40, cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NavLink
          to="/monitoring"
          className="mobile-hide"
          style={{
            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
            borderRadius: 12, width: 40, height: 40, cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', textDecoration: 'none',
          }}
        >
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, background: '#ef4444', borderRadius: '50%', border: `1.5px solid ${isLight ? '#F9FAFB' : '#0a0b0e'}` }} />
        </NavLink>

        <div style={{ width: 1, height: 24, background: isLight ? '#E5E7EB' : 'var(--border)', margin: '0 4px' }} className="mobile-hide" />

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
              borderRadius: 14, padding: '4px 12px', cursor: 'pointer',
              color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8,
              height: 40, transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'white', fontWeight: 900, boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
            }}>
              {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 700 }} className="mobile-hide">
              {user?.full_name || user?.email?.split('@')[0]}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          </button>

          {dropdownOpen && (
            <div className="card fade-in" style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 12,
              padding: 12, minWidth: 200, zIndex: 1000,
              border: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
              background: isLight ? '#ffffff' : 'rgba(15, 16, 20, 0.98)',
              backdropFilter: 'blur(30px)',
              boxShadow: isLight ? '0 8px 24px rgba(0,0,0,0.12)' : '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user?.full_name || 'Protocol User'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
                    <Activity size={14} /> System Profile
                 </button>
                 <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 8, fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
                    <Shield size={14} /> Security Keys
                 </button>
                 <div style={{ height: 1, background: isLight ? '#E5E7EB' : 'var(--border)', margin: '4px 0' }} />
                 <button
                   onClick={handleLogout}
                   style={{
                     width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                     padding: '8px 12px', background: isLight ? 'rgba(220,38,38,0.04)' : 'rgba(239,68,68,0.05)', border: 'none',
                     color: '#ef4444', cursor: 'pointer', borderRadius: 8,
                     fontSize: 12, fontWeight: 700, textAlign: 'left',
                   }}
                 >
                   <LogOut size={14} />
                   Deactivate Session
                 </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {dropdownOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setDropdownOpen(false)} />
      )}
    </header>
  );
}
