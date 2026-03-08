const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'digiwebdex',
  user: process.env.DB_USER || 'digiwebdex',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Helper: Execute query
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn('Slow query:', { text: text.substring(0, 100), duration, rows: res.rowCount });
  }
  return res;
}

// Helper: Get single row
async function queryOne(text, params) {
  const res = await query(text, params);
  return res.rows[0] || null;
}

// Helper: Get rows
async function queryAll(text, params) {
  const res = await query(text, params);
  return res.rows;
}

// Helper: Paginated query
async function queryPaginated(baseQuery, params, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) AS count_query`;
  const paginatedQuery = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

  const [dataRes, countRes] = await Promise.all([
    query(paginatedQuery, [...params, limit, offset]),
    query(countQuery, params),
  ]);

  return {
    data: dataRes.rows,
    total: parseInt(countRes.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
  };
}

module.exports = { pool, query, queryOne, queryAll, queryPaginated };
