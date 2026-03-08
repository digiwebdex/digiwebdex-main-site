const express = require('express');
const { query, queryOne, queryAll } = require('../db');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// GET /api/users
router.get('/', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (role) {
      params.push(role);
      whereClause += ` AND ur.role = $${params.length}`;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const users = await queryAll(
      `SELECT u.id, u.email, u.email_verified, u.is_active, u.created_at, u.last_sign_in_at,
              p.full_name, p.phone, p.company_name, p.avatar_url, p.balance_due,
              ur.role
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({ users });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    if (!isAdmin && req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await queryOne(
      `SELECT u.id, u.email, u.email_verified, u.is_active, u.created_at, u.last_sign_in_at,
              p.full_name, p.phone, p.company_name, p.avatar_url, p.address, p.city, p.country, p.balance_due,
              ur.role
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       WHERE u.id = $1`,
      [req.params.id]
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const isAdmin = ['admin', 'staff'].includes(req.user.role);
    if (!isAdmin && req.params.id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { full_name, phone, company_name, address, city, country, avatar_url, role, is_active } = req.body;

    // Update profile
    const profileUpdates = [];
    const profileValues = [];
    let idx = 1;

    if (full_name) { profileUpdates.push(`full_name = $${idx++}`); profileValues.push(full_name); }
    if (phone) { profileUpdates.push(`phone = $${idx++}`); profileValues.push(phone); }
    if (company_name !== undefined) { profileUpdates.push(`company_name = $${idx++}`); profileValues.push(company_name); }
    if (address !== undefined) { profileUpdates.push(`address = $${idx++}`); profileValues.push(address); }
    if (city !== undefined) { profileUpdates.push(`city = $${idx++}`); profileValues.push(city); }
    if (country !== undefined) { profileUpdates.push(`country = $${idx++}`); profileValues.push(country); }
    if (avatar_url !== undefined) { profileUpdates.push(`avatar_url = $${idx++}`); profileValues.push(avatar_url); }
    
    if (profileUpdates.length > 0) {
      profileUpdates.push(`updated_at = NOW()`);
      profileValues.push(req.params.id);
      await query(
        `UPDATE profiles SET ${profileUpdates.join(', ')} WHERE user_id = $${idx}`,
        profileValues
      );
    }

    // Admin-only updates
    if (isAdmin) {
      if (role) {
        await query(
          `UPDATE user_roles SET role = $1 WHERE user_id = $2`,
          [role, req.params.id]
        );
      }
      if (is_active !== undefined) {
        await query('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, req.params.id]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /api/users (admin create) - replaces admin-create-user edge function
router.post('/', authenticate, requireAdminOrStaff, async (req, res) => {
  try {
    const { email, password, full_name, phone, company_name, role, city, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await query(
      `INSERT INTO users (id, email, password_hash, email_verified, raw_user_meta_data)
       VALUES ($1, $2, $3, true, $4)`,
      [userId, email.toLowerCase(), passwordHash, JSON.stringify({ full_name })]
    );

    await query(
      `INSERT INTO profiles (user_id, full_name, phone, company_name, city, address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, full_name, phone, company_name, city, address]
    );

    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`,
      [userId, role || 'client']
    );

    res.status(201).json({ success: true, user_id: userId });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
