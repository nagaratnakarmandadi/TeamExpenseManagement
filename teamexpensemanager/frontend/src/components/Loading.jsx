import React from 'react';

export default function Loading({ message = 'Loading data from server...' }) {
  return (
    <div className="loading-wrapper">
      <div className="spinner" />
      <span style={{ marginTop: '14px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
}
