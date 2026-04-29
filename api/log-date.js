const { initDb, getPool, upsertDailyLog } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      const log = await upsertDailyLog(client, date);

      const foodRes = await client.query(
        'SELECT * FROM food_entries WHERE date = $1 ORDER BY created_at ASC',
        [date]
      );

      return res.status(200).json({
        dailyLog: log,
        foodEntries: foodRes.rows,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('log-date error:', err);
    return res.status(500).json({ error: 'Failed to fetch log', details: err.message });
  }
};
