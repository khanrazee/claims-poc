const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All user routes require admin access
router.use(authenticate);
router.use(requireAdmin);

router.post('/users', userController.createUser.bind(userController));
router.get('/users', userController.listUsers.bind(userController));
router.get('/users/agents', userController.getAgents.bind(userController));
router.get('/users/:id', userController.getUser.bind(userController));
router.patch('/users/:id', userController.updateUser.bind(userController));
router.delete('/users/:id', userController.deactivateUser.bind(userController));

module.exports = router;
