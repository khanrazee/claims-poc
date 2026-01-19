const authService = require('../services/authService');

class AuthController {
  /**
   * POST /auth/login - Login with email and password
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const user = authService.login(email, password);

      // Store user in session
      req.session.user = user;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /auth/logout - Logout and destroy session
   */
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to logout'
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  }

  /**
   * GET /auth/me - Get current user from session
   */
  async me(req, res) {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    // Validate user still exists and is active
    const user = authService.validateUser(req.session.user.id);

    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        error: 'User no longer active'
      });
    }

    res.json({
      success: true,
      data: user
    });
  }

  /**
   * POST /auth/accept-invite/:token - Accept invitation and set password
   */
  async acceptInvite(req, res) {
    try {
      const { token } = req.params;
      const { password, firstName, lastName } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters'
        });
      }

      const user = authService.acceptInvite(token, password, firstName, lastName);

      // Store user in session
      req.session.user = user;

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
