const db = require('./database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class UserRepository {
  /**
   * Create a new user with invite token
   */
  createWithInvite(userData) {
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const stmt = db.prepare(`
      INSERT INTO users (email, role, first_name, last_name, policy_id, invite_token, invite_expires_at, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `);

    const result = stmt.run(
      userData.email,
      userData.role || 'customer',
      userData.firstName,
      userData.lastName,
      userData.policyId || null,
      inviteToken,
      inviteExpiresAt.toISOString()
    );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find user by ID
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT
        u.*,
        p.name as policy_name,
        p.description as policy_description,
        p.status as policy_status
      FROM users u
      LEFT JOIN policies p ON u.policy_id = p.id
      WHERE u.id = ?
    `);
    return stmt.get(id);
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    const stmt = db.prepare(`
      SELECT
        u.*,
        p.name as policy_name,
        p.description as policy_description,
        p.status as policy_status
      FROM users u
      LEFT JOIN policies p ON u.policy_id = p.id
      WHERE u.email = ?
    `);
    return stmt.get(email);
  }

  /**
   * Find user by invite token
   */
  findByInviteToken(token) {
    const stmt = db.prepare(`
      SELECT
        u.*,
        p.name as policy_name,
        p.description as policy_description,
        p.status as policy_status
      FROM users u
      LEFT JOIN policies p ON u.policy_id = p.id
      WHERE u.invite_token = ? AND u.invite_expires_at > datetime('now')
    `);
    return stmt.get(token);
  }

  /**
   * Set user password and activate account
   */
  activateUser(userId, password) {
    const passwordHash = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      UPDATE users
      SET password_hash = ?, is_active = 1, invite_token = NULL, invite_expires_at = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(passwordHash, userId);
    return this.findById(userId);
  }

  /**
   * Verify user password
   */
  verifyPassword(user, password) {
    if (!user.password_hash) {
      return false;
    }
    return bcrypt.compareSync(password, user.password_hash);
  }

  /**
   * Get all users (admin only)
   */
  findAll(options = {}) {
    let query = `
      SELECT
        u.id, u.email, u.role, u.first_name, u.last_name, u.is_active, u.created_at, u.policy_id,
        p.name as policy_name,
        p.status as policy_status
      FROM users u
      LEFT JOIN policies p ON u.policy_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (options.role) {
      query += ' AND u.role = ?';
      params.push(options.role);
    }

    if (options.isActive !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(options.isActive ? 1 : 0);
    }

    query += ' ORDER BY u.created_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get all active agents (admins)
   */
  findActiveAgents() {
    const stmt = db.prepare(`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE role = 'admin' AND is_active = 1
      ORDER BY first_name, last_name
    `);
    return stmt.all();
  }

  /**
   * Update user
   */
  update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(updates.firstName);
    }

    if (updates.lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(updates.lastName);
    }

    if (updates.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(updates.isActive ? 1 : 0);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  deactivate(id) {
    const stmt = db.prepare('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
    return this.findById(id);
  }
}

module.exports = new UserRepository();
