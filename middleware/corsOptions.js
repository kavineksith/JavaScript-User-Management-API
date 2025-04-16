const corsOptions = {
    // Only allow specific domains (replace with your actual domains)
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],

    // Only allow necessary methods
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    // Restrict headers to only what's needed
    allowedHeaders: ['Content-Type', 'Authorization', 'CSRF-Token'],

    // Expose any headers the client needs to access
    exposedHeaders: ['Content-Length', 'X-Request-Id', 'CSRF-Token'],

    // Set to true if you need to support cookies/authentication
    credentials: true,

    // Cache preflight requests for 1 hour (in seconds)
    maxAge: 3600,

    // Standard options
    preflightContinue: false,
    optionsSuccessStatus: 204
};

module.exports = corsOptions;