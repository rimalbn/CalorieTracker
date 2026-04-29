import React, { useState } from 'react';

const TRAINING_TYPES = [
  { value: 'mt', label: 'Muay Thai', cal: 700 },
  { value: 'sparring', label: 'Sparring', cal: 800 },
  { value: 'gym', label: 'Gym', cal: 400 },
  { value: 'run', label: 'Run', cal: 350 },
  { value: 'swim', label: 'Swim', cal: 400 },
  { value: 'rest', label: 'Rest Day', cal: 0 },
];

export default function TrainingLogger({ date, current, onUpdate }) {
  const [type, setType] = useState(current?.training_type || 'rest');
  const [duration, setDuration] = useState(current?.training_duration?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const selectedType = TRAINING_TYPES.find((t) => t.value === type);
  const estBurn = type === 'rest' ? 0 : Math.round((selectedType.cal * (parseInt(duration) || 0)) / 60);

  async function handleLog() {
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/training-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, training_type: type, duration_minutes: parseInt(duration) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSaved(true);
      onUpdate(data.dailyLog);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {TRAINING_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            style={{
              background: type === t.value ? 'var(--accent)' : 'var(--surface2)',
              color: type === t.value ? '#0c0c0c' : 'var(--text)',
              border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '8px 4px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              transition: 'all 0.15s',
              textAlign: 'center',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {type !== 'rest' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Duration (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="0"
            style={{ flex: 1 }}
          />
          {estBurn > 0 && (
            <div style={{ fontSize: 13, color: 'var(--green)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              ~{estBurn} cal
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{error}</div>
      )}

      <button className="btn-primary" onClick={handleLog} disabled={loading}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span className="spinner" style={{ borderTopColor: '#0c0c0c' }} /> SAVING...
          </span>
        ) : saved ? 'SAVED ✓' : 'LOG TRAINING'}
      </button>
    </div>
  );
}
