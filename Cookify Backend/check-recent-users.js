const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkRecentUsers = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get all users sorted by creation date (newest first)
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    console.log('\n=== ALL USERS (Newest First) ===');
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      const timeSinceCreation = new Date() - new Date(user.createdAt);
      const hoursSinceCreation = Math.floor(timeSinceCreation / (1000 * 60 * 60));
      const minutesSinceCreation = Math.floor((timeSinceCreation % (1000 * 60 * 60)) / (1000 * 60));
      
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Time ago: ${hoursSinceCreation}h ${minutesSinceCreation}m`);
      console.log(`   ID: ${user._id}`);
      console.log('   ---');
    });
    
    // Show users created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentUsers = await User.find({ 
      createdAt: { $gte: oneHourAgo } 
    }).select('-password').sort({ createdAt: -1 });
    
    if (recentUsers.length > 0) {
      console.log('\n=== USERS CREATED IN LAST HOUR ===');
      recentUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
      });
    }
    
    // Show users created today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const todayUsers = await User.find({ 
      createdAt: { $gte: startOfToday } 
    }).select('-password').sort({ createdAt: -1 });
    
    if (todayUsers.length > 0) {
      console.log('\n=== USERS CREATED TODAY ===');
      todayUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   ID: ${user._id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

checkRecentUsers();