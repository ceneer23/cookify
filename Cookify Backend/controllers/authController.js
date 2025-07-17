const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockAuth = require('../mockAuth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [
          ...(!name ? [{ field: 'name', message: 'Name is required' }] : []),
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
        ]
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Please provide a valid email address' }]
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'password', message: 'Password must be at least 6 characters long' }]
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        error: 'User already exists',
        details: [{ field: 'email', message: 'User with this email already exists' }]
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'User already exists',
        details: [{ field: 'email', message: 'User with this email already exists' }]
      });
    }

    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : [])
        ]
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Please provide a valid email address' }]
      });
    }

    try {
      console.log('Attempting database authentication for:', email);
      const user = await User.findOne({ email });
      if (user) {
        console.log('Database user found:', user.email, user._id);
        const passwordMatch = await user.comparePassword(password);
        console.log('Password match:', passwordMatch);
        
        if (passwordMatch) {
          console.log('Database authentication successful');
          return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
          });
        } else {
          console.log('Password mismatch for database user');
        }
      } else {
        console.log('No database user found with email:', email);
      }
    } catch (dbError) {
      console.log('Database authentication failed, trying mock auth:', dbError.message);
    }

    const mockUser = await mockAuth.login(email, password);
    if (mockUser) {
      return res.json(mockUser);
    }

    res.status(401).json({ 
      error: 'Invalid credentials',
      details: [{ field: 'general', message: 'Invalid email or password' }]
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    return res.json(req.user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, login, getMe, changePassword, updateProfile };