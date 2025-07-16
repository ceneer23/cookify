const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: [{
      name: String,
      selectedOptions: [{
        name: String,
        price: Number
      }]
    }],
    specialInstructions: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String // Stripe payment intent ID or similar
  },
  deliveryAddress: {
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
    },
    instructions: String
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      amount: {
        type: Number,
        default: 0
      },
      couponCode: String
    },
    total: {
      type: Number,
      required: true
    }
  },
  estimatedDeliveryTime: {
    type: Date
  },
  actualDeliveryTime: {
    type: Date
  },
  specialInstructions: {
    type: String,
    maxlength: 200
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    email: String
  },
  rating: {
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  refund: {
    requested: {
      type: Boolean,
      default: false
    },
    reason: String,
    amount: Number,
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Processed']
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Calculate total before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.pricing.subtotal = this.items.reduce((total, item) => {
    let itemTotal = item.price * item.quantity;
    
    // Add customization costs
    if (item.customizations) {
      item.customizations.forEach(customization => {
        if (customization.selectedOptions) {
          customization.selectedOptions.forEach(option => {
            itemTotal += option.price * item.quantity;
          });
        }
      });
    }
    
    return total + itemTotal;
  }, 0);

  // Calculate tax (assuming 8.5% tax rate)
  this.pricing.tax = Math.round(this.pricing.subtotal * 0.085 * 100) / 100;

  // Calculate total
  this.pricing.total = this.pricing.subtotal + 
                      this.pricing.deliveryFee + 
                      this.pricing.tax - 
                      this.pricing.discount.amount;

  next();
});

module.exports = mongoose.model('Order', orderSchema);