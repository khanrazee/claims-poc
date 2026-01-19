const noteRepository = require('../repositories/noteRepository');
const claimRepository = require('../repositories/claimRepository');

class NoteService {
  /**
   * Add a note to a claim
   */
  addNote(claimId, userId, noteText, userRole) {
    // Validate inputs
    if (!noteText || !noteText.trim()) {
      throw new Error('Note text is required');
    }

    // Check if claim exists
    const claim = claimRepository.findById(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    // Permission check: customers can only add notes to their own claims
    if (userRole !== 'admin' && claim.user_id !== userId) {
      throw new Error('You can only add notes to your own claims');
    }

    // Create the note
    return noteRepository.create(claimId, userId, noteText.trim());
  }

  /**
   * Get all notes for a claim
   */
  getNotes(claimId, userId, userRole) {
    // Check if claim exists
    const claim = claimRepository.findById(claimId);
    if (!claim) {
      throw new Error('Claim not found');
    }

    // Permission check: customers can only view notes for their own claims
    if (userRole !== 'admin' && claim.user_id !== userId) {
      throw new Error('You can only view notes for your own claims');
    }

    return noteRepository.findByClaimId(claimId);
  }

  /**
   * Get note count for a claim
   */
  getNoteCount(claimId) {
    return noteRepository.countByClaimId(claimId);
  }
}

module.exports = new NoteService();
