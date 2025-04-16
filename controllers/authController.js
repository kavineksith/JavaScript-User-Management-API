const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn, jwtRefreshExpiresIn, cookieOptions } = require('../config/auth');

// Generate JWT token
const signToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpiresIn
    });
};

// Generate Refresh token
const signRefreshToken = (id) => {
    return jwt.sign({ id, tokenType: 'refresh' }, jwtSecret, {
        expiresIn: jwtRefreshExpiresIn
    });
};

// Send tokens to client
const createSendTokens = (user, statusCode, req, res) => {
    // Create tokens
    const token = signToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    // Set cookies
    res.cookie('jwt', token, cookieOptions);
    res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        refreshToken,
        data: {
            user
        }
    });
};

// Register a new user
exports.register = async (req, res, next) => {
    try {
        // Check if email already exists
        const existingUser = await User.findByEmail(req.body.email);
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        // Create user
        const userId = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: 'user' // Default role
        });

        // Get the user
        const user = await User.findById(userId);

        // Send tokens
        createSendTokens(user, 201, req, res);
    } catch (err) {
        next(err);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password'
            });
        }

        // Check if password is correct
        const isPasswordCorrect = await User.correctPassword(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password'
            });
        }

        // Send tokens
        createSendTokens(user, 200, req, res);
    } catch (err) {
        next(err);
    }
};

// Logout
exports.logout = (req, res) => {
    // Clear cookies
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success' });
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
    try {
        // Get refresh token
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                status: 'error',
                message: 'Please provide a refresh token'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, jwtSecret);

        // Check if it's a refresh token
        if (decoded.tokenType !== 'refresh') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token'
            });
        }

        // Get user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists'
            });
        }

        // Create new tokens
        createSendTokens(user, 200, req, res);
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired refresh token'
            });
        }
        next(err);
    }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
    try {
        // Find user by email
        const user = await User.findByEmail(req.body.email);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'There is no user with this email address'
            });
        }

        // Generate reset token
        const resetToken = await User.createPasswordResetToken(user.id);

        // In a real application, send email with reset URL
        // For this example, we just return the token

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email',
            token: resetToken // This would not be included in production
        });
    } catch (err) {
        next(err);
    }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
    try {
        // Get user based on token
        const user = await User.findByResetToken(req.params.token);
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token is invalid or has expired'
            });
        }

        // Reset password
        await User.resetPassword(user.id, req.body.password);

        // Log the user in
        const updatedUser = await User.findById(user.id);
        createSendTokens(updatedUser, 200, req, res);
    } catch (err) {
        next(err);
    }
};

// Update password (when logged in)
exports.updatePassword = async (req, res, next) => {
    try {
        // Get user
        const user = await User.findById(req.user.id);

        // Check current password
        const isCorrect = await User.correctPassword(req.body.currentPassword, user.password);
        if (!isCorrect) {
            return res.status(401).json({
                status: 'error',
                message: 'Your current password is incorrect'
            });
        }

        // Update password
        await User.changePassword(user.id, req.body.newPassword);

        // Log user in with new password
        const updatedUser = await User.findById(user.id);
        createSendTokens(updatedUser, 200, req, res);
    } catch (err) {
        next(err);
    }
};

// Get current user
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    created_at: user.created_at
                }
            }
        });
    } catch (err) {
        next(err);
    }
};