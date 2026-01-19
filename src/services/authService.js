const userRepository = require('../repositories/userRepository');

class AuthService {
  /**
   * Login with email and password
   */
  login(email, password) {
    const user = userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Account is not active. Please check your email for the invitation link.');
    }

    if (!userRepository.verifyPassword(user, password)) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      policyId: user.policy_id,
      policyName: user.policy_name,
      policyDescription: user.policy_description,
      policyStatus: user.policy_status
    };
  }

  /**
   * Accept invitation and set password
   */
  acceptInvite(token, password, firstName, lastName) {
    const user = userRepository.findByInviteToken(token);

    if (!user) {
      throw new Error('Invalid or expired invitation link');
    }

    // Activate user and set password
    const activatedUser = userRepository.activateUser(user.id, password);

    // Update name if provided
    if (firstName || lastName) {
      userRepository.update(user.id, { firstName, lastName });
    }

    // Fetch full user data with policy information
    const fullUser = userRepository.findById(activatedUser.id);

    return {
      id: fullUser.id,
      email: fullUser.email,
      role: fullUser.role,
      firstName: firstName || fullUser.first_name,
      lastName: lastName || fullUser.last_name,
      policyId: fullUser.policy_id,
      policyName: fullUser.policy_name,
      policyDescription: fullUser.policy_description,
      policyStatus: fullUser.policy_status
    };
  }

  /**
   * Validate session user still exists and is active
   */
  validateUser(userId) {
    const user = userRepository.findById(userId);

    if (!user || !user.is_active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
      policyId: user.policy_id,
      policyName: user.policy_name,
      policyDescription: user.policy_description,
      policyStatus: user.policy_status
    };
  }
}

module.exports = new AuthService();
