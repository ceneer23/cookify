const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');
require('dotenv').config();

const testDatabase = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Count existing restaurants
    const restaurantCount = await Restaurant.countDocuments();
    console.log(`📊 Current restaurants in database: ${restaurantCount}`);
    
    // Test 2: Create a test user if not exists
    let testUser = await User.findOne({ email: 'dbtest@test.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'DB Test User',
        email: 'dbtest@test.com',
        password: 'password123',
        role: 'restaurant_owner'
      });
      console.log('✅ Created test user:', testUser.email);
    } else {
      console.log('📝 Test user already exists:', testUser.email);
    }
    
    // Test 3: Create a test restaurant
    const testRestaurant = {
      name: 'DB Test Restaurant',
      description: 'Testing database operations',
      owner: testUser._id,
      cuisine: 'Italian',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345'
      },
      phone: '123-456-7890',
      email: 'dbtest@restaurant.com',
      hours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      },
      deliveryFee: 5.99,
      minimumOrder: 25,
      estimatedDeliveryTime: '20-30 min'
    };
    
    // Check if test restaurant already exists
    const existingTestRestaurant = await Restaurant.findOne({ name: 'DB Test Restaurant' });
    if (existingTestRestaurant) {
      console.log('📝 Test restaurant already exists, deleting...');
      await Restaurant.deleteOne({ name: 'DB Test Restaurant' });
    }
    
    // Create new test restaurant
    const newRestaurant = await Restaurant.create(testRestaurant);
    console.log('✅ Created test restaurant:', newRestaurant.name);
    console.log('📝 Restaurant ID:', newRestaurant._id);
    
    // Test 4: Update the restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      newRestaurant._id,
      { 
        description: 'Updated description - testing database updates',
        deliveryFee: 7.99 
      },
      { new: true }
    );
    console.log('✅ Updated restaurant description and delivery fee');
    console.log('📝 New description:', updatedRestaurant.description);
    console.log('📝 New delivery fee:', updatedRestaurant.deliveryFee);
    
    // Test 5: Verify the update persisted
    const verifyRestaurant = await Restaurant.findById(newRestaurant._id);
    console.log('✅ Verified update persisted:', verifyRestaurant.description);
    
    // Test 6: Count restaurants again
    const finalCount = await Restaurant.countDocuments();
    console.log(`📊 Final restaurants in database: ${finalCount}`);
    
    // Clean up - delete test restaurant
    await Restaurant.deleteOne({ _id: newRestaurant._id });
    console.log('🗑️ Cleaned up test restaurant');
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
};

testDatabase();