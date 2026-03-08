const jwt = require('jsonwebtoken');
const { queryOne } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate tokens
function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Middleware: Authenticate
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware: Require specific role
function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const userRole = await queryOne(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [req.user.id]
    );

    if (!userRole || !roles.includes(userRole.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    req.user.role = userRole.role;
    next();
  };
}

// Middleware: Require admin
function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
}

// Middleware: Require admin or staff
function requireAdminOrStaff(req, res, next) {
  return requireRole('admin', 'staff')(req, res, next);
}

// Check permission using role_permissions table
async function hasPermission(userId, module, action) {
  const result = await queryOne(
    `SELECT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN role_permissions rp ON ur.role = rp.role
      WHERE ur.user_id = $1 AND rp.module = $2 AND rp.action = $3 AND rp.allowed = true
    ) AS has_perm`,
    [userId, module, action]
  );
  return result?.has_perm || false;
}

module.exports = {
  JWT_SECRET,
  generateAccessToken,
  generateRefreshToken,
  authenticate,
  requireRole,
  requireAdmin,
  requireAdminOrStaff,
  hasPermission,
};
