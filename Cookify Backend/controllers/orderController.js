const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (customers)
const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customer: req.user.id
    };

    // Calculate estimated delivery time (30-45 minutes from now)
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + 35);
    orderData.estimatedDeliveryTime = estimatedDeliveryTime;

    const order = await Order.create(orderData);
    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'restaurant', select: 'name phone email' },
      { path: 'items.menuItem', select: 'name price' }
    ]);

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get orders by user
// @route   GET /api/orders/user
// @access  Private (customers)
const getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate([
        { path: 'restaurant', select: 'name phone email images' },
        { path: 'items.menuItem', select: 'name price' }
      ])
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get orders by restaurant
// @route   GET /api/orders/restaurant
// @access  Private (restaurant owners)
const getOrdersByRestaurant = async (req, res) => {
  try {
    // Get restaurant owned by current user
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(400).json({ error: 'No restaurant found for this user' });
    }

    const { status, limit = 50 } = req.query;
    
    let query = { restaurant: restaurant._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'items.menuItem', select: 'name price category' }
      ])
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(orders);
  } catch (error) {
    console.error('Get restaurant orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (restaurant owners)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id).populate('restaurant');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns the restaurant for this order
    if (order.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Update delivery time when order is delivered
    if (status === 'Delivered' && !order.actualDeliveryTime) {
      order.actualDeliveryTime = new Date();
    }

    order.status = status;
    await order.save();

    await order.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'items.menuItem', select: 'name price' }
    ]);

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (order owner or restaurant owner)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'customer', select: 'name email phone' },
        { path: 'restaurant', select: 'name phone email' },
        { path: 'items.menuItem', select: 'name price category' }
      ]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is customer who placed order or restaurant owner
    const restaurant = await Restaurant.findById(order.restaurant._id);
    const isCustomer = order.customer._id.toString() === req.user.id;
    const isRestaurantOwner = restaurant && restaurant.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isRestaurantOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrdersByRestaurant,
  updateOrderStatus,
  getOrderById
};