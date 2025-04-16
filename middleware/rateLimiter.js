// rateLimit.js
const rateLimit = require('express-rate-limit');

// Create a basic rate limiter factory function for reusability
const createLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // Default: 15 minutes
    max = 100, // Default: 100 requests per window
    message = 'Too many requests, please try again later',
    path = '*', // Default: apply to all routes
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    statusCode = 429,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      status: statusCode,
      error: 'Rate limit exceeded',
      message
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
    skip: (req) => {
      // Optional: Skip trusted IPs (example: internal services, CI/CD, etc.)
      const trustedIps = process.env.TRUSTED_IPS?.split(',') || [];
      if (trustedIps.includes(req.ip)) return true;

      return false;
    },
    skipSuccessfulRequests,
    skipFailedRequests,
    statusCode
  });
};

// Export different rate limiters for different purposes
module.exports = {
  // General API rate limiter
  apiLimiter: createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded. Please try again in 15 minutes.'
  }),

  // More restrictive rate limiter for authentication routes
  authLimiter: createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: 'Too many authentication attempts. Please try again in 1 minute.',
    statusCode: 429
  }),

  // Rate limiter for user actions like submitting forms
  userActionLimiter: createLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // 10 requests per 5 minutes
    message: 'Too many actions performed. Please slow down and try again in 5 minutes.'
  }),

  // Factory function for custom limiters
  createLimiter
};