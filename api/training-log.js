const { initDb, getPool, upsertDailyLog } = require('./db');

// Calories burned per hour at 150 lbs
const CAL_PER_HOUR = {
  mt: 700,
  sparring: 800,
  gym: 400,
  run: 350,
  swim: 400,
  rest: 0,
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date, training_type, duration_minutes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const type = (training_type || 'rest').toLowerCase();
    const duration = parseInt(duration_minutes) || 0;
    const ratePerHour = CAL_PER_HOUR[type] ?? 0;
    const calories_burned = Math.round((ratePerHour * duration) / 60);

    const pool = getPool();
    const client = await pool.connect();
    try {
      await upsertDailyLog(client, date);

      const updated = await client.query(
        `UPDATE daily_logs
         SET training_type = $1, training_duration = $2, calories_burned = $3
         WHERE date = $4
         RETURNING *`,
        [type, duration, calories_burned, date]
      );

      return res.status(200).json({ dailyLog: updated.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('training-log error:', err);
    return res.status(500).json({ error: 'Failed to log training', details: err.message });
  }
};
