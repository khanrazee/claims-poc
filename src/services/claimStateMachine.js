/**
 * Claim Status State Machine
 *
 * Rules:
 * - submitted → inReview (agent starts reviewing)
 * - inReview → approved (claim accepted)
 * - inReview → rejected (claim denied, cannot be reopened)
 * - inReview → cancelled (customer cancelled, cannot be reopened)
 * - submitted → cancelled (customer cancelled before review)
 *
 * Terminal states (no transitions allowed):
 * - approved
 * - rejected
 * - cancelled
 */

const STATE_TRANSITIONS = {
  'submitted': ['inReview', 'cancelled'],
  'inReview': ['approved', 'rejected', 'cancelled'],
  'approved': [], // Terminal state
  'rejected': [], // Terminal state
  'cancelled': [] // Terminal state
};

class ClaimStateMachine {
  /**
   * Check if a status transition is valid
   */
  canTransition(fromStatus, toStatus) {
    const allowedTransitions = STATE_TRANSITIONS[fromStatus];

    if (!allowedTransitions) {
      return false;
    }

    return allowedTransitions.includes(toStatus);
  }

  /**
   * Get all valid transitions from a given status
   */
  getAllowedTransitions(fromStatus) {
    return STATE_TRANSITIONS[fromStatus] || [];
  }

  /**
   * Check if a status is terminal (no further transitions)
   */
  isTerminalState(status) {
    const transitions = STATE_TRANSITIONS[status];
    return transitions && transitions.length === 0;
  }

  /**
   * Get human-readable reason for invalid transition
   */
  getTransitionError(fromStatus, toStatus) {
    if (!STATE_TRANSITIONS[fromStatus]) {
      return `Invalid current status: ${fromStatus}`;
    }

    if (this.isTerminalState(fromStatus)) {
      return `Cannot change status from '${fromStatus}' as it is a final state. Please create a new claim.`;
    }

    const allowed = this.getAllowedTransitions(fromStatus);
    return `Cannot transition from '${fromStatus}' to '${toStatus}'. Allowed transitions: ${allowed.join(', ')}`;
  }

  /**
   * Validate transition and return result
   */
  validateTransition(fromStatus, toStatus) {
    const isValid = this.canTransition(fromStatus, toStatus);

    return {
      valid: isValid,
      error: isValid ? null : this.getTransitionError(fromStatus, toStatus)
    };
  }
}

module.exports = new ClaimStateMachine();
