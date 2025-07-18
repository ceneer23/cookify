const cors = require('cors');

// Parse allowed origins from environment variable
const parseAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  return [];
};

// Default allowed origins for development
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// Production origins - Multiple hosting platforms
const productionOrigins = [
  'https://cookify-frontend.vercel.app',
  'https://cookify-frontend.netlify.app',
  'https://cookify-frontend.onrender.com',
  'https://cookify.netlify.app',
  'https://cookify.vercel.app',
  'https://cookify-eta.vercel.app',
  // Vercel preview deployments
  'https://cookify-frontend-*.vercel.app',
  'https://cookify-*.vercel.app',
  // Add the actual deployed frontend URLs
  'https://cookify-frontend-lj85y4t5t-atim-senas-projects.vercel.app',
  'https://cookify-frontend-dkz3czfl6-atim-senas-projects.vercel.app',
  'https://cookify-frontend-rkrzoe9oo-atim-senas-projects.vercel.app',
  'https://cookify-frontend-4364t59nm-atim-senas-projects.vercel.app',
  'https://cookify-frontend-5rq5h7ly4-atim-senas-projects.vercel.app',
  'https://cookify-frontend-bcv5yony3-atim-senas-projects.vercel.app',
  'https://cookify-frontend-pwgbpf1kv-atim-senas-projects.vercel.app',
  // Render backend patterns
  'https://cookify-backend.onrender.com',
  'https://cookify-api.onrender.com',
  'https://cookify-backend-*.onrender.com',
];

// Network IP addresses (for local network testing)
const networkOrigins = [
  'http://30.10.0.232:5174',
  'http://172.21.192.1:5174',
  'http://30.10.0.232:5173',
  'http://172.21.192.1:5173',
];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Combine all allowed origins
    const allowedOrigins = [
      ...defaultAllowedOrigins,
      ...productionOrigins,
      ...networkOrigins,
      ...parseAllowedOrigins(),
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS - Origin allowed: ${origin}`);
      callback(null, true);
    } else {
      // Check for Vercel preview deployments (more flexible patterns)
      const isVercelPreview = origin && (
        origin.match(/^https:\/\/cookify-frontend-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$/) ||
        origin.match(/^https:\/\/cookify-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$/) ||
        origin.match(/^https:\/\/[a-z0-9]+-cookify\.vercel\.app$/) ||
        origin.includes('cookify-frontend') && origin.includes('.vercel.app')
      );
      
      if (isVercelPreview) {
        console.log(`CORS - Vercel preview deployment allowed: ${origin}`);
        callback(null, true);
        return;
      }
      
      // For development, allow all localhost and network IP origins
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalOrigin = origin && (
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('30.10.0.232') ||
        origin.includes('172.21.192.1')
      );
      
      if (isDevelopment && isLocalOrigin) {
        console.log(`CORS - Development origin allowed: ${origin}`);
        callback(null, true);
      } else {
        console.log(`CORS - Origin blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);