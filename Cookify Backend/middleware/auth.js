const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try mock authentication first
      const mockAuth = require('../mockAuth');
      const mockUser = await mockAuth.findById(decoded.id);
      if (mockUser) {
        req.user = mockUser;
        return next();
      }

      // Fallback to database if available
      try {
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        req.user = user;
        return next();
      } catch (dbError) {
        return res.status(401).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

const restaurantOwnerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'restaurant_owner' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ error: 'Restaurant owner access required' });
  }
};

module.exports = { protect, adminOnly, restaurantOwnerOnly };