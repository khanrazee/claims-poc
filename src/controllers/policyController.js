const policyService = require('../services/policyService');

class PolicyController {
  /**
   * POST /api/policies - Create new policy
   */
  async createPolicy(req, res) {
    try {
      const policy = policyService.createPolicy(
        req.body,
        req.user.id,
        req.user.role === 'admin'
      );

      return res.status(201).json({
        success: true,
        data: policy
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/policies - List all policies
   */
  async listPolicies(req, res) {
    try {
      const filters = {
        status: req.query.status,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      const policies = policyService.getPolicies(filters);

      return res.json({
        success: true,
        data: policies,
        count: policies.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/policies/active - List active policies only
   */
  async listActivePolicies(req, res) {
    try {
      const policies = policyService.getActivePolicies();

      return res.json({
        success: true,
        data: policies,
        count: policies.length
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/policies/:id - Get single policy
   */
  async getPolicy(req, res) {
    try {
      const policy = policyService.getPolicyById(req.params.id);

      return res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PATCH /api/policies/:id - Update policy
   */
  async updatePolicy(req, res) {
    try {
      const policy = policyService.updatePolicy(
        req.params.id,
        req.body,
        req.user.role === 'admin'
      );

      return res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * DELETE /api/policies/:id - Delete policy (soft delete)
   */
  async deletePolicy(req, res) {
    try {
      const policy = policyService.deletePolicy(
        req.params.id,
        req.user.role === 'admin'
      );

      return res.json({
        success: true,
        data: policy
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PolicyController();
