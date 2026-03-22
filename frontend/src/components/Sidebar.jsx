/**
 * Sidebar Navigation — all platform sections with icons and active states.
 */
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Upload, FileText, Shield, Scale, AlertTriangle,
  Calendar, GitCompare, Building2, Bell, MessageSquare, ChevronRight,
  Gavel, X
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard, group: 'CORE' },
  { path: '/upload', label: 'Upload', icon: Upload, group: 'CONTRACTS' },
  { path: '/contracts', label: 'Contracts', icon: FileText, group: 'CONTRACTS' },
  { path: '/negotiate', label: 'Negotiate', icon: MessageSquare, group: 'ANALYSIS' },
  { path: '/litigation', label: 'Litigation', icon: Gavel, group: 'ANALYSIS' },
  { path: '/compliance', label: 'Compliance', icon: Shield, group: 'ANALYSIS' },
  { path: '/obligations', label: 'Obligations', icon: Calendar, group: 'ANALYSIS' },
  { path: '/jurisdiction', label: 'Jurisdiction', icon: Building2, group: 'INTEL' },
  { path: '/compare', label: 'Compare', icon: GitCompare, group: 'INTEL' },
  { path: '/vendor', label: 'Vendor Intel', icon: Building2, group: 'INTEL' },
  { path: '/generate', label: 'Generate', icon: FileText, group: 'AI' },
  { path: '/monitoring', label: 'Live Monitoring', icon: Bell, group: 'AI' },
  { path: '/regulation', label: 'Regulation Monitor', icon: Shield, group: 'AI' },
  { path: '/chat', label: 'Legal Help', icon: MessageSquare, group: 'SUPPORT' },
  { path: '/settings', label: 'Settings', icon: X, group: 'SUPPORT' },
];

const GROUPS = ['CORE', 'CONTRACTS', 'ANALYSIS', 'INTEL', 'AI', 'SUPPORT'];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024); // Define isDesktop

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
            background: 'rgba(0,0,0,0.1)', 
            zIndex: 90, 
            transition: 'opacity 0.3s ease'
          }}
          onClick={onClose}
        />
      )}

      <aside style={{
        width: 280,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 100,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transform: (isDesktop ? open : open) ? 'translateX(0)' : 'translateX(-280px)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px', borderBottom: '1px solid var(--border)', minWidth: 280, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'var(--gradient-1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: 'white',
              boxShadow: '0 8px 16px rgba(99,102,241,0.2)',
            }}>L</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              Lexi<span style={{ color: 'var(--accent)' }}>Sure</span>
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
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '0 12px', marginBottom: 12,
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
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--border-accent)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={18} style={{ 
                        flexShrink: 0,
                        color: isActive ? 'var(--accent)' : 'inherit',
                        filter: isActive ? 'drop-shadow(0 0 8px rgba(99,102,241,0.4))' : 'none'
                      }} />
                      <span style={{ flex: 1 }}>{label}</span>
                      {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '20px 24px', borderTop: '1px solid var(--border)',
          minWidth: 280,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>JS</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Ayush</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Professional Plan</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
