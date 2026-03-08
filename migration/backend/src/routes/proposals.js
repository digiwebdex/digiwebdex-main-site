const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/proposals
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const baseQuery = `SELECT * FROM proposals ${whereClause} ORDER BY created_at DESC`;
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// GET /api/proposals/:id
router.get('/:id', async (req, res) => {
  try {
    const proposal = await queryOne('SELECT * FROM proposals WHERE id = $1', [req.params.id]);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// POST /api/proposals
router.post('/', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const {
      client_name, client_email, client_phone, client_company,
      title, summary, items, subtotal, discount, tax, total,
      valid_until, terms, notes, template_id
    } = req.body;

    // Generate proposal number
    const proposalNumber = await queryOne("SELECT generate_proposal_number() as num");

    const result = await query(
      `INSERT INTO proposals (
        proposal_number, client_name, client_email, client_phone, client_company,
        title, summary, items, subtotal, discount, tax, total,
        valid_until, expiry_date, terms, notes, template_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        proposalNumber.num, client_name, client_email, client_phone, client_company,
        title, summary, items || [], subtotal || 0, discount || 0, tax || 0, total || 0,
        valid_until, terms, notes, template_id, req.user.id
      ]
    );

    res.status(201).json({ success: true, proposal: result.rows[0] });
  } catch (err) {
    console.error('Create proposal error:', err);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// PATCH /api/proposals/:id
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, items, subtotal, discount, tax, total, terms, notes } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { 
      updates.push(`status = $${idx++}`); 
      values.push(status);
      if (status === 'sent') updates.push('sent_at = NOW()');
      if (status === 'accepted') updates.push('accepted_at = NOW()');
      if (status === 'rejected') updates.push('rejected_at = NOW()');
    }
    if (items) { updates.push(`items = $${idx++}`); values.push(JSON.stringify(items)); }
    if (subtotal !== undefined) { updates.push(`subtotal = $${idx++}`); values.push(subtotal); }
    if (discount !== undefined) { updates.push(`discount = $${idx++}`); values.push(discount); }
    if (tax !== undefined) { updates.push(`tax = $${idx++}`); values.push(tax); }
    if (total !== undefined) { updates.push(`total = $${idx++}`); values.push(total); }
    if (terms !== undefined) { updates.push(`terms = $${idx++}`); values.push(terms); }
    if (notes !== undefined) { updates.push(`notes = $${idx++}`); values.push(notes); }
    updates.push(`updated_at = NOW()`);

    values.push(req.params.id);
    const result = await query(
      `UPDATE proposals SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Proposal not found' });

    // Log action
    await query(
      `INSERT INTO proposal_logs (proposal_id, action, details, performed_by)
       VALUES ($1, $2, $3, $4)`,
      [req.params.id, `status_changed_to_${status || 'updated'}`, req.body, req.user.id]
    );

    res.json({ success: true, proposal: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// POST /api/proposals/:id/send
router.post('/:id/send', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const proposal = await queryOne('SELECT * FROM proposals WHERE id = $1', [req.params.id]);
    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

    // Update status to sent
    await query(
      `UPDATE proposals SET status = 'sent', sent_at = NOW() WHERE id = $1`,
      [req.params.id]
    );

    // TODO: Send email/SMS notification to client

    await query(
      `INSERT INTO proposal_logs (proposal_id, action, performed_by) VALUES ($1, 'sent', $2)`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Proposal sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send proposal' });
  }
});

module.exports = router;
