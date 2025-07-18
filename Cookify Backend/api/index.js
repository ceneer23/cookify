const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('../config/database');
const corsMiddleware = require('../config/cors');
require('dotenv').config();

// Initialize database connection
connectDB();

const app = express();

// Security and CORS middleware
app.use(helmet());
app.use(corsMiddleware);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/restaurants', require('../routes/restaurants'));
app.use('/api/menus', require('../routes/menus'));
app.use('/api/orders', require('../routes/orders'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cookify API Server Running',
    version: '1.0.0',
    status: 'active'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;