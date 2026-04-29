import React from 'react';
import ProgressBar from './ProgressBar';

export default function MacroCard({ title, value, target, unit, barColor, children }) {
  const pct = target > 0 ? value / target : 0;

  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
        <span style={{ fontSize: 24, fontFamily: 'Bebas Neue, sans-serif', color: 'var(--text)', lineHeight: 1 }}>
          {Math.round(value)}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          / {Math.round(target)}{unit}
        </span>
      </div>
      <ProgressBar value={pct} color={barColor} height={5} />
      {children && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
}
