const express = require('express');
const policyController = require('../controllers/policyController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Active policies - accessible to all authenticated users (for user creation dropdown)
router.get('/policies/active', policyController.listActivePolicies.bind(policyController));

// Admin-only routes
router.post('/policies', requireAdmin, policyController.createPolicy.bind(policyController));
router.get('/policies', requireAdmin, policyController.listPolicies.bind(policyController));
router.get('/policies/:id', requireAdmin, policyController.getPolicy.bind(policyController));
router.patch('/policies/:id', requireAdmin, policyController.updatePolicy.bind(policyController));
router.delete('/policies/:id', requireAdmin, policyController.deletePolicy.bind(policyController));

module.exports = router;
