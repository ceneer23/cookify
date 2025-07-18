const cors = require('cors');

// Simple, permissive CORS configuration
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: '*', // Allow all headers
  exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);