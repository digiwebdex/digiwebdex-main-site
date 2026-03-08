// Generic data routes - handles all table operations
const express = require('express');
const { pool } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Public tables that don't require authentication for reading
const PUBLIC_READ_TABLES = [
  'services',
  'service_packages',
  'domain_pricing',
  'hosting_packages',
  'blog_posts',
  'blog_categories',
  'blog_tags',
  'case_studies',
  'landing_pages',
  'location_pages',
  'homepage_sections',
  'bundle_discounts',
];

// Tables that allow public insert (guest submissions)
const PUBLIC_INSERT_TABLES = ['leads', 'contact_messages', 'domain_search_logs', 'consultation_bookings'];

// Parse filters from query params
function parseFilters(query) {
  const filters = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(query).forEach((key) => {
    if (key.startsWith('filter_')) {
      const filterStr = query[key];
      const match = filterStr.match(/^(\w+)\.(\w+)\.(.+)$/);
      if (match) {
        const [, column, operator, rawValue] = match;
        let value;
        try {
          value = JSON.parse(rawValue);
        } catch {
          value = rawValue;
        }

        // Map operators
        const opMap = {
          eq: '=',
          neq: '!=',
          gt: '>',
          gte: '>=',
          lt: '<',
          lte: '<=',
          like: 'LIKE',
          ilike: 'ILIKE',
          is: 'IS',
          in: 'IN',
        };

        const sqlOp = opMap[operator] || '=';

        if (operator === 'in' && Array.isArray(value)) {
          const placeholders = value.map((_, i) => `$${paramIndex + i}`).join(', ');
          filters.push(`"${column}" IN (${placeholders})`);
          values.push(...value);
          paramIndex += value.length;
        } else if (operator === 'is') {
          filters.push(`"${column}" IS ${value === null ? 'NULL' : 'NOT NULL'}`);
        } else {
          filters.push(`"${column}" ${sqlOp} $${paramIndex}`);
          values.push(operator === 'like' || operator === 'ilike' ? `%${value}%` : value);
          paramIndex++;
        }
      }
    }
  });

  return { filters, values, nextParamIndex: paramIndex };
}

// Build SELECT query
function buildSelectQuery(table, query, filters, values) {
  const selectColumns = query.select || '*';
  let sql = `SELECT ${selectColumns} FROM "${table}"`;

  if (filters.length > 0) {
    sql += ` WHERE ${filters.join(' AND ')}`;
  }

  if (query.order) {
    const [column, direction] = query.order.split('.');
    sql += ` ORDER BY "${column}" ${direction === 'desc' ? 'DESC' : 'ASC'}`;
  }

  if (query.limit) {
    sql += ` LIMIT ${parseInt(query.limit)}`;
  }

  if (query.offset) {
    sql += ` OFFSET ${parseInt(query.offset)}`;
  }

  return sql;
}

