const User = require('../models/User');

// Get all users (paginated)
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const users = await User.getAll(page, limit);

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    } catch (err) {
        next(err);
    }
};

// Get a single user
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Remove sensitive data
        delete user.password;
        delete user.password_reset_token;
        delete user.password_reset_expires;

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        next(err);
    }
};

// Update user
exports.updateUser = async (req, res, next) => {
    try {
        // Check if trying to update protected fields
        const protectedFields = ['password', 'role', 'is_active'];
        const hasProtectedFields = protectedFields.some(field => req.body[field] !== undefined);

        if (hasProtectedFields) {
            return res.status(400).json({
                status: 'error',
                message: 'This route is not for password/role/status updates'
            });
        }

        // Update user
        const success = await User.update(req.params.id, req.body);

        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found or no changes made'
            });
        }

        // Get updated user
        const user = await User.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        next(err);
    }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const success = await User.delete(req.params.id);

        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

// Update own account (for logged in users)
exports.updateMe = async (req, res, next) => {
    try {
        // Check if trying to update protected fields
        const protectedFields = ['password', 'role', 'is_active'];
        const hasProtectedFields = protectedFields.some(field => req.body[field] !== undefined);

        if (hasProtectedFields) {
            return res.status(400).json({
                status: 'error',
                message: 'This route is not for password/role/status updates'
            });
        }

        // Update user
        const success = await User.update(req.user.id, req.body);

        if (!success) {
            return res.status(400).json({
                status: 'error',
                message: 'No changes made'
            });
        }

        // Get updated user
        const user = await User.findById(req.user.id);
        delete user.password;

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        next(err);
    }
};

// Delete own account
exports.deleteMe = async (req, res, next) => {
    try {
        // In a real application, you might want to soft delete instead
        const success = await User.delete(req.user.id);

        if (!success) {
            return res.status(400).json({
                status: 'error',
                message: 'Could not delete account'
            });
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};