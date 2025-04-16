const { validationResult } = require('express-validator');

// Middleware to check validation errors
module.exports = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            })),
            requestId: req.id
        });
    }
    next();
};