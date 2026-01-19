const policyRepository = require('../repositories/policyRepository');

class PolicyService {
  /**
   * Create a new policy
   */
  createPolicy(policyData, createdById, isAdmin) {
    if (!isAdmin) {
      throw new Error('Only administrators can create policies');
    }

    // Validate required fields
    if (!policyData.name || !policyData.name.trim()) {
      throw new Error('Policy name is required');
    }
    if (!policyData.description || !policyData.description.trim()) {
      throw new Error('Policy description is required');
    }
    if (!policyData.effectiveAtDate) {
      throw new Error('Effective date is required');
    }

    // Validate status
    const validStatuses = ['active', 'draft', 'cancelled'];
    if (policyData.status && !validStatuses.includes(policyData.status)) {
      throw new Error('Invalid policy status');
    }

    return policyRepository.create({
      name: policyData.name.trim(),
      description: policyData.description.trim(),
      createdById,
      status: policyData.status || 'draft',
      effectiveAtDate: policyData.effectiveAtDate
    });
  }

  /**
   * Get all policies
   */
  getPolicies(filters = {}) {
    return policyRepository.findAll(filters);
  }

  /**
   * Get active policies only
   */
  getActivePolicies() {
    return policyRepository.findActive();
  }

  /**
   * Get policy by ID
   */
  getPolicyById(id) {
    const policy = policyRepository.findById(id);
    if (!policy) {
      throw new Error('Policy not found');
    }
    return policy;
  }

  /**
   * Update policy
   */
  updatePolicy(id, policyData, isAdmin) {
    if (!isAdmin) {
      throw new Error('Only administrators can update policies');
    }

    const policy = policyRepository.findById(id);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Validate status if provided
    if (policyData.status) {
      const validStatuses = ['active', 'draft', 'cancelled'];
      if (!validStatuses.includes(policyData.status)) {
        throw new Error('Invalid policy status');
      }
    }

    return policyRepository.update(id, policyData);
  }

  /**
   * Delete policy (soft delete)
   */
  deletePolicy(id, isAdmin) {
    if (!isAdmin) {
      throw new Error('Only administrators can delete policies');
    }

    const policy = policyRepository.findById(id);
    if (!policy) {
      throw new Error('Policy not found');
    }

    return policyRepository.delete(id);
  }
}

module.exports = new PolicyService();
