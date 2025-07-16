const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getMyRestaurant
} = require('../controllers/restaurantController');
const { protect, adminOnly, restaurantOwnerOnly } = require('../middleware/auth');

// Public routes
router.get('/', getRestaurants);

// Protected routes - restaurant owners (specific routes before parameterized)
router.get('/my-restaurant', protect, getMyRestaurant);
router.post('/', protect, createRestaurant);

// Public parameterized routes
router.get('/:id', getRestaurant);

// Protected parameterized routes
router.put('/:id', protect, restaurantOwnerOnly, updateRestaurant);
router.delete('/:id', protect, restaurantOwnerOnly, deleteRestaurant);

// Admin only routes
router.put('/:id/approve', protect, adminOnly, approveRestaurant);

module.exports = router;