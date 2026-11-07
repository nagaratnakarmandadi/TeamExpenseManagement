import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: 'admin@team.io',
    password: 'password123',
    role: 'ADMIN',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await authService.login(formData.email.trim(), formData.password);
        setSuccess('Authentication successful! Entering workspace...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 300);
      } else {
        if (!formData.name.trim()) {
          throw new Error('Full Name is required for registration');
        }
        await authService.register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
        });
        setSuccess('Account created successfully! Entering workspace...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      {/* Left Branding Section */}
      <section style={{
        flex: 1,
        background: 'linear-gradient(135deg, #171A2E 0%, #292468 50%, #5146D8 100%)',
        color: '#FFFFFF',
        padding: '56px',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(23, 26, 46, 0.25)',
      }} className="brand-section">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '20px', fontWeight: 800 }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: 'var(--primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(81, 70, 216, 0.45)',
          }}>
            <CreditCard size={22} color="#FFFFFF" />
          </div>
          <span>TeamExpense</span>
        </div>

        {/* Brand Content */}
        <div style={{ maxWidth: '520px', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#EEEDFD',
            marginBottom: '24px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            Enterprise Expense Suite
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Manage team expenses.<br />Simplify teamwork.
          </h1>

          <p style={{ color: '#C7D2FE', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
            Enterprise-grade authentication with Spring Security and JWT. Track multi-department events, manage member participation, reconcile payments, and audit real-time analytics in one centralized SaaS platform.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#E0E7FF', fontWeight: 500 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7167E8', boxShadow: '0 0 8px #7167E8' }} />
              BCrypt Password Hashing & JWT Bearer Security
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#E0E7FF', fontWeight: 500 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7167E8', boxShadow: '0 0 8px #7167E8' }} />
              Role-Based Access Control: Admin, Manager, Member
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#E0E7FF', fontWeight: 500 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7167E8', boxShadow: '0 0 8px #7167E8' }} />
              Real-time Expense Tracking & Event Analytics
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '0.02em', zIndex: 1 }}>
          Spring Boot &bull; Spring Security &bull; MySQL 8.0 &bull; Port 9191
        </div>
      </section>

      {/* Right Form Section */}
      <section style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#FFFFFF',
          padding: '40px 36px',
          borderRadius: '20px',
          border: '1px solid #E5E7EB',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              style={{
                fontSize: '15px',
                fontWeight: mode === 'login' ? 700 : 600,
                color: mode === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              style={{
                fontSize: '15px',
                fontWeight: mode === 'register' ? 700 : 600,
                color: mode === 'register' ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '6px 12px',
                borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              Register New User
            </button>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create an Account'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              {mode === 'login'
                ? 'Sign in with your corporate credentials to access the workspace.'
                : 'Register a new team member with role-based access.'}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '18px', padding: '10px 14px', fontSize: '13px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '18px', padding: '10px 14px', fontSize: '13px' }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <div>{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sarah Connor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Work Email <span className="req">*</span></label>
              <input
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="req">*</span></label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: '42px' }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Assign Role <span className="req">*</span></label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="MEMBER">Member (Standard)</option>
                  <option value="MANAGER">Manager (Events & Approvals)</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="VIEWER">Viewer (Read-Only)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '6px' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Dashboard' : 'Register & Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Demo info note */}
          <div style={{
            marginTop: '24px',
            padding: '12px 14px',
            backgroundColor: 'var(--primary-light)',
            borderRadius: '10px',
            display: 'flex',
            gap: '10px',
            fontSize: '12px',
            color: 'var(--primary)',
            lineHeight: 1.5,
          }}>
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Default Admin:</strong> <code>admin@team.io</code> / <code>password123</code> (or <code>ratnakar@gmail.com</code> / <code>password123</code>)
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 992px) {
          .brand-section {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
