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
    console.log('=== User Registration ===');
    const { name, email, password, role, phone } = req.body;
    console.log('Registration data:', { name, email, role, phone });

    if (!name || !email || !password) {
      console.log('Validation failed - missing required fields');
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
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Please provide a valid email address' }]
      });
    }

    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'password', message: 'Password must be at least 6 characters long' }]
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      console.log('Checking if user exists...');
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('User already exists with email:', email);
        return res.status(400).json({ 
          error: 'User already exists',
          details: [{ field: 'email', message: 'User with this email already exists' }]
        });
      }

      console.log('Creating new user...');
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        phone
      });

      console.log('User created successfully:', user._id);
      console.log('User details:', { name: user.name, email: user.email, role: user.role });

      // Verify user was saved
      const savedUser = await User.findById(user._id);
      console.log('Verified user saved in database:', !!savedUser);

      // Check total user count
      const totalUsers = await User.countDocuments();
      console.log('Total users in database:', totalUsers);

      if (user) {
        console.log('=== Registration successful ===');
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        });
      } else {
        console.log('User creation failed');
        res.status(400).json({ error: 'Invalid user data' });
      }
    } catch (dbError) {
      console.log('Database registration failed:', dbError.message);
      
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.values(dbError.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: validationErrors
        });
      }

      if (dbError.code === 11000) {
        return res.status(400).json({
          error: 'User already exists',
          details: [{ field: 'email', message: 'User with this email already exists' }]
        });
      }

      // If database fails, return error
      return res.status(500).json({ error: 'Database error during registration' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    console.log('=== User Login ===');
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      console.log('Validation failed - missing credentials');
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
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Please provide a valid email address' }]
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
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

    console.log('Attempting mock authentication...');
    const mockUser = await mockAuth.login(email, password);
    if (mockUser) {
      console.log('Mock authentication successful');
      return res.json(mockUser);
    }

    console.log('All authentication methods failed');
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