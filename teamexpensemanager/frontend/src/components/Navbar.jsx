import React, { useState, useEffect } from 'react';
import { Menu, Bell, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar({ onMenuToggle, onOpenNewExpense }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getUser());

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
      className="top-navbar"
    >
      {/* Left: Mobile Toggle & System Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuToggle}
          className="mobile-menu-trigger"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
          }}
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Expense Workspace
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} /> JWT Auth Active
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {todayFormatted}
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={() => {
            if (onOpenNewExpense) {
              onOpenNewExpense();
            } else {
              navigate('/expenses');
            }
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Plus size={16} />
          <span>Record Expense</span>
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                border: '2px solid #FFFFFF',
              }}
            />
          </button>
        </div>

        {/* User Pill with Role Indicator or Sign In */}
        {currentUser ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 6px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: '#F8FAFC',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {(currentUser.name || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentUser.name || currentUser.email}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {currentUser.role || 'MEMBER'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="btn btn-outline btn-sm"
          >
            Sign In
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 992px) {
          .top-navbar {
            padding: 0 16px !important;
          }
          .mobile-menu-trigger {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
