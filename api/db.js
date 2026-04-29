const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function initDb() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id SERIAL PRIMARY KEY,
        date DATE UNIQUE NOT NULL,
        total_calories INTEGER DEFAULT 0,
        total_protein DECIMAL DEFAULT 0,
        total_carbs DECIMAL DEFAULT 0,
        total_fat DECIMAL DEFAULT 0,
        total_sodium DECIMAL DEFAULT 0,
        calories_burned INTEGER DEFAULT 0,
        training_type VARCHAR(50) DEFAULT 'rest',
        training_duration INTEGER DEFAULT 0,
        water_liters DECIMAL DEFAULT 0,
        weight DECIMAL,
        ai_feedback TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS food_entries (
        id SERIAL PRIMARY KEY,
        daily_log_id INTEGER REFERENCES daily_logs(id),
        date DATE NOT NULL,
        food_name TEXT NOT NULL,
        calories INTEGER DEFAULT 0,
        protein DECIMAL DEFAULT 0,
        carbs DECIMAL DEFAULT 0,
        fat DECIMAL DEFAULT 0,
        sodium DECIMAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS weight_entries (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        weight DECIMAL NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

async function upsertDailyLog(client, date) {
  const res = await client.query(
    `INSERT INTO daily_logs (date) VALUES ($1)
     ON CONFLICT (date) DO UPDATE SET date = EXCLUDED.date
     RETURNING *`,
    [date]
  );
  return res.rows[0];
}

async function recalcDailyLog(client, date) {
  const logRes = await client.query(
    'SELECT id FROM daily_logs WHERE date = $1',
    [date]
  );
  if (!logRes.rows[0]) return null;
  const logId = logRes.rows[0].id;

  const totals = await client.query(
    `SELECT
       COALESCE(SUM(calories), 0)::integer AS total_calories,
       COALESCE(SUM(protein), 0)           AS total_protein,
       COALESCE(SUM(carbs), 0)             AS total_carbs,
       COALESCE(SUM(fat), 0)               AS total_fat,
       COALESCE(SUM(sodium), 0)            AS total_sodium
     FROM food_entries
     WHERE date = $1`,
    [date]
  );
  const t = totals.rows[0];

  const updated = await client.query(
    `UPDATE daily_logs
     SET total_calories = $1, total_protein = $2, total_carbs = $3,
         total_fat = $4, total_sodium = $5
     WHERE id = $6
     RETURNING *`,
    [t.total_calories, t.total_protein, t.total_carbs, t.total_fat, t.total_sodium, logId]
  );
  return updated.rows[0];
}

module.exports = { getPool, initDb, upsertDailyLog, recalcDailyLog };
