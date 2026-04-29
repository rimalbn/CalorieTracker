const Groq = require('groq-sdk');
const { initDb, getPool, upsertDailyLog } = require('./db');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'date is required' });

    const pool = getPool();
    const dbClient = await pool.connect();

    let dailyLog, foodEntries;
    try {
      await upsertDailyLog(dbClient, date);
      const logRes = await dbClient.query('SELECT * FROM daily_logs WHERE date = $1', [date]);
      dailyLog = logRes.rows[0];
      const foodRes = await dbClient.query(
        'SELECT * FROM food_entries WHERE date = $1 ORDER BY created_at ASC',
        [date]
      );
      foodEntries = foodRes.rows;
    } finally {
      dbClient.release();
    }

    const foodSummary = foodEntries.length
      ? foodEntries.map(f => `${f.food_name} (${f.calories} cal, ${f.protein}g protein, ${f.sodium}mg sodium)`).join('; ')
      : 'No food logged';

    const userPrompt = `
Date: ${date}
Calories consumed: ${dailyLog.total_calories} / target ${dailyLog.training_type === 'rest' ? 1300 : 1600}
Protein: ${dailyLog.total_protein}g / target 155g
Carbs: ${dailyLog.total_carbs}g
Fat: ${dailyLog.total_fat}g
Sodium: ${dailyLog.total_sodium}mg / limit 800mg
Water: ${dailyLog.water_liters}L / target 4L
Training: ${dailyLog.training_type} for ${dailyLog.training_duration} minutes, burned ${dailyLog.calories_burned} cal
Weight today: ${dailyLog.weight || 'not logged'} lbs
Foods eaten: ${foodSummary}
    `.trim();

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are Bipran\'s strict Muay Thai fight camp coach. He fights May 30 in Indianapolis at 145lbs. He is currently 150lbs. Analyze his day and give specific, honest, direct feedback. Return ONLY a raw JSON object with no markdown, no code block, just JSON: { "overall_score": number (1-10), "protein_status": string, "sodium_status": string, "calorie_status": string, "what_went_well": string, "what_to_fix": string, "tomorrow_tip": string, "deficit_estimate": number, "message": string (motivational, max 20 words) }',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const raw = completion.choices[0].message.content.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const feedback = JSON.parse(raw);

    const dbClient2 = await pool.connect();
    try {
      await dbClient2.query(
        'UPDATE daily_logs SET ai_feedback = $1 WHERE date = $2',
        [JSON.stringify(feedback), date]
      );
    } finally {
      dbClient2.release();
    }

    return res.status(200).json(feedback);
  } catch (err) {
    console.error('coach-feedback error:', err);
    return res.status(500).json({ error: 'Failed to generate feedback', details: err.message });
  }
};
