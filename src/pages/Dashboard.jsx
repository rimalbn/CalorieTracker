import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import MacroCard from '../components/MacroCard';
import FoodModal from '../components/FoodModal';
import FoodItem from '../components/FoodItem';
import TrainingLogger from '../components/TrainingLogger';
import CoachFeedback from '../components/CoachFeedback';
import ProgressBar from '../components/ProgressBar';

const FIGHT_DATE = new Date(2026, 4, 29); // May 29, 2026
const PROTEIN_TARGET = 155;
const SODIUM_LIMIT = 800;
const WATER_TARGET = 4;

function getDaysToFight() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const fight = new Date(2026, 4, 29);
  fight.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((fight - now) / 86400000));
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const today = getTodayStr();
  const daysLeft = getDaysToFight();

  const [dailyLog, setDailyLog] = useState(null);
  const [foodEntries, setFoodEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [waterInput, setWaterInput] = useState('');
  const [waterLoading, setWaterLoading] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightLoading, setWeightLoading] = useState(false);
  const [weightSaved, setWeightSaved] = useState(false);
  const [waterSaved, setWaterSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const calorieTarget = dailyLog?.training_type === 'rest' ? 1300 : 1600;
  const calories = parseInt(dailyLog?.total_calories || 0);
  const protein = parseFloat(dailyLog?.total_protein || 0);
  const sodium = parseFloat(dailyLog?.total_sodium || 0);
  const water = parseFloat(dailyLog?.water_liters || 0);
  const burned = parseInt(dailyLog?.calories_burned || 0);
  const deficit = burned - calories;

  const sodiumColor = sodium >= SODIUM_LIMIT ? 'var(--red)' : sodium >= 600 ? 'var(--accent)' : 'var(--green)';
  const calColor = calories > calorieTarget ? 'var(--red)' : 'var(--green)';
  const proteinColor = protein >= PROTEIN_TARGET ? 'var(--green)' : 'var(--blue)';

  useEffect(() => { fetchTodayLog(); }, []);

  async function fetchTodayLog() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/log-date?date=${today}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setDailyLog(data.dailyLog);
      setFoodEntries(data.foodEntries || []);
      if (data.dailyLog?.water_liters) setWaterInput(parseFloat(data.dailyLog.water_liters).toString());
      if (data.dailyLog?.weight) setWeightInput(parseFloat(data.dailyLog.weight).toString());
      if (data.dailyLog?.ai_feedback) {
        try { setCoachFeedback(JSON.parse(data.dailyLog.ai_feedback)); } catch {}
      }
    } catch (e) {
      setError('Failed to load today\'s data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteFood(id) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/food-delete?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDailyLog(data.dailyLog);
      setFoodEntries(data.foodEntries || []);
    } catch (e) {
      setError('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogWater() {
    const val = parseFloat(waterInput);
    if (isNaN(val) || val < 0) return;
    setWaterLoading(true);
    try {
      const res = await fetch('/api/water-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, water_liters: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDailyLog(data.dailyLog);
      setWaterSaved(true);
      setTimeout(() => setWaterSaved(false), 2000);
    } catch (e) {
      setError('Failed to log water');
    } finally {
      setWaterLoading(false);
    }
  }

  async function handleLogWeight() {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val < 50) return;
    setWeightLoading(true);
    try {
      const res = await fetch('/api/weight-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today, weight: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWeightSaved(true);
      setTimeout(() => setWeightSaved(false), 2000);
    } catch (e) {
      setError('Failed to log weight');
    } finally {
      setWeightLoading(false);
    }
  }

  async function handleGetFeedback() {
    setFeedbackLoading(true);
    setFeedbackError('');
    try {
      const res = await fetch('/api/coach-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: today }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Feedback failed');
      setCoachFeedback(data);
    } catch (e) {
      setFeedbackError('AI coach unavailable. Try again.');
    } finally {
      setFeedbackLoading(false);
    }
  }

  function handleFoodSuccess() {
    setShowModal(false);
    fetchTodayLog();
  }

  function handleTrainingUpdate(updatedLog) {
    setDailyLog(updatedLog);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your data...</div>
      </div>
    );
  }

  if (error && !dailyLog) {
    return (
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 80 }}>
        <div style={{ color: 'var(--red)', fontSize: 14, textAlign: 'center' }}>{error}</div>
        <button className="btn-secondary" onClick={fetchTodayLog}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Fight camp countdown header */}
      <div style={{
        background: 'linear-gradient(135deg, #141414 0%, #1c1c1c 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 16px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
              FIGHT CAMP
            </div>
            <h1 style={{ margin: 0, fontSize: 32, color: 'var(--accent)', lineHeight: 1 }}>
              {daysLeft} DAYS OUT
            </h1>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              May 29 · Indianapolis · 145 lbs
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>TODAY</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'var(--text)', marginTop: 2 }}>
              {format(new Date(), 'EEE MMM d')}
            </div>
            <div style={{
              fontSize: 11,
              marginTop: 4,
              padding: '2px 8px',
              background: dailyLog?.training_type === 'rest' ? 'rgba(102,102,102,0.2)' : 'rgba(232,245,66,0.15)',
              color: dailyLog?.training_type === 'rest' ? 'var(--muted)' : 'var(--accent)',
              borderRadius: 20,
              border: `1px solid ${dailyLog?.training_type === 'rest' ? 'var(--border)' : 'rgba(232,245,66,0.3)'}`,
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.06em',
              display: 'inline-block',
            }}>
              {dailyLog?.training_type === 'rest' ? 'Rest Day' : 'Training Day'}
            </div>
          </div>
        </div>

        {/* Deficit indicator */}
        {burned > 0 && (
          <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Estimated deficit</span>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: deficit >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {deficit >= 0 ? '-' : '+'}{Math.abs(deficit)} CAL
            </span>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {error && (
          <div style={{ marginBottom: 12, padding: 10, background: 'rgba(245,66,66,0.1)', border: '1px solid rgba(245,66,66,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
            {error}
          </div>
        )}

        {/* Macro cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <MacroCard
            title="Calories"
            value={calories}
            target={calorieTarget}
            unit=" kcal"
            barColor={calColor}
          />
          <MacroCard
            title="Protein"
            value={protein}
            target={PROTEIN_TARGET}
            unit="g"
            barColor={proteinColor}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Sodium */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              SODIUM
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontFamily: 'Bebas Neue, sans-serif', color: sodiumColor, lineHeight: 1 }}>
                {Math.round(sodium)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>/ {SODIUM_LIMIT}mg</span>
            </div>
            <ProgressBar value={sodium / SODIUM_LIMIT} color={sodiumColor} height={5} />
          </div>

          {/* Water */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              WATER
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 8 }}>
              <span style={{ fontSize: 24, fontFamily: 'Bebas Neue, sans-serif', color: water >= WATER_TARGET ? 'var(--green)' : 'var(--blue)', lineHeight: 1 }}>
                {water.toFixed(1)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>/ {WATER_TARGET}L</span>
            </div>
            <ProgressBar value={water / WATER_TARGET} color={water >= WATER_TARGET ? 'var(--green)' : 'var(--blue)'} height={5} />
          </div>
        </div>

        {/* Log water */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Log Water</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              placeholder="Liters today"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
              min="0"
              max="10"
              step="0.5"
              style={{ flex: 1 }}
            />
            <button
              className="btn-secondary"
              onClick={handleLogWater}
              disabled={waterLoading}
              style={{ flexShrink: 0, padding: '10px 16px' }}
            >
              {waterLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : waterSaved ? '✓' : 'Save'}
            </button>
          </div>
        </div>

        {/* Food section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text)' }}>TODAY'S FOOD</h2>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: 'var(--accent)',
              color: '#0c0c0c',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 16,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width={14} height={14}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            ADD FOOD
          </button>
        </div>

        {foodEntries.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍳</div>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>No food logged yet today</div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 4 }}>Tap "Add Food" to get started</div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 16 }}>
            {foodEntries.map((item) => (
              <FoodItem
                key={item.id}
                item={item}
                onDelete={handleDeleteFood}
                deleting={deletingId === item.id}
              />
            ))}
            {/* Totals row */}
            <div style={{ paddingTop: 10, display: 'flex', gap: 12, fontSize: 12, fontWeight: 600, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent)' }}>{calories} cal</span>
              <span>P: {Math.round(protein)}g</span>
              <span>C: {Math.round(dailyLog?.total_carbs || 0)}g</span>
              <span>F: {Math.round(dailyLog?.total_fat || 0)}g</span>
              <span style={{ color: sodiumColor }}>Na: {Math.round(sodium)}mg</span>
            </div>
          </div>
        )}

        {/* Training section */}
        <h2 style={{ margin: '0 0 12px', fontSize: 22, color: 'var(--text)' }}>TRAINING</h2>
        <div className="card" style={{ marginBottom: 16 }}>
          {dailyLog?.training_type && dailyLog.training_type !== 'rest' && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Current</span>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {dailyLog.training_type.toUpperCase()} · {dailyLog.training_duration}min · -{dailyLog.calories_burned} cal
              </span>
            </div>
          )}
          <TrainingLogger date={today} current={dailyLog} onUpdate={handleTrainingUpdate} />
        </div>

        {/* Weight section */}
        <h2 style={{ margin: '0 0 12px', fontSize: 22, color: 'var(--text)' }}>WEIGHT</h2>
        <div className="card" style={{ marginBottom: 16 }}>
          {dailyLog?.weight && (
            <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>Today's weight</span>
              <span style={{ color: 'var(--text)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 20 }}>
                {parseFloat(dailyLog.weight).toFixed(1)} LBS
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              placeholder="Weight (lbs)"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              min="100"
              max="300"
              step="0.1"
              style={{ flex: 1 }}
            />
            <button
              className="btn-secondary"
              onClick={handleLogWeight}
              disabled={weightLoading}
              style={{ flexShrink: 0, padding: '10px 16px' }}
            >
              {weightLoading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : weightSaved ? '✓' : 'Save'}
            </button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)' }}>
            <span>Current: 150.0 lbs</span>
            <span>Target: 145.0 lbs</span>
          </div>
        </div>

        {/* AI Coach Feedback */}
        <h2 style={{ margin: '0 0 12px', fontSize: 22, color: 'var(--text)' }}>AI COACH</h2>
        <div className="card" style={{ marginBottom: 0 }}>
          {coachFeedback ? (
            <>
              <CoachFeedback feedback={coachFeedback} />
              <button
                className="btn-secondary"
                onClick={handleGetFeedback}
                disabled={feedbackLoading}
                style={{ marginTop: 12, width: '100%' }}
              >
                {feedbackLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...
                  </span>
                ) : 'REFRESH FEEDBACK'}
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.5 }}>
                Get personalized feedback from your AI coach based on today's nutrition and training.
              </div>
              {feedbackError && (
                <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10 }}>{feedbackError}</div>
              )}
              <button
                className="btn-primary"
                onClick={handleGetFeedback}
                disabled={feedbackLoading}
              >
                {feedbackLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="spinner" style={{ borderTopColor: '#0c0c0c' }} /> ANALYZING YOUR DAY...
                  </span>
                ) : 'GET COACH FEEDBACK'}
              </button>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <FoodModal date={today} onClose={() => setShowModal(false)} onSuccess={handleFoodSuccess} />
      )}
    </div>
  );
}
