const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');
require('dotenv').config();

const checkDatabaseData = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Check users
    console.log('\n=== USERS ===');
    const users = await User.find({}).select('-password');
    console.log(`Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user._id}`);
    });
    
    // Check restaurants
    console.log('\n=== RESTAURANTS ===');
    const restaurants = await Restaurant.find({}).populate('owner', 'name email');
    console.log(`Total restaurants: ${restaurants.length}`);
    restaurants.forEach((restaurant, index) => {
      console.log(`${index + 1}. ${restaurant.name}`);
      console.log(`   Owner: ${restaurant.owner?.name} (${restaurant.owner?.email})`);
      console.log(`   Cuisine: ${restaurant.cuisine}`);
      console.log(`   Address: ${restaurant.address.street}, ${restaurant.address.city}`);
      console.log(`   Phone: ${restaurant.phone}`);
      console.log(`   Email: ${restaurant.email}`);
      console.log(`   Created: ${restaurant.createdAt}`);
      console.log(`   ID: ${restaurant._id}`);
      console.log('   ---');
    });
    
    // Check database collections
    console.log('\n=== DATABASE COLLECTIONS ===');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Check if there are any documents in the users collection
    const userCount = await User.countDocuments();
    const restaurantCount = await Restaurant.countDocuments();
    console.log(`\nDocument counts: Users: ${userCount}, Restaurants: ${restaurantCount}`);
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
};

checkDatabaseData();