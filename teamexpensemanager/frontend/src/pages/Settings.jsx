import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'error' | 'checking'
  const [latency, setLatency] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setBackendStatus('checking');
    const start = performance.now();
    try {
      await api.get('/api/users/getUsersList');
      const diff = Math.round(performance.now() - start);
      setLatency(diff);
      setBackendStatus('connected');
      setErrorMessage(null);
    } catch (err) {
      setBackendStatus('error');
      setErrorMessage(err.message || 'Cannot reach Spring Boot server at port 9191');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>System Settings & Diagnostics</h1>
          <p>Environment configuration, active integrations, and server status</p>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-secondary btn-sm"
            onClick={checkConnection}
            style={{ gap: '6px' }}
          >
            <RefreshCw size={14} />
            <span>Retest Connection</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Backend Connectivity Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Spring Boot Backend Health</h3>
              <p className="card-subtitle">Active REST API endpoint check</p>
            </div>
            {backendStatus === 'connected' ? (
              <span className="badge badge-success">
                <CheckCircle2 size={12} /> Connected
              </span>
            ) : backendStatus === 'checking' ? (
              <span className="badge badge-warning">
                <RefreshCw size={12} /> Probing
              </span>
            ) : (
              <span className="badge badge-danger">
                <AlertCircle size={12} /> Offline
              </span>
            )}
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Server Target:</span>
                <strong style={{ fontSize: '14px' }}>http://localhost:9191</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Vite Dev Proxy:</span>
                <strong style={{ fontSize: '14px' }}>/api &rarr; :9191</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Response Time:</span>
                <strong style={{ fontSize: '14px', color: latency < 100 ? 'var(--success)' : 'inherit' }}>
                  {latency !== null ? `${latency} ms` : '—'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Thymeleaf Login Shell:</span>
                <a 
                  href="http://localhost:9191/login" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>Open :9191/login</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {errorMessage && (
                <div className="alert alert-danger" style={{ marginTop: '10px', fontSize: '13px' }}>
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database & Architecture Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Database & Architecture</h3>
              <p className="card-subtitle">MySQL schema and persistence configuration</p>
            </div>
            <span className="badge badge-primary">MySQL 8.0</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Database Name:</span>
                <strong style={{ fontSize: '14px' }}>expenses</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Users Table:</span>
                <code style={{ fontSize: '13px', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>user71</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Events Table:</span>
                <code style={{ fontSize: '13px', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>event71</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Expenses Table:</span>
                <code style={{ fontSize: '13px', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>expenses71</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Join Table:</span>
                <code style={{ fontSize: '13px', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>event_members</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
