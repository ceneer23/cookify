const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Menu item name is required'],
    trim: true,
    maxlength: [100, 'Menu item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Menu item description is required'],
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Salads', 'Soups', 'Sides', 'Specials']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'] // Price in AED
  },
  image: {
    type: String, // URL to menu item image
    default: ''
  },
  ingredients: [{
    type: String
  }],
  allergens: [{
    type: String,
    enum: ['Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Fish', 'Shellfish', 'Sesame']
  }],
  dietary: [{
    type: String,
    enum: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb', 'Halal', 'Kosher']
  }],
  spiceLevel: {
    type: String,
    enum: ['None', 'Mild', 'Medium', 'Hot', 'Extra Hot'],
    default: 'None'
  },
  calories: {
    type: Number,
    min: 0
  },
  preparationTime: {
    type: Number, // in minutes
    default: 15,
    min: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  discount: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    validUntil: {
      type: Date
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  customizations: [{
    name: String, // e.g., "Size", "Toppings"
    options: [{
      name: String, // e.g., "Large", "Extra Cheese"
      price: Number // additional price
    }],
    required: {
      type: Boolean,
      default: false
    },
    multipleChoice: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for text search
menuItemSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text'
});

// Compound index for restaurant and availability
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);