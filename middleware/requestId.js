const { v4: uuidv4 } = require('uuid');

// Middleware to add a unique ID to each request
const requestIdMiddleware = (req, res, next) => {
  // Use existing ID from headers if present (for tracing across services)
  const headerName = 'X-Request-ID';
  const requestId = req.headers[headerName.toLowerCase()] || uuidv4();
  
  // Attach ID to request object
  req.id = requestId;
  
  // Add ID to response headers for client tracking
  res.setHeader(headerName, requestId);
  
  next();
};

module.exports = requestIdMiddleware;