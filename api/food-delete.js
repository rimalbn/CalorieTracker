const { initDb, getPool, recalcDailyLog } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const entryRes = await client.query(
        'SELECT date FROM food_entries WHERE id = $1',
        [id]
      );
      if (!entryRes.rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Food entry not found' });
      }
      const { date } = entryRes.rows[0];

      await client.query('DELETE FROM food_entries WHERE id = $1', [id]);

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
    console.error('food-delete error:', err);
    return res.status(500).json({ error: 'Failed to delete food entry', details: err.message });
  }
};
