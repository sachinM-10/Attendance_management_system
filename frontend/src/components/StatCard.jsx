import React from 'react';

export const StatCard = ({ title, value, label, icon: Icon, color = 'var(--primary)', bg = 'rgba(99, 102, 241, 0.15)' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{title}</div>
        {label && <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{label}</div>}
      </div>
    </div>
  );
};

export default StatCard;
