import React from 'react';

export default function ProgressBar({ value, color = 'var(--accent)', height = 6 }) {
  const pct = Math.min(Math.max(value * 100, 0), 100);
  return (
    <div
      style={{
        width: '100%',
        height,
        background: 'var(--surface2)',
        borderRadius: height,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: height,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}
