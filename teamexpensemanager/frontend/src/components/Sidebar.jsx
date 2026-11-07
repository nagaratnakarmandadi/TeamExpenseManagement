import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  CreditCard,
  Shield
} from 'lucide-react';
import { authService } from '../services/authService';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getUser() || {
    name: 'Admin User',
    email: 'admin@team.io',
    role: 'ADMIN'
  });

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Users & Roles', icon: Users, path: '/users' },
    { label: 'Events & Projects', icon: Calendar, path: '/events' },
    { label: 'Expenses', icon: Receipt, path: '/expenses' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 90,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--dark-navy)',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s ease',
        }}
        className={`sidebar-aside ${isOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{
          padding: '24px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(81, 70, 216, 0.4)'
            }}>
              <CreditCard size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em', color: '#FFFFFF' }}>
                TeamExpense
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                Enterprise Platform
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="mobile-close-btn"
            style={{ 
              color: '#94A3B8', 
              padding: '4px',
              borderRadius: '6px',
              display: 'none'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '20px 14px', flex: 1, overflowY: 'auto' }}>
          <div style={{ 
            fontSize: '11px', 
            fontWeight: 700, 
            textTransform: 'uppercase', 
            letterSpacing: '0.06em', 
            color: '#64748B', 
            padding: '0 12px 10px 12px' 
          }}>
            Main Menu
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => {
                    if (window.innerWidth < 992 && onClose) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    boxShadow: isActive ? '0 4px 12px rgba(81, 70, 216, 0.35)' : 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div style={{
          padding: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getInitials(currentUser?.name)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentUser?.name || 'User'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: currentUser?.role === 'ADMIN' ? '#DC2626' : currentUser?.role === 'MANAGER' ? '#D97706' : '#2563EB',
                    color: '#FFFFFF',
                    letterSpacing: '0.04em'
                  }}>
                    {currentUser?.role || 'MEMBER'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out to Login Page"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F87171';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 992px) {
          .sidebar-aside {
            transform: translateX(-100%);
          }
          .sidebar-aside.open {
            transform: translateX(0);
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
