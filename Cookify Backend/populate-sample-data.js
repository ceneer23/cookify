const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant');
const MenuItem = require('./models/MenuItem');

const populateData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cookify');
    console.log('✅ Connected to MongoDB');
    
    // Get the existing restaurant
    const restaurant = await Restaurant.findOne();
    if (!restaurant) {
      console.log('❌ No restaurant found in database');
      process.exit(1);
    }
    
    console.log(`📍 Found restaurant: ${restaurant.name}`);
    
    // Check if menu items already exist
    const existingMenuItems = await MenuItem.find({ restaurant: restaurant._id });
    if (existingMenuItems.length > 0) {
      console.log(`✅ Restaurant already has ${existingMenuItems.length} menu items`);
      process.exit(0);
    }
    
    // Create sample menu items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
        price: 45.00,
        category: 'Main Course',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Tomato sauce', 'Mozzarella cheese', 'Fresh basil', 'Olive oil'],
        allergens: ['Gluten', 'Dairy'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Traditional pizza topped with pepperoni and mozzarella cheese',
        price: 52.00,
        category: 'Main Course',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Tomato sauce', 'Mozzarella cheese', 'Pepperoni'],
        allergens: ['Gluten', 'Dairy']
      },
      {
        name: 'Chicken Alfredo Pasta',
        description: 'Creamy pasta with grilled chicken and parmesan cheese',
        price: 48.00,
        category: 'Main Course',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Fettuccine pasta', 'Grilled chicken', 'Alfredo sauce', 'Parmesan cheese'],
        allergens: ['Gluten', 'Dairy']
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
        price: 32.00,
        category: 'Salads',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan cheese'],
        allergens: ['Gluten', 'Dairy'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 28.00,
        category: 'Desserts',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Ladyfingers', 'Coffee', 'Mascarpone', 'Cocoa powder'],
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Bruschetta',
        description: 'Toasted bread topped with fresh tomatoes, garlic, and basil',
        price: 25.00,
        category: 'Appetizers',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Bread', 'Tomatoes', 'Garlic', 'Basil', 'Olive oil'],
        allergens: ['Gluten'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Minestrone Soup',
        description: 'Traditional Italian vegetable soup with pasta and beans',
        price: 22.00,
        category: 'Soups',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Mixed vegetables', 'Pasta', 'Beans', 'Tomato broth'],
        allergens: ['Gluten'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Garlic Bread',
        description: 'Crispy bread with garlic butter and herbs',
        price: 18.00,
        category: 'Sides',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Bread', 'Garlic', 'Butter', 'Herbs'],
        allergens: ['Gluten', 'Dairy'],
        dietary: ['Vegetarian']
      },
      {
        name: 'Italian Soda',
        description: 'Refreshing sparkling water with Italian flavors',
        price: 15.00,
        category: 'Beverages',
        restaurant: restaurant._id,
        isAvailable: true,
        ingredients: ['Sparkling water', 'Natural flavors'],
        dietary: ['Vegetarian', 'Vegan']
      }
    ];
    
    console.log('📝 Creating sample menu items...');
    const createdItems = await MenuItem.insertMany(menuItems);
    console.log(`✅ Created ${createdItems.length} menu items`);
    
    // Verify the data
    const totalItems = await MenuItem.countDocuments({ restaurant: restaurant._id });
    console.log(`📊 Total menu items for ${restaurant.name}: ${totalItems}`);
    
    console.log('✅ Sample data populated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    process.exit(1);
  }
};

populateData();