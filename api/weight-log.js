const { initDb, getPool, upsertDailyLog } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date, weight } = req.body;

    if (!date || weight == null) {
      return res.status(400).json({ error: 'date and weight are required' });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await upsertDailyLog(client, date);

      // Upsert weight_entries (one per date)
      await client.query(
        `INSERT INTO weight_entries (date, weight)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [date, parseFloat(weight)]
      );

      // Update any existing entry for the same date
      await client.query(
        `UPDATE weight_entries SET weight = $1 WHERE date = $2`,
        [parseFloat(weight), date]
      );

      // Also update daily_log weight field
      await client.query(
        `UPDATE daily_logs SET weight = $1 WHERE date = $2`,
        [parseFloat(weight), date]
      );

      const allWeights = await client.query(
        'SELECT * FROM weight_entries ORDER BY date ASC'
      );

      await client.query('COMMIT');

      return res.status(200).json({ weightEntries: allWeights.rows });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('weight-log error:', err);
    return res.status(500).json({ error: 'Failed to log weight', details: err.message });
  }
};
