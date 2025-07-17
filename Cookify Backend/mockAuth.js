const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mockUsers = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@test.com',
    password: '$2a$10$xh9qA/iPOxvfcVfz7ujAUeVDjr5E8ivdGjCGVey4CE03EOQcoNxfu',
    role: 'user'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Restaurant Owner',
    email: 'owner@test.com',
    password: '$2a$10$xh9qA/iPOxvfcVfz7ujAUeVDjr5E8ivdGjCGVey4CE03EOQcoNxfu',
    role: 'restaurant_owner'
  }
];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const mockAuth = {
  login: async (email, password) => {
    const user = mockUsers.find(u => u.email === email);
    if (!user) return null;
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  },
  
  findById: async (id) => {
    const user = mockUsers.find(u => u._id === id);
    if (!user) return null;
    
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
};

module.exports = mockAuth;