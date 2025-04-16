/**
 * helpers.js - Utility functions for Express application
 */
const crypto = require('crypto');

/**
 * Error handling helper
 * Creates standardized error objects with appropriate status codes
 */
exports.createError = (message, statusCode = 400, extras = {}) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    Object.assign(error, extras);
    return error;
};

/**
 * Response formatting helper
 * Creates standardized success responses
 */
exports.createResponse = (data, message = 'Success', statusCode = 200) => {
    return {
        status: 'success',
        message,
        data
    };
};

/**
 * Filter object by allowed fields
 * Returns a new object with only the allowed fields
 */
exports.filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) newObj[key] = obj[key];
    });
    return newObj;
};

/**
 * Generate secure random token
 * Creates a random token for various security purposes
 */
exports.generateToken = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a string using SHA-256
 * Useful for securely storing tokens, etc.
 */
exports.hashString = (str) => {
    return crypto
        .createHash('sha256')
        .update(str)
        .digest('hex');
};

/**
 * Pagination helper
 * Returns standardized pagination metadata
 */
exports.createPagination = (page = 1, limit = 10, total = 0) => {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
        total,
        page,
        limit,
        pages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
    };
};

/**
 * Password strength checker
 * Returns boolean indicating if password meets requirements
 */
exports.isStrongPassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

/**
 * Sanitize user input
 * Basic sanitization to prevent XSS
 */
exports.sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize object values recursively
 */
exports.sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
        return exports.sanitizeInput(obj);
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = exports.sanitizeObject(obj[key]);
        }
    }

    return sanitized;
};

/**
 * Check if object is empty
 */
exports.isEmpty = (obj) => {
    return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
};

/**
 * Async handler wrapper
 * Eliminates need for try/catch blocks in async route handlers
 */
exports.asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Extract JWT token from authorization header or cookie
 */
exports.extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        return req.cookies.jwt;
    }
    return null;
};

/**
 * Format date for database insertion
 */
exports.formatDate = (date = new Date()) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Calculate expiry date
 * Returns a date object set to a future time
 */
exports.getExpiryDate = (minutes = 10) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Convert string to title case
 */
exports.toTitleCase = (str) => {
    if (typeof str !== 'string') return '';
    return str.replace(
        /\w\S*/g,
        txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Validate email format
 */
exports.isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Log error with request ID
 */
exports.logError = (err, reqId = null) => {
    const logPrefix = reqId ? `[${reqId}]` : '';
    console.error(`${logPrefix} Error:`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
};

/**
 * Clean path for security (prevent path traversal)
 */
exports.cleanPath = (path) => {
    if (typeof path !== 'string') return '';
    return path.replace(/\.\./g, '').replace(/[/\\]/g, '');
};