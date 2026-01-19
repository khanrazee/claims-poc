const noteService = require('../services/noteService');

class NoteController {
  /**
   * Add a note to a claim
   * POST /api/claims/:claimId/notes
   */
  async addNote(req, res) {
    try {
      const { claimId } = req.params;
      const { note } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const newNote = noteService.addNote(parseInt(claimId), userId, note, userRole);

      return res.json({
        success: true,
        data: newNote
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all notes for a claim
   * GET /api/claims/:claimId/notes
   */
  async getNotes(req, res) {
    try {
      const { claimId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const notes = noteService.getNotes(parseInt(claimId), userId, userRole);

      return res.json({
        success: true,
        data: notes,
        count: notes.length
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new NoteController();
