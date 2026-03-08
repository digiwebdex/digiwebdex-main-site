const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [
      ordersToday,
      ordersMonth,
      revenueMonth,
      leadsToday,
      ticketsOpen,
      usersTotal,
      pendingPayments
    ] = await Promise.all([
      queryOne(`SELECT COUNT(*) FROM orders WHERE created_at >= $1`, [oneDayAgo]),
      queryOne(`SELECT COUNT(*) FROM orders WHERE created_at >= $1`, [thirtyDaysAgo]),
      queryOne(`SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE created_at >= $1 AND status != 'cancelled'`, [thirtyDaysAgo]),
      queryOne(`SELECT COUNT(*) FROM leads WHERE created_at >= $1`, [oneDayAgo]),
      queryOne(`SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress')`),
      queryOne(`SELECT COUNT(*) FROM users`),
      queryOne(`SELECT COUNT(*) FROM manual_payments WHERE status = 'pending'`),
    ]);

    res.json({
      stats: {
        ordersToday: parseInt(ordersToday.count),
        ordersMonth: parseInt(ordersMonth.count),
        revenueMonth: parseFloat(revenueMonth.total),
        leadsToday: parseInt(leadsToday.count),
        ticketsOpen: parseInt(ticketsOpen.count),
        usersTotal: parseInt(usersTotal.count),
        pendingPayments: parseInt(pendingPayments.count),
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

    const [revenueByDay, ordersByStatus, serviceRevenue] = await Promise.all([
      queryAll(
        `SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders
         FROM orders WHERE created_at >= $1 AND status != 'cancelled'
         GROUP BY DATE(created_at) ORDER BY date`,
        [thirtyDaysAgo]
      ),
      queryAll(
        `SELECT status, COUNT(*) as count FROM orders WHERE created_at >= $1 GROUP BY status`,
        [thirtyDaysAgo]
      ),
      queryAll(
        `SELECT service_type, SUM(total) as revenue, COUNT(*) as orders
         FROM orders WHERE created_at >= $1 AND status != 'cancelled'
         GROUP BY service_type ORDER BY revenue DESC`,
        [thirtyDaysAgo]
      ),
    ]);

    res.json({ revenueByDay, ordersByStatus, serviceRevenue });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// GET /api/admin/settings
router.get('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const settings = await queryAll('SELECT * FROM system_settings ORDER BY key');
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings/:key
router.put('/settings/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const { value, description } = req.body;
    await query(
      `INSERT INTO system_settings (key, value, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO UPDATE SET value = $2, description = COALESCE($3, system_settings.description), updated_at = NOW()`,
      [req.params.key, value, description]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, action, entity_type } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (action) {
      params.push(action);
      whereClause += ` AND action = $${params.length}`;
    }
    if (entity_type) {
      params.push(entity_type);
      whereClause += ` AND entity_type = $${params.length}`;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const logs = await queryAll(
      `SELECT al.*, p.full_name as user_name
       FROM audit_logs al
       LEFT JOIN profiles p ON al.user_id = p.user_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Verify manual payment
router.post('/payments/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const { approved, notes } = req.body;
    const payment = await queryOne('SELECT * FROM manual_payments WHERE id = $1', [req.params.id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const status = approved ? 'success' : 'failed';
    await query(
      `UPDATE manual_payments SET status = $1, admin_notes = $2, verified_by = $3, verified_at = NOW()
       WHERE id = $4`,
      [status, notes, req.user.id, req.params.id]
    );

    if (approved) {
      // Update order status
      await query(`UPDATE orders SET status = 'paid' WHERE id = $1`, [payment.order_id]);
      // Update invoice
      await query(
        `UPDATE invoices SET status = 'paid', paid_at = NOW() WHERE order_id = $1`,
        [payment.order_id]
      );
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
       VALUES ($1, $2, 'payment', $3, $4)`,
      [req.user.id, approved ? 'payment_approved' : 'payment_rejected', req.params.id, { approved, notes }]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

module.exports = router;
