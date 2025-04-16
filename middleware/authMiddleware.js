const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { query } = require('../config/database');

exports.protect = async (req, res, next) => {
    try {
        // 1) Get token from Authorization header
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            // Or from cookie
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in. Please log in to get access.'
            });
        }

        // 2) Verify token
        const decoded = jwt.verify(token, jwtSecret);

        // 3) Check if user still exists
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
        const user = await query(sql, [decoded.id]);

        if (!user || user.length === 0) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
        }

        // 4) Check if user changed password after the token was issued
        if (user[0].password_changed_at) {
            const changedTimestamp = parseInt(
                new Date(user[0].password_changed_at).getTime() / 1000,
                10
            );

            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User recently changed password. Please log in again.'
                });
            }
        }

        // Grant access to protected route
        req.user = user[0];
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token. Please log in again.'
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Your token has expired. Please log in again.'
            });
        }
        next(err);
    }
};

// Middleware for role-based authorization
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};