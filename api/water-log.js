const { initDb, getPool, upsertDailyLog } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date, water_liters } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await upsertDailyLog(client, date);

      const updated = await client.query(
        `UPDATE daily_logs SET water_liters = $1 WHERE date = $2 RETURNING *`,
        [parseFloat(water_liters) || 0, date]
      );

      return res.status(200).json({ dailyLog: updated.rows[0] });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('water-log error:', err);
    return res.status(500).json({ error: 'Failed to log water', details: err.message });
  }
};
