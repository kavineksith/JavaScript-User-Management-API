const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const { updateUserValidator } = require('../utils/validators');

const router = express.Router();

// Protected routes - all routes require authentication
router.use(protect);

// Routes for logged-in users to manage their own account
router.patch('/me', updateUserValidator, validator, userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin only routes
router.use(restrictTo('admin'));

// CRUD operations for users (admin only)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.patch('/:id', updateUserValidator, validator, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;