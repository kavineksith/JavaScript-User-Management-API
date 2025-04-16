const express = require('express');
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');
const validator = require('../middleware/validator');
const {
    registerValidator,
    loginValidator,
    resetRequestValidator,
    resetPasswordValidator
} = require('../utils/validators');

const router = express.Router();

// Apply stricter rate limiting to authentication routes
router.use(authLimiter);

// Public routes
router.post('/register', registerValidator, validator, authController.register);
router.post('/login', loginValidator, validator, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', resetRequestValidator, validator, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validator, authController.resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware require authentication
router.get('/me', authController.getMe);
router.post('/update-password', resetPasswordValidator, validator, authController.updatePassword);
router.post('/logout', authController.logout);

module.exports = router;