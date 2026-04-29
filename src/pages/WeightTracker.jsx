import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>
          {payload[0].value.toFixed(1)} lbs
        </div>
      </div>
    );
  }
  return null;
};

export default function WeightTracker() {
  const today = getTodayStr();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      setLoading(true);
      const res = await fetch('/api/weight-history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEntries(data.weightEntries || []);
    } catch (e) {
      setError('Failed to load weight history');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 50 || val > 500) {
      setError('Enter a valid weight');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/weight-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, weight: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEntries(data.weightEntries || []);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message || 'Failed to save weight');
    } finally {
      setSaving(false);
    }
  }

  const chartData = entries.map((e) => ({
    date: format(parseISO(e.date.split('T')[0]), 'MMM d'),
    weight: parseFloat(e.weight),
  }));

  const latestWeight = entries.length > 0 ? parseFloat(entries[entries.length - 1].weight) : null;
  const startWeight = 150;
  const targetWeight = 145;
  const progress = latestWeight ? ((startWeight - latestWeight) / (startWeight - targetWeight)) * 100 : 0;
  const remaining = latestWeight ? Math.max(0, latestWeight - targetWeight) : null;

  const yDomain = entries.length > 0
    ? [
        Math.min(144, ...entries.map((e) => parseFloat(e.weight))) - 0.5,
        Math.max(151, ...entries.map((e) => parseFloat(e.weight))) + 0.5,
      ]
    : [143, 152];

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 32, color: 'var(--text)' }}>WEIGHT</h1>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>May 29 · Indianapolis · 145 lbs target</div>

      {/* Stats row */}
      {latestWeight && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--text)', lineHeight: 1 }}>
              {latestWeight.toFixed(1)}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Current</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: remaining === 0 ? 'var(--green)' : 'var(--accent)', lineHeight: 1 }}>
              {remaining !== null ? remaining.toFixed(1) : '--'}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>To Cut</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 26, color: 'var(--green)', lineHeight: 1 }}>
              {Math.max(0, Math.round(progress))}%
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Progress</div>
          </div>
        </div>
      )}

      {/* Log weight */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Log Today's Weight</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            placeholder="Weight in lbs"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            min="100"
            max="300"
            step="0.1"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            className="btn-secondary"
            onClick={handleSave}
            disabled={saving}
            style={{ flexShrink: 0, padding: '10px 16px' }}
          >
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : saved ? '✓ Saved' : 'Log'}
          </button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--red)' }}>{error}</div>}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 8px 8px' }}>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, paddingLeft: 8 }}>
          WEIGHT OVER TIME
        </div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 24, height: 24 }} />
          </div>
        ) : entries.length < 2 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 13 }}>
            Log at least 2 weigh-ins to see your trend
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: -12, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#666', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={145} stroke="#42f5a7" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: '145 target', position: 'insideTopRight', fill: '#42f5a7', fontSize: 10 }} />
              <ReferenceLine y={150} stroke="#666" strokeDasharray="4 4" strokeWidth={1} label={{ value: '150 start', position: 'insideTopRight', fill: '#666', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#e8f542"
                strokeWidth={2.5}
                dot={{ fill: '#e8f542', r: 4, strokeWidth: 0 }}
                activeDot={{ fill: '#e8f542', r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Entry list */}
      <div className="card">
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          ALL ENTRIES
        </div>
        {entries.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>No entries yet</div>
        ) : (
          [...entries].reverse().map((e) => {
            const w = parseFloat(e.weight);
            const diff = w - 145;
            return (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{format(parseISO(e.date.split('T')[0]), 'EEE, MMM d')}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--text)' }}>{w.toFixed(1)}</span>
                  <span style={{ fontSize: 11, color: diff <= 0 ? 'var(--green)' : 'var(--muted)' }}>
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} lbs to goal
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
