const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      cuisine, 
      search, 
      lat, 
      lng, 
      maxDistance = 10000 // 10km in meters
    } = req.query;

    let query = { isActive: true };

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = cuisine;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    let restaurantQuery = Restaurant.find(query);

    // Geospatial search if coordinates provided
    if (lat && lng) {
      restaurantQuery = Restaurant.find({
        ...query,
        'address.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const restaurants = await restaurantQuery
      .populate('owner', 'name email')
      .select('-__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, createdAt: -1 });

    const total = await Restaurant.countDocuments(query);

    res.json({
      restaurants,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!restaurant.isActive) {
      return res.status(404).json({ error: 'Restaurant not available' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get restaurant error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (restaurant owners)
const createRestaurant = async (req, res) => {
  try {
    console.log('=== Creating restaurant ===');
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ owner: req.user.id });
    if (existingRestaurant) {
      console.log('User already has a restaurant:', existingRestaurant._id);
      return res.status(400).json({ error: 'You already have a restaurant registered' });
    }

    const restaurantData = {
      ...req.body,
      owner: req.user.id
    };

    console.log('Restaurant data to create:', JSON.stringify(restaurantData, null, 2));

    // Create restaurant
    const restaurant = await Restaurant.create(restaurantData);
    console.log('Restaurant created with ID:', restaurant._id);
    
    // Populate owner details
    await restaurant.populate('owner', 'name email');
    console.log('Restaurant populated with owner details');

    // Verify the restaurant was saved
    const savedRestaurant = await Restaurant.findById(restaurant._id);
    console.log('Verified restaurant saved in database:', !!savedRestaurant);
    
    // Check total count
    const totalCount = await Restaurant.countDocuments();
    console.log('Total restaurants in database:', totalCount);

    console.log('=== Restaurant creation successful ===');
    res.status(201).json(restaurant);
  } catch (error) {
    console.error('=== Create restaurant error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error:', error.message);
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }
    
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (restaurant owner)
const updateRestaurant = async (req, res) => {
  try {
    console.log('=== Updating restaurant ===');
    console.log('Restaurant ID:', req.params.id);
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);
    console.log('Update data:', JSON.stringify(req.body, null, 2));
    
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      console.log('Restaurant not found for ID:', req.params.id);
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    console.log('Found restaurant:', restaurant.name);
    console.log('Restaurant owner:', restaurant.owner.toString());

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Authorization failed - not owner or admin');
      return res.status(403).json({ error: 'Not authorized to update this restaurant' });
    }

    // Remove fields that shouldn't be updated directly
    const { owner, isApproved, ...updateData } = req.body;
    console.log('Sanitized update data:', JSON.stringify(updateData, null, 2));

    // Perform update
    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    console.log('Restaurant updated successfully');
    
    // Verify update was saved
    const verifyRestaurant = await Restaurant.findById(req.params.id);
    console.log('Verified restaurant updated in database:', !!verifyRestaurant);
    
    console.log('=== Restaurant update successful ===');
    res.json(restaurant);
  } catch (error) {
    console.error('=== Update restaurant error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', errors);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error('MongoDB error:', error.message);
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }
    
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (restaurant owner)
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this restaurant' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Approve restaurant
// @route   PUT /api/restaurants/:id/approve
// @access  Private (admin only)
const approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Approve restaurant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get restaurant owned by current user
// @route   GET /api/restaurants/my-restaurant
// @access  Private (restaurant owner)
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id })
      .populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({ error: 'No restaurant found for this user' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Get my restaurant error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getMyRestaurant
};