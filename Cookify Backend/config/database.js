const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = 'mongodb://127.0.0.1:27017/cookify-test';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    
    setTimeout(async () => {
      try {
        const User = require('../models/User');
        const testUser = await User.findOne({ email: 'test@test.com' });
        
        if (!testUser) {
          await User.create({
            name: 'Test User',
            email: 'test@test.com',
            password: 'password123',
            role: 'user'
          });
          console.log('✅ Test user created: test@test.com / password123');
        }
      } catch (error) {
        console.error('❌ Test user creation error:', error.message);
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('📝 Continuing without database connection for testing...');
  }
};

module.exports = connectDB;