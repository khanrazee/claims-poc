const userService = require('../services/userService');

class UserController {
  /**
   * POST /users - Create new user with invite
   */
  async createUser(req, res) {
    try {
      const { email, role, firstName, lastName, policyId } = req.body;

      const result = userService.createUser(
        { email, role, firstName, lastName, policyId },
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /users - List all users
   */
  async listUsers(req, res) {
    try {
      const { role, isActive } = req.query;

      const users = userService.getUsers({
        role,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      });

      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /users/:id - Get user by ID
   */
  async getUser(req, res) {
    try {
      const user = userService.getUserById(req.params.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PATCH /users/:id - Update user
   */
  async updateUser(req, res) {
    try {
      const { firstName, lastName, isActive } = req.body;

      const user = userService.updateUser(req.params.id, {
        firstName,
        lastName,
        isActive
      });

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

  /**
   * DELETE /users/:id - Deactivate user
   */
  async deactivateUser(req, res) {
    try {
      const user = userService.deactivateUser(req.params.id);

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

  /**
   * GET /users/agents - Get all active agents
   */
  async getAgents(req, res) {
    try {
      const agents = userService.getActiveAgents();

      res.json({
        success: true,
        data: agents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