// GET - Select data
router.get('/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const isPublic = PUBLIC_READ_TABLES.includes(table);

    // Check authentication for non-public tables
    if (!isPublic && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { filters, values } = parseFilters(req.query);

    // For non-admin users, restrict to their own data
    if (req.user && !req.user.isAdmin && !req.user.isStaff) {
      const userFilteredTables = ['orders', 'invoices', 'payments', 'domains', 'hosting_accounts', 'support_tickets', 'notifications'];
      if (userFilteredTables.includes(table)) {
        filters.push(`"user_id" = $${values.length + 1}`);
        values.push(req.user.userId);
      }
    }

    const sql = buildSelectQuery(table, req.query, filters, values);
    const result = await pool.query(sql, values);

    res.json({ data: result.rows, count: result.rowCount });
  } catch (error) {
    console.error('Select error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// POST - Insert data
router.post('/:table', optionalAuth, async (req, res) => {
  try {
    const { table } = req.params;
    const isPublicInsert = PUBLIC_INSERT_TABLES.includes(table);

    if (!isPublicInsert && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let data = req.body;
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Add user_id for authenticated users if not provided
    if (req.user) {
      data = data.map((row) => ({
        ...row,
        user_id: row.user_id || req.user.userId,
      }));
    }

    const results = [];
    for (const row of data) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      const sql = `
        INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await pool.query(sql, values);
      results.push(result.rows[0]);

      // Broadcast for realtime
      const broadcast = req.app.get('broadcast');
      if (broadcast) {
        broadcast('postgres_changes', {
          schema: 'public',
          table,
          event: 'INSERT',
          new: result.rows[0],
        });
      }
    }

    res.json({ data: results.length === 1 ? results[0] : results });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Failed to insert data' });
  }
});

// PATCH - Update data
router.patch('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { data, filters: bodyFilters } = req.body;

    if (!data || !bodyFilters || bodyFilters.length === 0) {
      return res.status(400).json({ error: 'Data and filters required' });
    }

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      setClauses.push(`"${key}" = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    const whereClauses = [];
    bodyFilters.forEach((filter) => {
      whereClauses.push(`"${filter.column}" = $${paramIndex}`);
      values.push(filter.value);
      paramIndex++;
    });

    // Restrict non-admin users to their own data
    if (!req.user.isAdmin && !req.user.isStaff) {
      whereClauses.push(`"user_id" = $${paramIndex}`);
      values.push(req.user.userId);
    }

    const sql = `
      UPDATE "${table}"
      SET ${setClauses.join(', ')}, "updated_at" = NOW()
      WHERE ${whereClauses.join(' AND ')}
      RETURNING *
    `;

    const result = await pool.query(sql, values);

    // Broadcast for realtime
    const broadcast = req.app.get('broadcast');
    if (broadcast && result.rows.length > 0) {
      broadcast('postgres_changes', {
        schema: 'public',
        table,
        event: 'UPDATE',
        new: result.rows[0],
      });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// PUT - Upsert data
router.put('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { data, onConflict = 'id' } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data required' });
    }

    let rows = Array.isArray(data) ? data : [data];

    // Add user_id if not provided
    rows = rows.map((row) => ({
      ...row,
      user_id: row.user_id || req.user.userId,
    }));

    const results = [];
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const updateClauses = columns
        .filter((c) => c !== onConflict)
        .map((c) => `"${c}" = EXCLUDED."${c}"`)
        .join(', ');

      const sql = `
        INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')})
        VALUES (${placeholders})
        ON CONFLICT ("${onConflict}") DO UPDATE SET ${updateClauses}, "updated_at" = NOW()
        RETURNING *
      `;

      const result = await pool.query(sql, values);
      results.push(result.rows[0]);
    }

    res.json({ data: results.length === 1 ? results[0] : results });
  } catch (error) {
    console.error('Upsert error:', error);
    res.status(500).json({ error: 'Failed to upsert data' });
  }
});

// DELETE - Delete data
router.delete('/:table', authenticateToken, async (req, res) => {
  try {
    const { table } = req.params;
    const { filters: bodyFilters } = req.body;

    if (!bodyFilters || bodyFilters.length === 0) {
      return res.status(400).json({ error: 'Filters required for delete' });
    }

    const whereClauses = [];
    const values = [];
    let paramIndex = 1;

    bodyFilters.forEach((filter) => {
      whereClauses.push(`"${filter.column}" = $${paramIndex}`);
      values.push(filter.value);
      paramIndex++;
    });

    // Restrict non-admin users to their own data
    if (!req.user.isAdmin && !req.user.isStaff) {
      whereClauses.push(`"user_id" = $${paramIndex}`);
      values.push(req.user.userId);
    }

    const sql = `
      DELETE FROM "${table}"
      WHERE ${whereClauses.join(' AND ')}
      RETURNING *
    `;

    const result = await pool.query(sql, values);

    // Broadcast for realtime
    const broadcast = req.app.get('broadcast');
    if (broadcast && result.rows.length > 0) {
      broadcast('postgres_changes', {
        schema: 'public',
        table,
        event: 'DELETE',
        old: result.rows[0],
      });
    }

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

module.exports = router;
