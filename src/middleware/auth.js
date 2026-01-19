const authService = require('../services/authService');

/**
 * Session-based authentication middleware
 */
function authenticate(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.'
    });
  }

  // Validate user still exists and is active
  const user = authService.validateUser(req.session.user.id);

  if (!user) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      error: 'User no longer active. Please log in again.'
    });
  }

  req.user = user;
  next();
}

/**
 * Admin-only middleware
 */
// TODO: Better: To move the admins into its own table and remove all this logic from here and have a admin/auth.js
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

/**
 * Optional authentication - sets req.user if session exists
 */
function optionalAuth(req, res, next) {
  if (req.session && req.session.user) {
    const user = authService.validateUser(req.session.user.id);
    if (user) {
      req.user = user;
    }
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
