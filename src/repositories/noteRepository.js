const db = require('./database');

class NoteRepository {
  /**
   * Add a note to a claim
   */
  create(claimId, userId, noteText) {
    const stmt = db.prepare(`
      INSERT INTO claim_notes (claim_id, user_id, note)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(claimId, userId, noteText);
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Find note by ID with user info
   */
  findById(id) {
    const stmt = db.prepare(`
      SELECT
        n.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.role as user_role
      FROM claim_notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = ?
    `);

    return stmt.get(id);
  }

  /**
   * Get all notes for a claim (ordered by creation time)
   */
  findByClaimId(claimId) {
    const stmt = db.prepare(`
      SELECT
        n.*,
        u.email as user_email,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.role as user_role
      FROM claim_notes n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.claim_id = ?
      ORDER BY n.created_at ASC
    `);

    return stmt.all(claimId);
  }

  /**
   * Get count of notes for a claim
   */
  countByClaimId(claimId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM claim_notes WHERE claim_id = ?');
    const result = stmt.get(claimId);
    return result.count;
  }

  /**
   * Delete a note (optional - for future use)
   */
  delete(id) {
    const stmt = db.prepare('DELETE FROM claim_notes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = new NoteRepository();
