const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/affiliates/me - Current user's affiliate
router.get('/me', authenticate, async (req, res) => {
  try {
    const affiliate = await queryOne(
      `SELECT a.*, p.full_name, p.phone, p.email
       FROM affiliates a
       JOIN profiles p ON a.user_id = p.user_id
       WHERE a.user_id = $1`,
      [req.user.id]
    );

    if (!affiliate) return res.status(404).json({ error: 'Not an affiliate' });

    // Get recent commissions
    const commissions = await queryAll(
      `SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [affiliate.id]
    );

    res.json({ affiliate, commissions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch affiliate data' });
  }
});

// POST /api/affiliates/apply - Apply for affiliate program
router.post('/apply', authenticate, async (req, res) => {
  try {
    const existing = await queryOne('SELECT id FROM affiliates WHERE user_id = $1', [req.user.id]);
    if (existing) return res.status(400).json({ error: 'Already registered as affiliate' });

    const { payment_method, payment_details } = req.body;

    // Generate referral code
    const codeResult = await queryOne('SELECT generate_referral_code() as code');

    const result = await query(
      `INSERT INTO affiliates (user_id, referral_code, payment_method, payment_details)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, codeResult.code, payment_method, payment_details || {}]
    );

    res.status(201).json({ success: true, affiliate: result.rows[0] });
  } catch (err) {
    console.error('Affiliate apply error:', err);
    res.status(500).json({ error: 'Failed to apply for affiliate program' });
  }
});

// POST /api/affiliates/click - Track click (public)
router.post('/click', async (req, res) => {
  try {
    const { referral_code, landing_page, referrer_url } = req.body;
    if (!referral_code) return res.status(400).json({ error: 'Referral code required' });

    const affiliate = await queryOne(
      `SELECT id FROM affiliates WHERE referral_code = $1 AND status = 'active'`,
      [referral_code.toUpperCase()]
    );
    if (!affiliate) return res.status(404).json({ error: 'Invalid referral code' });

    // Record click
    const result = await query(
      `INSERT INTO affiliate_clicks (affiliate_id, ip_address, user_agent, referrer_url, landing_page, country, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        affiliate.id,
        req.headers['x-forwarded-for'] || req.ip,
        req.headers['user-agent'],
        referrer_url,
        landing_page,
        null, // Could use IP geolocation
        req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop'
      ]
    );

    // Update click count
    await query('UPDATE affiliates SET total_clicks = total_clicks + 1 WHERE id = $1', [affiliate.id]);

    res.json({ success: true, click_id: result.rows[0].id });
  } catch (err) {
    console.error('Affiliate click error:', err);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// GET /api/affiliates - Admin list
router.get('/', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      whereClause += ` AND a.status = $${params.length}`;
    }

    const baseQuery = `
      SELECT a.*, p.full_name, p.phone, u.email
      FROM affiliates a
      JOIN profiles p ON a.user_id = p.user_id
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch affiliates' });
  }
});

// PATCH /api/affiliates/:id - Admin update
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, commission_rate, notes } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { 
      updates.push(`status = $${idx++}`); 
      values.push(status);
      if (status === 'active') {
        updates.push('approved_at = NOW()');
        updates.push(`approved_by = $${idx++}`);
        values.push(req.user.id);
      }
    }
    if (commission_rate !== undefined) { updates.push(`commission_rate = $${idx++}`); values.push(commission_rate); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    updates.push(`updated_at = NOW()`);

    values.push(req.params.id);
    const result = await query(
      `UPDATE affiliates SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Affiliate not found' });

    res.json({ success: true, affiliate: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update affiliate' });
  }
});

// POST /api/affiliates/:id/withdrawal
router.post('/:id/withdrawal', authenticate, async (req, res) => {
  try {
    const affiliate = await queryOne('SELECT * FROM affiliates WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

    const { amount, payment_method, payment_details } = req.body;
    if (!amount || amount < affiliate.min_withdrawal_amount) {
      return res.status(400).json({ error: `Minimum withdrawal amount is ${affiliate.min_withdrawal_amount}` });
    }
    if (amount > affiliate.withdrawable_earnings) {
      return res.status(400).json({ error: 'Insufficient withdrawable balance' });
    }

    const result = await query(
      `INSERT INTO affiliate_withdrawals (affiliate_id, amount, payment_method, payment_details)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, amount, payment_method || affiliate.payment_method, payment_details || affiliate.payment_details]
    );

    // Reduce withdrawable earnings
    await query(
      `UPDATE affiliates SET withdrawable_earnings = withdrawable_earnings - $1 WHERE id = $2`,
      [amount, req.params.id]
    );

    res.status(201).json({ success: true, withdrawal: result.rows[0] });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
});

module.exports = router;
