const csrf = require('csurf');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to handle CSRF errors
const handleCsrfError = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token validation failed',
      requestId: req.id
    });
  }
  next(err);
};

// Middleware to send CSRF token to client
const sendCsrfToken = (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
};

// Export middleware chain
module.exports = [csrfProtection, handleCsrfError, sendCsrfToken];