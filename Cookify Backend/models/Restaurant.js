const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Restaurant description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    enum: ['Italian', 'Chinese', 'Indian', 'Mexican', 'American', 'Thai', 'Japanese', 'Mediterranean', 'Fast Food', 'Other']
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  images: [{
    type: String // URLs to restaurant images
  }],
  hours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  deliveryFee: {
    type: Number,
    default: 10.99, // AED
    min: 0
  },
  minimumOrder: {
    type: Number,
    default: 50, // AED
    min: 0
  },
  estimatedDeliveryTime: {
    type: String,
    default: '30-45 min'
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
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    enum: ['Popular', 'New', 'Fast Delivery', 'Healthy', 'Vegetarian', 'Vegan', 'Halal']
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
restaurantSchema.index({ 'address.coordinates': '2dsphere' });

// Index for text search
restaurantSchema.index({ 
  name: 'text', 
  description: 'text', 
  cuisine: 'text' 
});

module.exports = mongoose.model('Restaurant', restaurantSchema);