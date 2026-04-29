import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import CoachFeedback from '../components/CoachFeedback';
import ProgressBar from '../components/ProgressBar';

function DayCard({ day, onClick }) {
  const isTraining = day.training_type && day.training_type !== 'rest';
  const overCal = day.total_calories > (isTraining ? 1600 : 1300);
  const overSodium = day.total_sodium > 800;
  let feedback = null;
  try { if (day.ai_feedback) feedback = JSON.parse(day.ai_feedback); } catch {}

  const dateLabel = format(parseISO(day.date.split('T')[0]), 'EEE, MMM d');

  return (
    <div
      className="card"
      onClick={() => onClick(day)}
      style={{ cursor: 'pointer', marginBottom: 10, transition: 'border-color 0.15s' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>{dateLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {day.food_count} item{day.food_count !== 1 ? 's' : ''} logged
            {isTraining ? ` · ${day.training_type.toUpperCase()} ${day.training_duration}min` : ' · Rest day'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {feedback && (
            <div style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 22,
              color: feedback.overall_score >= 8 ? 'var(--green)' : feedback.overall_score >= 5 ? 'var(--accent)' : 'var(--red)',
              lineHeight: 1,
            }}>
              {feedback.overall_score}/10
            </div>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={16} height={16} style={{ color: 'var(--muted)' }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { label: 'Cal', value: Math.round(day.total_calories), color: overCal ? 'var(--red)' : 'var(--accent)' },
          { label: 'Pro', value: `${Math.round(day.total_protein)}g`, color: day.total_protein >= 155 ? 'var(--green)' : 'var(--blue)' },
          { label: 'Na', value: `${Math.round(day.total_sodium)}mg`, color: overSodium ? 'var(--red)' : day.total_sodium >= 600 ? 'var(--accent)' : 'var(--green)' },
          { label: 'H₂O', value: `${parseFloat(day.water_liters || 0).toFixed(1)}L`, color: day.water_liters >= 4 ? 'var(--green)' : 'var(--muted)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg)', borderRadius: 6, padding: '6px 4px' }}>
            <div style={{ fontSize: 14, fontFamily: 'Bebas Neue, sans-serif', color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailView({ day, onBack }) {
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateStr = day.date.split('T')[0];
  let feedback = null;
  try { if (day.ai_feedback) feedback = JSON.parse(day.ai_feedback); } catch {}

  useEffect(() => {
    fetch(`/api/log-date?date=${dateStr}`)
      .then((r) => r.json())
      .then((d) => setFoodEntries(d.foodEntries || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateStr]);

  const isTraining = day.training_type && day.training_type !== 'rest';

  return (
    <div style={{ padding: '0 0 24px' }}>
      <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={22} height={22}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 style={{ margin: 0, fontSize: 26, color: 'var(--text)' }}>
          {format(parseISO(dateStr), 'EEE, MMM d')}
        </h2>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Macros */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { label: 'Calories', value: Math.round(day.total_calories), target: isTraining ? 1600 : 1300, unit: ' kcal', color: day.total_calories > (isTraining ? 1600 : 1300) ? 'var(--red)' : 'var(--green)' },
            { label: 'Protein', value: Math.round(day.total_protein), target: 155, unit: 'g', color: day.total_protein >= 155 ? 'var(--green)' : 'var(--blue)' },
            { label: 'Sodium', value: Math.round(day.total_sodium), target: 800, unit: 'mg', color: day.total_sodium >= 800 ? 'var(--red)' : day.total_sodium >= 600 ? 'var(--accent)' : 'var(--green)' },
            { label: 'Water', value: parseFloat(day.water_liters || 0).toFixed(1), target: 4, unit: 'L', color: day.water_liters >= 4 ? 'var(--green)' : 'var(--blue)' },
          ].map(({ label, value, target, unit, color }) => (
            <div key={label} className="card">
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color, lineHeight: 1, marginBottom: 6 }}>
                {value}{unit}
              </div>
              <ProgressBar value={value / target} color={color} height={4} />
            </div>
          ))}
        </div>

        {/* Training */}
        {isTraining && (
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>TRAINING</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{day.training_type.toUpperCase()}</span>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{day.training_duration}min · -{day.calories_burned} cal burned</span>
            </div>
          </div>
        )}

        {/* Food list */}
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            FOOD LOG
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><span className="spinner" /></div>
          ) : foodEntries.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>No food logged this day</div>
          ) : (
            foodEntries.map((f) => (
              <div key={f.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{f.food_name}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--accent)' }}>{Math.round(f.calories)} cal</span>
                  <span>P: {Math.round(f.protein)}g</span>
                  <span>Na: {Math.round(f.sodium)}mg</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Feedback */}
        {feedback && (
          <div className="card">
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              AI COACH FEEDBACK
            </div>
            <CoachFeedback feedback={feedback} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  if (selectedDay) {
    return <DetailView day={selectedDay} onBack={() => setSelectedDay(null)} />;
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ margin: '0 0 20px', fontSize: 32, color: 'var(--text)' }}>HISTORY</h1>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      )}

      {error && (
        <div style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center', padding: 20 }}>{error}</div>
      )}

      {!loading && !error && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14 }}>No history yet. Start logging!</div>
        </div>
      )}

      {history.map((day) => (
        <DayCard key={day.id} day={day} onClick={setSelectedDay} />
      ))}
    </div>
  );
}
