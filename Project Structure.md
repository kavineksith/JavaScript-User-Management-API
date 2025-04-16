// Project Structure
/myapp
  /config
    database.js        // Database connection configuration
    auth.js            // JWT configuration
  /controllers
    authController.js  // Authentication related controllers
    userController.js  // User CRUD operations
  /middleware
    authMiddleware.js  // JWT verification middleware
    csrfMiddleware.js  // CSRF protection middleware
    rateLimiter.js     // Rate limiting middleware
    validator.js       // Input validation middleware
    requestId.js       // Request ID middleware
  /models
    User.js            // User model
  /routes
    authRoutes.js      // Authentication routes
    userRoutes.js      // User CRUD routes
  /utils
    validators.js      // Validation schemas
    helpers.js         // Helper functions
  index.js            // Main application file
  package.json