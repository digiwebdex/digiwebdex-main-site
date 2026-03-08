const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../db');
const { generateAccessToken, generateRefreshToken, authenticate, JWT_SECRET } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone, company_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check existing
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    await query(
      `INSERT INTO users (id, email, password_hash, raw_user_meta_data)
       VALUES ($1, $2, $3, $4)`,
      [userId, email.toLowerCase(), passwordHash, JSON.stringify({ full_name })]
    );

    // Create profile
    await query(
      `INSERT INTO profiles (user_id, full_name, phone, company_name)
       VALUES ($1, $2, $3, $4)`,
      [userId, full_name, phone, company_name]
    );

    // Create default role
    await query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'client')`,
      [userId]
    );

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await query(
      `INSERT INTO email_verification_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [userId, verifyToken]
    );

    // TODO: Send verification email via nodemailer

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: { id: userId, email: email.toLowerCase() },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await queryOne(
      `SELECT u.id, u.email, u.password_hash, u.email_verified, u.is_active,
              ur.role, p.full_name, p.phone, p.avatar_url
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last sign in
    await query('UPDATE users SET last_sign_in_at = NOW() WHERE id = $1', [user.id]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, refreshToken]
    );

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
        avatar_url: user.avatar_url,
        email_verified: user.email_verified,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refresh_token, JWT_SECRET);
    
    const stored = await queryOne(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND revoked_at IS NULL AND expires_at > NOW()`,
      [refresh_token, decoded.sub]
    );
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

    const user = await queryOne(
      `SELECT u.id, u.email, ur.role FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id WHERE u.id = $1`,
      [decoded.sub]
    );
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Revoke old token
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [stored.id]);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, newRefreshToken]
    );

    res.json({ access_token: newAccessToken, refresh_token: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await queryOne(
      `SELECT u.id, u.email, u.email_verified, u.created_at, u.last_sign_in_at,
              ur.role, p.full_name, p.phone, p.company_name, p.avatar_url, p.balance_due,
              p.address, p.city, p.country
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await queryOne('SELECT id FROM users WHERE email = $1', [email?.toLowerCase()]);
    
    // Always return success to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
        [user.id, token]
      );
      // TODO: Send password reset email
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const resetToken = await queryOne(
      `SELECT user_id FROM password_reset_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    );
    if (!resetToken) return res.status(400).json({ error: 'Invalid or expired reset token' });

    const passwordHash = await bcrypt.hash(password, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetToken.user_id]);
    await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1', [token]);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const verifyToken = await queryOne(
      `SELECT user_id FROM email_verification_tokens WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    );
    if (!verifyToken) return res.status(400).json({ error: 'Invalid or expired token' });

    await query('UPDATE users SET email_verified = true, email_verified_at = NOW() WHERE id = $1', [verifyToken.user_id]);
    await query('UPDATE email_verification_tokens SET used_at = NOW() WHERE token = $1', [token]);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Email verification failed' });
  }
});

module.exports = router;
