const { initDb, getPool, upsertDailyLog, recalcDailyLog } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { date, food_name, calories, protein, carbs, fat, sodium } = req.body;

    if (!date || !food_name) {
      return res.status(400).json({ error: 'date and food_name are required' });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const log = await upsertDailyLog(client, date);

      await client.query(
        `INSERT INTO food_entries (daily_log_id, date, food_name, calories, protein, carbs, fat, sodium)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [log.id, date, food_name, calories || 0, protein || 0, carbs || 0, fat || 0, sodium || 0]
      );

      const updatedLog = await recalcDailyLog(client, date);

      const foodRes = await client.query(
        'SELECT * FROM food_entries WHERE date = $1 ORDER BY created_at ASC',
        [date]
      );

      await client.query('COMMIT');

      return res.status(200).json({ dailyLog: updatedLog, foodEntries: foodRes.rows });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('food-log error:', err);
    return res.status(500).json({ error: 'Failed to log food', details: err.message });
  }
};
