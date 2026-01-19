const claimRepository = require('../repositories/claimRepository');
const userRepository = require('../repositories/userRepository');
const stateMachine = require('./claimStateMachine');

class ClaimService {
  /**
   * Submit a new claim
   */
  submitClaim(claimData, userId) {
    // Validation
    this.validateClaimData(claimData);

    // Get user's policy
    const user = userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.policy_id) {
      throw new Error('User does not have an assigned policy. Please contact support.');
    }

    // Business logic: create claim with user's policy
    return claimRepository.create({
      ...claimData,
      userId,
      policyId: user.policy_id
    });
  }

  /**
   * Get claims list with filters
   */
  getClaims(filters, userId, isAdmin) {
    return claimRepository.findAll({
      ...filters,
      userId,
      isAdmin
    });
  }

  /**
   * Get a single claim by ID
   */
  getClaimById(id, userId, isAdmin) {
    const claim = claimRepository.findById(id, isAdmin ? null : userId);
    if (!claim) {
      throw new Error('Claim not found');
    }
    return claim;
  }

  /**
   * Get claim status history
   */
  getClaimHistory(id, userId, isAdmin) {
    // Check if user has access to this claim
    const claim = this.getClaimById(id, userId, isAdmin);
    return claimRepository.getStatusHistory(id);
  }

  /**
   * Update claim status with state machine validation
   */
  updateClaimStatus(id, status, userId, isAdmin) {
    // Business rule: Only admin can change status
    if (!isAdmin) {
      throw new Error('Only administrators can update claim status');
    }

    // Get current claim
    const claim = claimRepository.findById(id);
    if (!claim) {
      throw new Error('Claim not found');
    }

    // Validate status transition using state machine
    const validation = stateMachine.validateTransition(claim.status, status);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Note: Notes are now handled separately via the notes API
    // Admins should add a note via POST /api/claims/:id/notes when updating status

    return claimRepository.updateStatus(id, status, userId, isAdmin);
  }

  /**
   * Assign agent to claim
   */
  assignAgent(claimId, agentId, assignedBy, isAdmin) {
    if (!isAdmin) {
      throw new Error('Only administrators can assign agents');
    }

    const claim = claimRepository.findById(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    return claimRepository.assignAgent(claimId, agentId, assignedBy);
  }

  /**
   * Get allowed status transitions for a claim
   */
  getAllowedTransitions(id, userId, isAdmin) {
    const claim = this.getClaimById(id, userId, isAdmin);
    return stateMachine.getAllowedTransitions(claim.status);
  }

  /**
   * Validate claim data
   */
  validateClaimData(data) {
    const errors = [];

    // Note: policyId is no longer required here - it's auto-set from user's policy

    if (!data.dateOfOccurrence) {
      errors.push('Date of occurrence is required');
    }

    if (!data.location || typeof data.location !== 'string' || data.location.trim().length === 0) {
      errors.push('Location is required');
    }

    const validCauses = ['Accident', 'Theft', 'Damage', 'Delay-Interruption', 'Other'];
    if (!data.cause || !validCauses.includes(data.cause)) {
      errors.push(`Cause must be one of: ${validCauses.join(', ')}`);
    }

    if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }
}

module.exports = new ClaimService();
