import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--primary)', bgColor = 'var(--primary-light)' }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div 
          className="stat-icon-wrapper"
          style={{ backgroundColor: bgColor, color: color }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-footer">
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
