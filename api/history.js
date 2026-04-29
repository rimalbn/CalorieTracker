const { initDb, getPool } = require('./db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          dl.*,
          COUNT(fe.id)::integer AS food_count
        FROM daily_logs dl
        LEFT JOIN food_entries fe ON fe.date = dl.date
        GROUP BY dl.id
        ORDER BY dl.date DESC
        LIMIT 14
      `);

      return res.status(200).json({ history: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('history error:', err);
    return res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
};
