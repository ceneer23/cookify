const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const path = require('path');
const fs = require('fs');

// @desc    Get menu items by restaurant
// @route   GET /api/menus/restaurant/:restaurantId
// @access  Public
const getMenuItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, available } = req.query;

    let query = { restaurant: restaurantId };
    
    // Filter by availability (default to show only available items for public, all for owners)
    if (available === 'true') {
      query.isAvailable = true;
    } else if (available === 'false') {
      // Show all items (for restaurant owners)
    } else {
      // Default: show only available items for public access
      query.isAvailable = true;
    }

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name')
      .sort({ category: 1, name: 1 });

    res.json(menuItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create menu item
// @route   POST /api/menus
// @access  Private (restaurant owners)
const createMenuItem = async (req, res) => {
  try {
    // Get restaurant owned by current user
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(400).json({ error: 'No restaurant found for this user' });
    }

    // Check if user is admin or owns the restaurant
    if (req.body.restaurant && req.body.restaurant !== restaurant._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to add items to this restaurant' });
    }

    const menuItemData = {
      ...req.body,
      restaurant: restaurant._id
    };

    // Add image URL if file was uploaded
    if (req.file) {
      menuItemData.image = `/uploads/menu-items/${req.file.filename}`;
    }

    const menuItem = await MenuItem.create(menuItemData);
    await menuItem.populate('restaurant', 'name');

    res.status(201).json(menuItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update menu item
// @route   PUT /api/menus/:id
// @access  Private (restaurant owner)
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Check ownership
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this menu item' });
    }

    const updateData = { ...req.body };

    // Add new image URL if file was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (menuItem.image) {
        const oldImagePath = path.join(__dirname, '..', menuItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = `/uploads/menu-items/${req.file.filename}`;
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('restaurant', 'name');

    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Update menu item error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menus/:id
// @access  Private (restaurant owner)
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');
    
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Check ownership
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this menu item' });
    }

    // Delete image file if it exists
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getMenuItemsByRestaurant,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};