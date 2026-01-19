const db = require('./database');

class PolicyRepository {
  /**
   * Create a new policy
   */
  create(policyData) {
    const stmt = db.prepare(`
      INSERT INTO policies (name, description, created_by_id, status, effective_at_date)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      policyData.name,
      policyData.description,
      policyData.createdById,
      policyData.status || 'draft',
      policyData.effectiveAtDate
    );

    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find policy by ID with creator info
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT
        p.*,
        u.email as created_by_email,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM policies p
      LEFT JOIN users u ON p.created_by_id = u.id
      WHERE p.id = ?
    `);

    return stmt.get(id);
  }

  /**
   * Find all policies with optional filters
   */
  findAll(options = {}) {
    const { status, sortBy = 'created_at', sortOrder = 'DESC' } = options;

    let query = `
      SELECT
        p.*,
        u.email as created_by_email,
        u.first_name as created_by_first_name,
        u.last_name as created_by_last_name
      FROM policies p
      LEFT JOIN users u ON p.created_by_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status
    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    // Sorting
    const allowedSortFields = ['created_at', 'name', 'effective_at_date', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortField} ${order}`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get all active policies
   */
  findActive() {
    return this.findAll({ status: 'active' });
  }

  /**
   * Update policy
   */
  update(id, policyData) {
    const fields = [];
    const params = [];

    if (policyData.name !== undefined) {
      fields.push('name = ?');
      params.push(policyData.name);
    }
    if (policyData.description !== undefined) {
      fields.push('description = ?');
      params.push(policyData.description);
    }
    if (policyData.status !== undefined) {
      fields.push('status = ?');
      params.push(policyData.status);
    }
    if (policyData.effectiveAtDate !== undefined) {
      fields.push('effective_at_date = ?');
      params.push(policyData.effectiveAtDate);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const stmt = db.prepare(`
      UPDATE policies
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...params);

    if (result.changes === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Delete policy (soft delete by setting status to cancelled)
   */
  delete(id) {
    return this.update(id, { status: 'cancelled' });
  }
}

module.exports = new PolicyRepository();
