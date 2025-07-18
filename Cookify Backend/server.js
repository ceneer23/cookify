const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
const corsMiddleware = require('./config/cors');
require('dotenv').config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(corsMiddleware);

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
  if (process.env.NODE_ENV !== 'production') {
    console.log(`=🌐 Network access: http://30.10.0.232:${PORT}/health`);
    console.log(`=🌐 Network access: http://172.21.192.1:${PORT}/health`);
  }
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


