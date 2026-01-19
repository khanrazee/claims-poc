const express = require('express');
const multer = require('multer');
const path = require('path');
const claimController = require('../controllers/claimController');
const noteController = require('../controllers/noteController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images and documents allowed.'));
  }
});

// All routes require authentication
router.use(authenticate);

// Customer can access (create and view their own claims)
router.post('/claims', upload.array('documents', 5), claimController.createClaim.bind(claimController));
router.get('/claims', claimController.listClaims.bind(claimController));
router.get('/claims/:id', claimController.getClaim.bind(claimController));
router.get('/claims/:id/history', claimController.getClaimHistory.bind(claimController));

// Notes - both customers and admins can add/view notes
router.post('/claims/:claimId/notes', noteController.addNote.bind(noteController));
router.get('/claims/:claimId/notes', noteController.getNotes.bind(noteController));

// Admin only routes
router.get('/claims/:id/transitions', requireAdmin, claimController.getAllowedTransitions.bind(claimController));
router.patch('/claims/:id', requireAdmin, claimController.updateClaimStatus.bind(claimController));
router.post('/claims/:id/assign', requireAdmin, claimController.assignAgent.bind(claimController));

module.exports = router;
