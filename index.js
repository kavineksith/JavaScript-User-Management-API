require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');;
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrfMiddleware');

// Import middleware
const corsOptions = require('./middleware/corsOptions');
const { apiLimiter, authLimiter, userActionLimiter } = require('./rateLimit');
const requestIdMiddleware = require('./middleware/requestId');
// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Creating an Express application instance
const app = express();

// Middleware to parse URL-encoded and JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

app.use(express.json({ limit: '10kb' })); // Limit JSON body size for security
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Apply CORS with production settings
app.use(cors(corsOptions));

// Apply global rate limiting
app.use(apiLimiter);

// CSRF protection - Apply to all routes after this point
app.use(csrfProtection);

// Apply request ID middleware for tracing
app.use(requestIdMiddleware);

// Apply specific rate limits to sensitive routes (Samples)
app.use('/api/auth', authLimiter);
app.use('/api/user/actions', userActionLimiter);

// Genral route
app.get('/', (req, res) => {
    res.send('API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        requestId: req.id
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(`Error [${req.id}]:`, err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
      status: 'error',
      message,
      requestId: req.id,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;