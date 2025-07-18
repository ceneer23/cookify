const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Restaurant = require('./models/Restaurant');

const debugMenuAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify');
    
    const restaurantId = '6878e6262e89611860a1a69e';
    console.log('Testing menu API with restaurant ID:', restaurantId);
    
    // Test the exact query used in the controller
    const query = { restaurant: restaurantId, isAvailable: true };
    console.log('Query:', query);
    
    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name')
      .sort({ category: 1, name: 1 });
    
    console.log('Found', menuItems.length, 'items');
    if (menuItems.length > 0) {
      console.log('First item:', menuItems[0].name, '- Available:', menuItems[0].isAvailable);
    }
    
    // Also test without the availability filter
    const allItems = await MenuItem.find({ restaurant: restaurantId });
    console.log('All items for restaurant:', allItems.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

debugMenuAPI();