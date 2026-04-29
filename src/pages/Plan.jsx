import React, { useState, useEffect } from 'react';

const CHECKLIST_KEY = 'fc_daily_checklist';
const CHECKLIST_DATE_KEY = 'fc_checklist_date';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CHECKLIST_ITEMS = [
  { id: 'eggs', label: '5 whole eggs', detail: 'breakfast protein base' },
  { id: 'protein', label: '155g+ total protein', detail: 'non-negotiable every day' },
  { id: 'sodium', label: 'Sodium under 800mg', detail: 'no restaurant, no processed food' },
  { id: 'water', label: '4 liters water', detail: 'minimum daily requirement' },
  { id: 'banana', label: 'Banana (potassium)', detail: '1 medium banana for cramps/recovery' },
  { id: 'no_restaurant', label: 'No restaurant food', detail: 'hidden sodium — cook at home only' },
  { id: 'magnesium', label: 'Magnesium supplement', detail: 'before bed — sleep + recovery' },
];

const AVOID_FOODS = [
  { item: 'Restaurant food', reason: '1000+ mg sodium per meal' },
  { item: 'Processed meats', reason: 'Deli meat, sausage, bacon — sodium bombs' },
  { item: 'Canned soups', reason: '800mg+ sodium per serving' },
  { item: 'Soy sauce, teriyaki', reason: 'Extremely high sodium' },
  { item: 'Chips, crackers', reason: 'Empty calories + high sodium' },
  { item: 'Alcohol', reason: 'Dehydration + disrupts cut entirely' },
  { item: 'Sports drinks (excess)', reason: 'Hidden sodium and sugar' },
  { item: 'Bread (white)', reason: 'Low protein, spikes insulin' },
  { item: 'Fast food', reason: 'Zero control over macros' },
];

const EMERGENCY_MEALS = [
  {
    name: 'The Standard',
    items: ['5 whole eggs (scrambled/boiled)', '140g chicken thigh (baked/grilled)', '1 banana'],
    macros: '~550 cal · P: 65g · Na: ~350mg',
  },
  {
    name: 'Protein Shake Backup',
    items: ['2 scoops whey protein + water', '5 boiled eggs', '1 apple'],
    macros: '~480 cal · P: 70g · Na: ~200mg',
  },
  {
    name: 'Canned Tuna Emergency',
    items: ['2x canned tuna in water (low sodium)', '4 whole eggs', '1 cup rice'],
    macros: '~620 cal · P: 75g · Na: ~400mg',
  },
  {
    name: 'Prep-Free Option',
    items: ['1 rotisserie chicken breast (skin off)', '1 cup bone broth (low sodium)', '1 banana'],
    macros: '~420 cal · P: 55g · Na: ~380mg',
  },
];

const WEEKLY_PLAN = [
  { day: 'Monday', training: 'MT 7:15pm', calories: 1600, note: 'High protein focus, hydrate hard before evening session' },
  { day: 'Tuesday', training: 'MT 6pm', calories: 1600, note: 'Eat final meal 90 min before training' },
  { day: 'Wednesday', training: 'MT 7:15pm', calories: 1600, note: 'Midweek — check weight, adjust water if needed' },
  { day: 'Thursday', training: 'MT 6pm + 8:30pm', calories: 1600, note: 'Double session — add 100-150 extra cal, banana mandatory' },
  { day: 'Friday', training: 'MT 7:15pm', calories: 1600, note: 'End of week — review weekly avg weight' },
  { day: 'Saturday', training: 'Gym + Run', calories: 1600, note: 'Gym first, run after. Post-workout protein within 30 min' },
  { day: 'Sunday', training: 'Gym + Run / Active Recovery', calories: 1300, note: 'Lighter if no double session — rest day calories if truly resting' },
];

export default function Plan() {
  const today = getTodayStr();
  const [checked, setChecked] = useState({});

  // Load checklist from localStorage, reset if new day
  useEffect(() => {
    const savedDate = localStorage.getItem(CHECKLIST_DATE_KEY);
    if (savedDate === today) {
      try {
        const saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
        setChecked(saved);
      } catch {}
    } else {
      // New day — reset checklist
      localStorage.setItem(CHECKLIST_DATE_KEY, today);
      localStorage.setItem(CHECKLIST_KEY, '{}');
      setChecked({});
    }
  }, [today]);

  function toggleCheck(id) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  }

  const checkedCount = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length;
  const allDone = checkedCount === CHECKLIST_ITEMS.length;

  return (
    <div style={{ padding: '20px 16px 24px' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 32, color: 'var(--text)' }}>THE PLAN</h1>
      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Fight camp protocol · May 30 · Indianapolis</div>

      {/* Daily checklist */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text)' }}>DAILY CHECKLIST</h2>
          <div style={{
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: 20,
            color: allDone ? 'var(--green)' : 'var(--accent)',
            lineHeight: 1,
          }}>
            {checkedCount}/{CHECKLIST_ITEMS.length}
          </div>
        </div>

        {allDone && (
          <div style={{ padding: '12px 16px', background: 'rgba(66, 245, 167, 0.1)', border: '1px solid rgba(66,245,167,0.25)', borderRadius: 10, marginBottom: 12, textAlign: 'center', fontSize: 14, color: 'var(--green)', fontWeight: 600 }}>
            PERFECT DAY — KEEP THIS UP
          </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {CHECKLIST_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              style={{
                width: '100%',
                background: checked[item.id] ? 'rgba(66,245,167,0.05)' : 'transparent',
                border: 'none',
                borderBottom: idx < CHECKLIST_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${checked[item.id] ? 'var(--green)' : 'var(--border)'}`,
                background: checked[item.id] ? 'var(--green)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}>
                {checked[item.id] && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0c0c0c" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width={13} height={13}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: checked[item.id] ? 'var(--muted)' : 'var(--text)', textDecoration: checked[item.id] ? 'line-through' : 'none', transition: 'all 0.15s' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{item.detail}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, color: 'var(--text)' }}>WEEKLY SCHEDULE</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEEKLY_PLAN.map((day) => {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const isToday = dayNames[new Date().getDay()] === day.day;
            return (
              <div
                key={day.day}
                className="card"
                style={{ borderColor: isToday ? 'var(--accent)' : 'var(--border)', borderWidth: isToday ? 2 : 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: isToday ? 'var(--accent)' : 'var(--text)' }}>
                      {day.day.toUpperCase()}
                    </span>
                    {isToday && (
                      <span style={{ fontSize: 10, color: 'var(--accent)', background: 'rgba(232,245,66,0.15)', padding: '1px 6px', borderRadius: 10, fontWeight: 700, letterSpacing: '0.06em' }}>
                        TODAY
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{day.calories} cal</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--blue)', marginBottom: 4 }}>{day.training}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{day.note}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency meals */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, color: 'var(--text)' }}>EMERGENCY MEALS</h2>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>For chaotic days — simple, clean, on target</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {EMERGENCY_MEALS.map((meal) => (
            <div key={meal.name} className="card">
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--accent)', marginBottom: 8 }}>
                {meal.name.toUpperCase()}
              </div>
              {meal.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{item}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--bg)', borderRadius: 6, fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--muted)' }}>
                {meal.macros}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Foods to avoid */}
      <div style={{ marginBottom: 0 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, color: 'var(--text)' }}>AVOID</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {AVOID_FOODS.map((f, idx) => (
            <div
              key={f.item}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: idx < AVOID_FOODS.length - 1 ? '1px solid var(--border)' : 'none',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{f.item}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.reason}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={2} strokeLinecap="round" width={16} height={16} style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" />
                <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
