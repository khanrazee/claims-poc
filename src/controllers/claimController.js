const claimService = require('../services/claimService');

class ClaimController {
  /**
   * POST /claims - Create a new claim
   */
  async createClaim(req, res) {
    try {
      const claimData = {
        // policyId is auto-set from user's assigned policy
        dateOfOccurrence: req.body.dateOfOccurrence,
        location: req.body.location,
        cause: req.body.cause,
        description: req.body.description,
        documents: req.files ? req.files.map(f => f.filename) : []
      };

      const claim = claimService.submitClaim(claimData, req.user.id);

      res.status(201).json({
        success: true,
        data: claim
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /claims - List claims
   */
  async listClaims(req, res) {
    try {
      const filters = {
        status: req.query.status,
        assignedAgentId: req.query.assignedAgentId,
        search: req.query.search,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      const claims = claimService.getClaims(
        filters,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: claims,
        count: claims.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /claims/:id - Get a single claim
   */
  async getClaim(req, res) {
    try {
      const claim = claimService.getClaimById(
        req.params.id,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: claim
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /claims/:id/history - Get claim status history
   */
  async getClaimHistory(req, res) {
    try {
      const history = claimService.getClaimHistory(
        req.params.id,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /claims/:id/transitions - Get allowed status transitions
   */
  async getAllowedTransitions(req, res) {
    try {
      const transitions = claimService.getAllowedTransitions(
        req.params.id,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: transitions
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * PATCH /claims/:id - Update claim status
   */
  async updateClaimStatus(req, res) {
    try {
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }

      const claim = claimService.updateClaimStatus(
        req.params.id,
        status,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: claim
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /claims/:id/assign - Assign agent to claim
   */
  async assignAgent(req, res) {
    try {
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: 'Agent ID is required'
        });
      }

      const claim = claimService.assignAgent(
        req.params.id,
        agentId,
        req.user.id,
        req.user.role === 'admin'
      );

      res.json({
        success: true,
        data: claim
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ClaimController();
