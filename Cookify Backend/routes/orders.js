const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrdersByUser,
  getOrdersByRestaurant,
  updateOrderStatus,
  getOrderById
} = require('../controllers/orderController');
const { protect, adminOnly, restaurantOwnerOnly } = require('../middleware/auth');

// Protected routes - customers
router.post('/', protect, createOrder);
router.get('/user', protect, getOrdersByUser);

// Protected routes - restaurant owners (specific routes before parameterized)
router.get('/restaurant', protect, restaurantOwnerOnly, getOrdersByRestaurant);
router.put('/:id/status', protect, restaurantOwnerOnly, updateOrderStatus);

// Parameterized routes (must come last)
router.get('/:id', protect, getOrderById);

module.exports = router;