const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemsByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, restaurantOwnerOnly } = require('../middleware/auth');
const { uploadMenuImage } = require('../middleware/upload');

// Public routes
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant);

// Protected routes - restaurant owners only
router.post('/', protect, restaurantOwnerOnly, uploadMenuImage, createMenuItem);
router.put('/:id', protect, restaurantOwnerOnly, uploadMenuImage, updateMenuItem);
router.delete('/:id', protect, restaurantOwnerOnly, deleteMenuItem);

module.exports = router;