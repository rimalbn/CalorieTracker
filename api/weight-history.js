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
      const result = await client.query(
        'SELECT * FROM weight_entries ORDER BY date ASC'
      );
      return res.status(200).json({ weightEntries: result.rows });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('weight-history error:', err);
    return res.status(500).json({ error: 'Failed to fetch weight history', details: err.message });
  }
};
