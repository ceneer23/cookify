const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify');
    console.log('✅ Connected to MongoDB');
    
    const menuItems = await MenuItem.find().populate('restaurant');
    console.log('\n=== MENU ITEMS ===');
    console.log('Total menu items:', menuItems.length);
    
    menuItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.restaurant?.name || 'No restaurant'} - AED ${item.price}`);
    });
    
    const orders = await Order.find().populate('restaurant user');
    console.log('\n=== ORDERS ===');
    console.log('Total orders:', orders.length);
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order._id.toString().slice(-8)} - ${order.restaurant?.name || 'No restaurant'} - ${order.user?.name || 'No user'} - AED ${order.pricing?.total || 'No total'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

checkData();