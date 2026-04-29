import React, { useState, useRef, useEffect } from 'react';

export default function FoodModal({ date, onClose, onSuccess }) {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [logging, setLogging] = useState(false);
  const [analyzed, setAnalyzed] = useState(null);
  const [error, setError] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manual, setManual] = useState({ food_name: '', calories: '', protein: '', carbs: '', fat: '', sodium: '' });
  const textRef = useRef(null);

  useEffect(() => {
    setTimeout(() => textRef.current?.focus(), 100);
  }, []);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setAnalyzing(true);
    setError('');
    setAnalyzed(null);
    try {
      const res = await fetch('/api/food-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalyzed(data);
    } catch (e) {
      setError('AI unavailable. Use manual entry below.');
      setManualMode(true);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleConfirmLog() {
    setLogging(true);
    setError('');
    try {
      const items = analyzed?.items || [];
      for (const item of items) {
        const res = await fetch('/api/food-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            food_name: item.name,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            sodium: item.sodium,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Log failed');
        }
      }
      onSuccess();
    } catch (e) {
      setError(e.message || 'Failed to log food');
    } finally {
      setLogging(false);
    }
  }

  async function handleManualLog() {
    if (!manual.food_name.trim()) {
      setError('Food name is required');
      return;
    }
    setLogging(true);
    setError('');
    try {
      const res = await fetch('/api/food-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          food_name: manual.food_name,
          calories: parseFloat(manual.calories) || 0,
          protein: parseFloat(manual.protein) || 0,
          carbs: parseFloat(manual.carbs) || 0,
          fat: parseFloat(manual.fat) || 0,
          sodium: parseFloat(manual.sodium) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Log failed');
      onSuccess();
    } catch (e) {
      setError(e.message || 'Failed to log food');
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 28, color: 'var(--accent)' }}>LOG FOOD</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={22} height={22}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!manualMode && (
          <>
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. 5 whole eggs, 140g chicken breast, 1 cup bone broth"
              rows={3}
              style={{ resize: 'none', marginBottom: 12, fontSize: 16 }}
            />
            <button
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={analyzing || !text.trim()}
              style={{ marginBottom: 12 }}
            >
              {analyzing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderTopColor: '#0c0c0c' }} /> ANALYZING...
                </span>
              ) : 'ANALYZE WITH AI'}
            </button>

            <button
              onClick={() => setManualMode(true)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '0 auto 16px', padding: 0 }}
            >
              Enter manually instead
            </button>
          </>
        )}

        {analyzed && !manualMode && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              DETECTED ITEMS
            </div>
            {analyzed.items.map((item, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.name}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent)' }}>{Math.round(item.calories)} cal</span>
                  <span>P: {Math.round(item.protein)}g</span>
                  <span>C: {Math.round(item.carbs)}g</span>
                  <span>F: {Math.round(item.fat)}g</span>
                  <span>Na: {Math.round(item.sodium)}mg</span>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 0', display: 'flex', gap: 10, fontSize: 13, fontWeight: 600, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)' }}>Total: {Math.round(analyzed.totals.calories)} cal</span>
              <span>P: {Math.round(analyzed.totals.protein)}g</span>
              <span>C: {Math.round(analyzed.totals.carbs)}g</span>
              <span>Na: {Math.round(analyzed.totals.sodium)}mg</span>
            </div>
            <button
              className="btn-primary"
              onClick={handleConfirmLog}
              disabled={logging}
              style={{ marginTop: 4 }}
            >
              {logging ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderTopColor: '#0c0c0c' }} /> LOGGING...
                </span>
              ) : 'CONFIRM & LOG'}
            </button>
          </div>
        )}

        {manualMode && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                MANUAL ENTRY
              </div>
              {!error && (
                <button
                  onClick={() => { setManualMode(false); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                >
                  Use AI instead
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Food name *"
              value={manual.food_name}
              onChange={(e) => setManual({ ...manual, food_name: e.target.value })}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { key: 'calories', label: 'Calories' },
                { key: 'protein', label: 'Protein (g)' },
                { key: 'carbs', label: 'Carbs (g)' },
                { key: 'fat', label: 'Fat (g)' },
                { key: 'sodium', label: 'Sodium (mg)' },
              ].map(({ key, label }) => (
                <input
                  key={key}
                  type="number"
                  placeholder={label}
                  value={manual[key]}
                  onChange={(e) => setManual({ ...manual, [key]: e.target.value })}
                  min="0"
                />
              ))}
            </div>
            <button className="btn-primary" onClick={handleManualLog} disabled={logging}>
              {logging ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="spinner" style={{ borderTopColor: '#0c0c0c' }} /> LOGGING...
                </span>
              ) : 'LOG FOOD'}
            </button>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, padding: 12, background: 'rgba(245, 66, 66, 0.1)', border: '1px solid rgba(245,66,66,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
