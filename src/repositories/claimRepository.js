const db = require('./database');

class ClaimRepository {
  /**
   * Create a new claim
   */
  create(claimData) {
    const stmt = db.prepare(`
      INSERT INTO claims (user_id, policy_id, date_of_occurrence, location, cause, description, documents, assigned_agent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      claimData.userId,
      claimData.policyId,
      claimData.dateOfOccurrence,
      claimData.location,
      claimData.cause,
      claimData.description,
      claimData.documents ? JSON.stringify(claimData.documents) : null,
      claimData.assignedAgentId || null
    );

    const claimId = result.lastInsertRowid;

    // Record initial status in history
    this.addStatusHistory(claimId, null, 'submitted', claimData.userId, 'Claim created');

    return this.findById(claimId);
  }

  /**
   * Find claim by ID with user scope and joined data
   */
  findById(id, userId = null) {
    let query = `
      SELECT
        c.*,
        u.email as customer_email,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        a.email as agent_email,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        ub.email as updated_by_email,
        ub.first_name as updated_by_first_name,
        ub.last_name as updated_by_last_name,
        p.name as policy_name,
        p.description as policy_description,
        p.status as policy_status
      FROM claims c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.assigned_agent_id = a.id
      LEFT JOIN users ub ON c.updated_by_id = ub.id
      LEFT JOIN policies p ON c.policy_id = p.id
      WHERE c.id = ?
    `;
    const params = [id];

    if (userId) {
      query += ' AND c.user_id = ?';
      params.push(userId);
    }

    const stmt = db.prepare(query);
    const claim = stmt.get(...params);

    if (claim && claim.documents) {
      claim.documents = JSON.parse(claim.documents);
    }

    return claim;
  }

  /**
   * Find all claims with filters and sorting (scoped by user)
   */
  findAll(options = {}) {
    const { userId, isAdmin, status, assignedAgentId, search, sortBy = 'created_at', sortOrder = 'DESC' } = options;

    let query = `
      SELECT
        c.*,
        u.email as customer_email,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        a.email as agent_email,
        a.first_name as agent_first_name,
        a.last_name as agent_last_name,
        ub.email as updated_by_email,
        ub.first_name as updated_by_first_name,
        ub.last_name as updated_by_last_name,
        p.name as policy_name,
        p.description as policy_description,
        p.status as policy_status
      FROM claims c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.assigned_agent_id = a.id
      LEFT JOIN users ub ON c.updated_by_id = ub.id
      LEFT JOIN policies p ON c.policy_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Scope by user (customers can only see their own claims)
    if (!isAdmin && userId) {
      query += ' AND c.user_id = ?';
      params.push(userId);
    }

    // Filter by status
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    // Filter by assigned agent
    if (assignedAgentId) {
      query += ' AND c.assigned_agent_id = ?';
      params.push(assignedAgentId);
    }

    // Text search across multiple fields
    if (search && search.trim()) {
      query += ` AND (
        c.policy_id LIKE ? OR
        c.location LIKE ? OR
        c.cause LIKE ? OR
        c.description LIKE ? OR
        u.first_name LIKE ? OR
        u.last_name LIKE ? OR
        u.email LIKE ? OR
        CAST(c.id AS TEXT) LIKE ?
      )`;
      const searchPattern = `%${search.trim()}%`;
      // Add 8 search parameters (one for each field)
      for (let i = 0; i < 8; i++) {
        params.push(searchPattern);
      }
    }

    // Sorting
    const allowedSortFields = ['created_at', 'date_of_occurrence', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY c.${sortField} ${order}`;

    const stmt = db.prepare(query);
    const claims = stmt.all(...params);

    // Parse documents JSON
    return claims.map(claim => {
      if (claim.documents) {
        claim.documents = JSON.parse(claim.documents);
      }
      return claim;
    });
  }

  /**
   * Update claim status (tracks who updated it)
   */
  updateStatus(id, status, userId, isAdmin = false) {
    // Get current claim
    const currentClaim = this.findById(id);
    if (!currentClaim) {
      return null;
    }

    // Check permissions
    if (!isAdmin && currentClaim.user_id !== userId) {
      return null;
    }

    // Update claim with updated_by_id to track who made the change
    const stmt = db.prepare(`
      UPDATE claims
      SET status = ?, updated_by_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(status, userId, id);

    if (result.changes === 0) {
      return null;
    }

    // Record status change in history with who changed it
    this.addStatusHistory(id, currentClaim.status, status, userId, `Status changed to ${status}`);

    return this.findById(id);
  }

  /**
   * Assign agent to claim
   */
  assignAgent(claimId, agentId, assignedBy) {
    const stmt = db.prepare(`
      UPDATE claims
      SET assigned_agent_id = ?, updated_by_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(agentId, assignedBy, claimId);

    if (result.changes === 0) {
      return null;
    }

    // Agent assignment is tracked via updated_by_id, no need for separate history entry
    return this.findById(claimId);
  }

  /**
   * Add status history record
   */
  addStatusHistory(claimId, fromStatus, toStatus, changedBy, note) {
    const stmt = db.prepare(`
      INSERT INTO claim_status_history (claim_id, from_status, to_status, changed_by_user_id, note)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(claimId, fromStatus, toStatus, changedBy, note);
  }

  /**
   * Get status history for a claim
   */
  getStatusHistory(claimId) {
    const stmt = db.prepare(`
      SELECT
        h.*,
        u.email as changed_by_email,
        u.first_name as changed_by_first_name,
        u.last_name as changed_by_last_name
      FROM claim_status_history h
      LEFT JOIN users u ON h.changed_by_user_id = u.id
      WHERE h.claim_id = ?
      ORDER BY h.created_at DESC
    `);

    return stmt.all(claimId);
  }
}

module.exports = new ClaimRepository();
