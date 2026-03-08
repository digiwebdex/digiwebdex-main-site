const express = require('express');
const { query, queryOne, queryAll, queryPaginated } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/domains/pricing - Public
router.get('/pricing', async (req, res) => {
  try {
    const pricing = await queryAll(
      'SELECT * FROM domain_pricing WHERE is_active = true ORDER BY sort_order, tld'
    );
    res.json({ pricing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// POST /api/domains/search - Public WHOIS lookup
router.post('/search', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: 'Domain name required' });

    const cleanDomain = domain.toLowerCase().trim();
    const parts = cleanDomain.split('.');
    const name = parts[0];
    const tld = parts.slice(1).join('.') || 'com';

    // Log search
    await query(
      `INSERT INTO domain_search_logs (domain_name, tld, ip_address, search_source)
       VALUES ($1, $2, $3, 'website')`,
      [name, tld, req.headers['x-forwarded-for'] || req.ip]
    );

    // Check pricing
    const pricing = await queryOne('SELECT * FROM domain_pricing WHERE tld = $1', [tld]);
    
    // For now, return mock availability (in production, integrate with registrar API)
    const available = Math.random() > 0.3; // Mock

    res.json({
      domain: `${name}.${tld}`,
      available,
      price: pricing?.base_price || 1200,
      renewal_price: pricing?.renewal_price || 1400,
      suggestions: [
        { domain: `${name}.com`, available: true, price: 1200 },
        { domain: `${name}.net`, available: true, price: 1100 },
        { domain: `${name}.com.bd`, available: true, price: 1500 },
      ],
    });
  } catch (err) {
    console.error('Domain search error:', err);
    res.status(500).json({ error: 'Domain search failed' });
  }
});

// GET /api/domains - User domains
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (!isAdmin) {
      params.push(req.user.id);
      whereClause += ` AND user_id = $${params.length}`;
    }

    const baseQuery = `SELECT * FROM domains ${whereClause} ORDER BY created_at DESC`;
    const result = await queryPaginated(baseQuery, params, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch domains' });
  }
});

// GET /api/domains/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const domain = await queryOne('SELECT * FROM domains WHERE id = $1', [req.params.id]);
    if (!domain) return res.status(404).json({ error: 'Domain not found' });

    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    if (!isAdmin && domain.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ domain });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch domain' });
  }
});

// PATCH /api/domains/:id
router.patch('/:id', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { status, nameservers, dns_records, auto_renew, whois_privacy } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (status) { updates.push(`status = $${idx++}`); values.push(status); }
    if (nameservers) { updates.push(`nameservers = $${idx++}`); values.push(JSON.stringify(nameservers)); }
    if (dns_records) { updates.push(`dns_records = $${idx++}`); values.push(JSON.stringify(dns_records)); }
    if (auto_renew !== undefined) { updates.push(`auto_renew = $${idx++}`); values.push(auto_renew); }
    if (whois_privacy !== undefined) { updates.push(`whois_privacy = $${idx++}`); values.push(whois_privacy); }
    updates.push(`updated_at = NOW()`);

    values.push(req.params.id);
    const result = await query(
      `UPDATE domains SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Domain not found' });

    // Log action
    await query(
      `INSERT INTO domain_logs (domain_id, action, details, performed_by)
       VALUES ($1, 'updated', $2, $3)`,
      [req.params.id, req.body, req.user.id]
    );

    res.json({ success: true, domain: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update domain' });
  }
});

module.exports = router;
