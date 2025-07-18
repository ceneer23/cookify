const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth endpoints working',
    timestamp: new Date().toISOString(),
    env: {
      jwtSecret: !!process.env.JWT_SECRET,
      mongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;