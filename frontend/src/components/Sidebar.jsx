/**
 * Sidebar Navigation — 7 core platform sections with icons and active states.
 * Light theme: soft shadow, smooth hover transitions, accent-highlighted active item.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Shield,
  Building2, MessageSquare, Gavel, X, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'OVERVIEW' },
  { path: '/upload', label: 'Upload Document', icon: Upload, group: 'CONTRACTS' },
  { path: '/contracts', label: 'My Contracts', icon: FileText, group: 'CONTRACTS' },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare, group: 'AI TOOLS' },
  { path: '/negotiate', label: 'Clause Negotiation', icon: Gavel, group: 'AI TOOLS' },
  { path: '/compliance', label: 'Compliance Scan', icon: Shield, group: 'AI TOOLS' },
  { path: '/vendor', label: 'Vendor Intelligence', icon: Building2, group: 'AI TOOLS' },
];

const GROUPS = ['OVERVIEW', 'CONTRACTS', 'AI TOOLS'];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const isLight = theme === 'light';

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {!isDesktop && open && (
        <div
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.5)', 
            zIndex: 90, 
            transition: 'opacity 0.3s ease'
          }}
          onClick={onClose}
        />
      )}

      <aside style={{
        width: 280,
        background: 'var(--bg-sidebar)',
        borderRight: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transform: open ? 'translateX(0)' : 'translateX(-280px)',
        boxShadow: isLight ? '2px 0 16px rgba(0, 0, 0, 0.06)' : 'none',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px', borderBottom: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`, minWidth: 280, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--gradient-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: 'white',
              boxShadow: isLight ? '0 4px 12px rgba(124, 92, 255, 0.25)' : '0 8px 16px rgba(99,102,241,0.2)',
            }}>L</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Lexi<span style={{ color: 'var(--accent)' }}>Sure</span>
              <span style={{ 
                fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                background: 'var(--accent)', color: 'white', marginLeft: 8,
                verticalAlign: 'middle', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>Pro</span>
            </div>
          </div>
          <button className="mobile-only" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '20px 14px', minWidth: 280 }}>
          {GROUPS.map(group => {
            const items = NAV_ITEMS.filter(i => i.group === group);
            return (
              <div key={group} style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  padding: '0 16px', marginBottom: 12, opacity: 0.6
                }}>{group}</div>
                {items.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
                  return (
                    <NavLink
                      key={path}
                      to={path}
                      onClick={() => { if (window.innerWidth <= 1024) onClose(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 12, marginBottom: 4,
                        textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                        color: isActive ? (isLight ? '#111827' : 'var(--text-primary)') : 'var(--text-secondary)',
                        background: isActive
                          ? (isLight ? 'rgba(124, 92, 255, 0.08)' : 'var(--bg-card-hover)')
                          : 'transparent',
                        border: '1px solid',
                        borderColor: isActive
                          ? (isLight ? 'rgba(124, 92, 255, 0.2)' : 'var(--border-accent)')
                          : 'transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = isLight ? '#f3f4f6' : 'var(--bg-card-hover)';
                          e.currentTarget.style.borderColor = isLight ? '#E5E7EB' : 'var(--border)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {/* Active left accent bar */}
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3,
                          borderRadius: '0 3px 3px 0',
                          background: 'var(--accent)',
                          boxShadow: isLight ? '0 0 8px rgba(124, 92, 255, 0.3)' : '0 0 10px var(--accent)',
                        }} />
                      )}
                      <Icon size={18} style={{ 
                        flexShrink: 0,
                        color: isActive ? 'var(--accent)' : 'inherit',
                        filter: isActive ? (isLight ? 'none' : 'drop-shadow(0 0 8px rgba(99,102,241,0.4))') : 'none'
                      }} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: isLight ? 'none' : '0 0 10px var(--accent)' }} />}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '16px 20px', borderTop: `1px solid ${isLight ? '#E5E7EB' : 'var(--border)'}`,
          minWidth: 280,
        }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', borderRadius: 12,
              background: isLight ? 'rgba(220, 38, 38, 0.06)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${isLight ? 'rgba(220, 38, 38, 0.12)' : 'rgba(239, 68, 68, 0.15)'}`,
              color: 'var(--danger)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
