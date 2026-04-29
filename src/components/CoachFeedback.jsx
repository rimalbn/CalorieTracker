import React from 'react';

const STATUS_COLOR = {
  good: 'var(--green)',
  ok: 'var(--accent)',
  warning: 'var(--accent)',
  bad: 'var(--red)',
  over: 'var(--red)',
};

function Badge({ text }) {
  const lower = (text || '').toLowerCase();
  let color = 'var(--muted)';
  if (lower.includes('good') || lower.includes('excellent') || lower.includes('on track') || lower.includes('met')) color = 'var(--green)';
  else if (lower.includes('low') || lower.includes('under') || lower.includes('short')) color = 'var(--blue)';
  else if (lower.includes('high') || lower.includes('over') || lower.includes('exceed')) color = 'var(--red)';
  else if (lower.includes('warning') || lower.includes('close')) color = 'var(--accent)';

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid ${color}`,
      color,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {text}
    </span>
  );
}

export default function CoachFeedback({ feedback }) {
  if (!feedback) return null;

  const scoreColor = feedback.overall_score >= 8 ? 'var(--green)' : feedback.overall_score >= 5 ? 'var(--accent)' : 'var(--red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Score + message */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 52, lineHeight: 1, color: scoreColor }}>
            {feedback.overall_score}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>/ 10</div>
        </div>
        <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.4 }}>
          "{feedback.message}"
        </div>
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Badge text={feedback.protein_status} />
        <Badge text={feedback.sodium_status} />
        <Badge text={feedback.calorie_status} />
      </div>

      {/* What went well */}
      {feedback.what_went_well && (
        <div style={{ padding: 12, background: 'rgba(66, 245, 167, 0.08)', border: '1px solid rgba(66,245,167,0.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            WHAT WENT WELL
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{feedback.what_went_well}</div>
        </div>
      )}

      {/* What to fix */}
      {feedback.what_to_fix && (
        <div style={{ padding: 12, background: 'rgba(245, 66, 66, 0.08)', border: '1px solid rgba(245,66,66,0.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            FIX THIS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{feedback.what_to_fix}</div>
        </div>
      )}

      {/* Tomorrow tip */}
      {feedback.tomorrow_tip && (
        <div style={{ padding: 12, background: 'rgba(232, 245, 66, 0.06)', border: '1px solid rgba(232,245,66,0.2)', borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            TOMORROW
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{feedback.tomorrow_tip}</div>
        </div>
      )}

      {/* Deficit estimate */}
      {feedback.deficit_estimate != null && (
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
          Est. deficit: <span style={{ color: feedback.deficit_estimate > 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
            {feedback.deficit_estimate > 0 ? '-' : '+'}{Math.abs(Math.round(feedback.deficit_estimate))} cal
          </span>
        </div>
      )}
    </div>
  );
}
