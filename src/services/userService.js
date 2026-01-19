const userRepository = require('../repositories/userRepository');
const crypto = require('crypto');

class UserService {
  /**
   * Create user with invite
   */
  createUser(userData, createdBy) {
    // Validate email
    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    // Check if email already exists
    const existingUser = userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Require policy for customers
    if (userData.role === 'customer' && !userData.policyId) {
      throw new Error('Policy is required for customer accounts');
    }

    // Create user with invite token
    const user = userRepository.createWithInvite({
      email: userData.email,
      role: userData.role || 'customer',
      firstName: userData.firstName,
      lastName: userData.lastName,
      policyId: userData.policyId
    });

    // TODO: Send email invitation (for MVP, we'll just return the invite link)
    const inviteLink = `${process.env.BASE_URL || 'http://localhost:3000'}/accept-invite?token=${user.invite_token}`;

    return {
      user,
      inviteLink
    };
  }

  /**
   * Get all users (admin only)
   */
  getUsers(filters = {}) {
    return userRepository.findAll(filters);
  }

  /**
   * Get user by ID
   */
  getUserById(id) {
    const user = userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Update user
   */
  updateUser(id, updates) {
    const user = userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return userRepository.update(id, updates);
  }

  /**
   * Deactivate user
   */
  deactivateUser(id) {
    const user = userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      // Check if this is the last admin
      const admins = userRepository.findAll({ role: 'admin', isActive: true });
      if (admins.length <= 1) {
        throw new Error('Cannot deactivate the last admin user');
      }
    }

    return userRepository.deactivate(id);
  }

  /**
   * Get all active agents
   */
  getActiveAgents() {
    return userRepository.findActiveAgents();
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = new UserService();
