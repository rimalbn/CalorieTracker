import React from 'react';

export default function FoodItem({ item, onDelete, deleting }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.food_name}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--accent)' }}>{Math.round(item.calories)} cal</span>
          <span>P: {Math.round(item.protein)}g</span>
          <span>C: {Math.round(item.carbs)}g</span>
          <span>F: {Math.round(item.fat)}g</span>
          <span style={{ color: item.sodium > 400 ? 'var(--red)' : 'inherit' }}>
            Na: {Math.round(item.sodium)}mg
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        disabled={deleting}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
          padding: 6,
          borderRadius: 6,
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
        aria-label="Delete food entry"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}
