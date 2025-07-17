const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5500',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      // Network IP addresses
      'http://30.10.0.232:5174',
      'http://172.21.192.1:5174',
      'http://30.10.0.232:5173',
      'http://172.21.192.1:5173',
      // Add production frontend URL (update this with your actual frontend URL)
      process.env.FRONTEND_URL,
      'https://cookify-frontend.vercel.app',
      'https://cookify-frontend.netlify.app',
      // Add more flexible patterns for common hosting platforms
      'https://cookify-frontend.onrender.com',
      'https://cookify.netlify.app',
      'https://cookify.vercel.app',
      // Your actual hosted frontend URL
      'https://cookify-eta.vercel.app'
    ].filter(Boolean);
    
    console.log('CORS - Request origin:', origin);
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('CORS - Origin allowed');
      callback(null, true);
    } else {
      // For development, allow all localhost origins
      if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        console.log('CORS - Localhost origin allowed');
        callback(null, true);
      } else {
        console.log('CORS - Origin blocked:', origin);
        callback(null, false);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Content-Type-Options'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/orders', require('./routes/orders'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Cookify API Server Running',
    version: '1.0.0',
    status: 'active'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`=🍽 Cookify server running on port ${PORT}`);
  console.log(`=🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`=🌐 Network access: http://30.10.0.232:${PORT}/health`);
  console.log(`=🌐 Network access: http://172.21.192.1:${PORT}/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log(`💡 To fix this, kill the process using the port:`);
    console.log(`   netstat -ano | findstr :${PORT}`);
    console.log(`   powershell -Command "Stop-Process -Id <process_id> -Force"`);
    console.log(`💡 Or use a different port in your .env file`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});


