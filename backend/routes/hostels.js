const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Hostel = require('../models/Hostel');
const { protect, authorize } = require('../middleware/auth');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage setup for local file fallback uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed'));
    }
  }
});

// @route   GET /api/hostels
// @desc    Get all hostels (with query filtering)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      gender,
      foodIncluded,
      foodType,
      amenities,
      maxRent,
      college,
      search,
      sharing,
      premiumOnly
    } = req.query;

    const query = {};

    // 1. Gender Filter
    if (gender && gender !== 'all') {
      query.gender = gender; // "boys" | "girls" | "both"
    }

    // 2. Food Filters
    if (foodIncluded === 'true') {
      query.foodIncluded = true;
    }
    if (foodType && foodType !== 'all') {
      query.foodType = foodType; // "veg" | "nonveg" | "both"
    }

    // 3. Amenities Filter (Comma separated values)
    if (amenities) {
      const amenitiesList = amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    // 4. Rent Budget Filter (Check single/sharing2/sharing3 ranges)
    if (maxRent) {
      const budget = parseInt(maxRent);
      query.$or = [
        { 'rent.single': { $gt: 0, $lte: budget } },
        { 'rent.sharing2': { $gt: 0, $lte: budget } },
        { 'rent.sharing3': { $gt: 0, $lte: budget } }
      ];
    }

    // 5. College Selection
    if (college) {
      // Matches partial text or matches list element
      query.nearbyColleges = { $regex: college, $options: 'i' };
    }

    // 6. Search String (Matches hostel name, owner, or address)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    // 7. Premium Listing Sorting flag
    if (premiumOnly === 'true') {
      query.isPremium = true;
    }

    // Sort: premium first, then by date/rating
    const hostels = await Hostel.find(query).sort({ isPremium: -1, rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: hostels.length,
      hostels
    });
  } catch (error) {
    console.error('Fetch hostels error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving hostels' });
  }
});

// @route   GET /api/hostels/nearby
// @desc    Find hostels close to a coordinate using 2dsphere $near
// @access  Public
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 3000 } = req.query; // maxDistance default 3km

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        error: 'Please provide longitude (lng) and latitude (lat) query parameters'
      });
    }

    const hostels = await Hostel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json({
      success: true,
      count: hostels.length,
      hostels
    });
  } catch (error) {
    console.error('Fetch nearby hostels error:', error);
    res.status(500).json({ success: false, error: 'Geospatial search failed' });
  }
});

// @route   GET /api/hostels/recommended
// @desc    Get AI-scored personalized hostel recommendations for authenticated students
// @access  Public (uses auth token if available for personalization)
router.get('/recommended', async (req, res) => {
  try {
    // Extract optional auth token for personalization
    let userPreferences = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../models/User');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'hostelsathi_super_secret_key');
        const user = await User.findById(decoded.id);
        if (user) userPreferences = user.preferences;
      } catch (_) { /* token invalid, use default scoring */ }
    }

    const allHostels = await Hostel.find({}).sort({ isPremium: -1, rating: -1 });

    // Score each hostel based on preferences
    const scored = allHostels.map(h => {
      let score = 0;

      // Premium boost
      if (h.isPremium) score += 30;
      // Verified boost
      if (h.isVerified) score += 20;
      // Rating boost (up to 25 points)
      score += (h.rating || 0) * 5;
      // Review count boost (up to 10 points)
      score += Math.min(h.reviewCount * 2, 10);
      // View count signal (popularity)
      score += Math.min((h.viewCount || 0) / 10, 15);

      // Personalization bonuses
      if (userPreferences) {
        // Budget match (within 20% of their budget)
        const budget = userPreferences.budget || 10000;
        const minRent = Math.min(
          h.rent.single || 99999,
          h.rent.sharing2 || 99999,
          h.rent.sharing3 || 99999
        );
        if (minRent <= budget) score += 25;
        else if (minRent <= budget * 1.2) score += 10;

        // Gender preference match
        if (userPreferences.gender !== 'all' && h.gender === userPreferences.gender) score += 15;
        if (h.gender === 'both') score += 5;

        // Food preference match
        if (userPreferences.foodRequired && h.foodIncluded) score += 15;

        // Amenities overlap score
        const preferredAmenities = userPreferences.preferredAmenities || [];
        const overlap = preferredAmenities.filter(a => h.amenities.includes(a)).length;
        score += overlap * 5;
      }

      return { hostel: h, score };
    });

    // Sort by score descending, return top 10
    scored.sort((a, b) => b.score - a.score);
    const recommended = scored.slice(0, 10).map(s => s.hostel);

    res.json({ success: true, count: recommended.length, hostels: recommended });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate recommendations' });
  }
});

// @route   GET /api/hostels/:id/analytics
// @desc    Get analytics data for a specific hostel (Owner only)
// @access  Private
router.get('/:id/analytics', protect, authorize('owner'), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }
    if (hostel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const Enquiry = require('../models/Enquiry');
    const enquiries = await Enquiry.find({ hostel: hostel._id });

    // Enquiry conversion funnel
    const funnel = {
      pending: enquiries.filter(e => e.status === 'pending').length,
      contacted: enquiries.filter(e => e.status === 'contacted').length,
      visited: enquiries.filter(e => e.status === 'visited').length,
      closed: enquiries.filter(e => e.status === 'closed').length
    };

    // Occupancy estimate
    const totalBeds = (hostel.availability.singleVacancy || 0) +
      (hostel.availability.sharing2Vacancy || 0) * 2 +
      (hostel.availability.sharing3Vacancy || 0) * 3;

    res.json({
      success: true,
      analytics: {
        totalViews: hostel.viewCount || 0,
        weeklyViews: hostel.weeklyViews || [0, 0, 0, 0, 0, 0, 0],
        rating: hostel.rating,
        reviewCount: hostel.reviewCount,
        enquiryFunnel: funnel,
        totalEnquiries: enquiries.length,
        availability: hostel.availability,
        totalBeds,
        potentialRevenue: {
          single: (hostel.rent.single || 0) * (hostel.availability.singleVacancy || 0),
          sharing2: (hostel.rent.sharing2 || 0) * (hostel.availability.sharing2Vacancy || 0),
          sharing3: (hostel.rent.sharing3 || 0) * (hostel.availability.sharing3Vacancy || 0)
        }
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

// @route   POST /api/hostels/:id/track-view
// @desc    Increment hostel view count (called when student views hostel details)
// @access  Public
router.post('/:id/track-view', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });

    // Increment total view count
    hostel.viewCount = (hostel.viewCount || 0) + 1;

    // Update today's slot in weeklyViews (rotate array to always keep last 7 days)
    const today = new Date().getDay(); // 0=Sun, 6=Sat
    const weekly = [...(hostel.weeklyViews || [0, 0, 0, 0, 0, 0, 0])];
    weekly[today] = (weekly[today] || 0) + 1;
    hostel.weeklyViews = weekly;

    await hostel.save();
    res.json({ success: true, viewCount: hostel.viewCount });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to track view' });
  }
});

// @route   GET /api/hostels/:id
// @desc    Get single hostel profile
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel profile not found' });
    }
    res.json({ success: true, hostel });
  } catch (error) {
    console.error('Fetch single hostel error:', error);
    res.status(500).json({ success: false, error: 'Invalid ID format or server error' });
  }
});

// @route   POST /api/hostels
// @desc    Create a new hostel profile listing (Owner only)
// @access  Private
router.post('/', protect, authorize('owner'), async (req, res) => {
  try {
    const {
      name,
      address,
      lng,
      lat,
      nearbyColleges,
      rentSingle,
      rentSharing2,
      rentSharing3,
      foodIncluded,
      foodType,
      amenities,
      gender,
      isPremium,
      singleVacancy,
      sharing2Vacancy,
      sharing3Vacancy,
      rules,
      fees
    } = req.body;

    // Split colleges and amenities lists if they arrive as strings
    const collegesArray = Array.isArray(nearbyColleges)
      ? nearbyColleges
      : nearbyColleges ? nearbyColleges.split(',').map(s => s.trim()) : [];
      
    const amenitiesArray = Array.isArray(amenities)
      ? amenities
      : amenities ? amenities.split(',').map(s => s.trim()) : [];

    const newHostel = await Hostel.create({
      name,
      owner: req.user._id,
      ownerName: req.user.name,
      phone: req.user.phone,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng || 78.4867), parseFloat(lat || 17.3850)] // default Hyderabad coords if empty
      },
      nearbyColleges: collegesArray,
      rent: {
        single: parseInt(rentSingle || 0),
        sharing2: parseInt(rentSharing2 || 0),
        sharing3: parseInt(rentSharing3 || 0)
      },
      foodIncluded: foodIncluded === 'true' || foodIncluded === true,
      foodType: foodType || 'none',
      amenities: amenitiesArray,
      gender: gender || 'both',
      isPremium: isPremium === 'true' || isPremium === true,
      isVerified: false,
      rating: 0,
      reviewCount: 0,
      photos: [],
      rules: rules || {},
      fees: fees || {},
      availability: {
        singleVacancy: parseInt(singleVacancy || 0),
        sharing2Vacancy: parseInt(sharing2Vacancy || 0),
        sharing3Vacancy: parseInt(sharing3Vacancy || 0),
        lastUpdated: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Hostel listing created successfully',
      hostel: newHostel
    });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error creating hostel listing' });
  }
});

// @route   PUT /api/hostels/:id
// @desc    Update a hostel profile listing (Owner only)
// @access  Private
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel profile not found' });
    }

    // Verify ownership
    if (hostel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this listing' });
    }

    const {
      name,
      address,
      lng,
      lat,
      nearbyColleges,
      rentSingle,
      rentSharing2,
      rentSharing3,
      foodIncluded,
      foodType,
      amenities,
      gender,
      isPremium,
      rules,
      fees,
      paymentUpiId
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (lng && lat) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }
    if (nearbyColleges) {
      updateData.nearbyColleges = Array.isArray(nearbyColleges)
        ? nearbyColleges
        : nearbyColleges.split(',').map(s => s.trim());
    }
    if (rentSingle || rentSharing2 || rentSharing3) {
      updateData.rent = {
        single: rentSingle !== undefined ? parseInt(rentSingle) : hostel.rent.single,
        sharing2: rentSharing2 !== undefined ? parseInt(rentSharing2) : hostel.rent.sharing2,
        sharing3: rentSharing3 !== undefined ? parseInt(rentSharing3) : hostel.rent.sharing3
      };
    }
    if (foodIncluded !== undefined) {
      updateData.foodIncluded = foodIncluded === 'true' || foodIncluded === true;
    }
    if (foodType) updateData.foodType = foodType;
    if (amenities) {
      updateData.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map(s => s.trim());
    }
    if (gender) updateData.gender = gender;
    if (isPremium !== undefined) {
      updateData.isPremium = isPremium === 'true' || isPremium === true;
    }
    if (rules) updateData.rules = rules;
    if (fees) updateData.fees = fees;
    if (paymentUpiId !== undefined) updateData.paymentUpiId = paymentUpiId;

    hostel = await Hostel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Hostel details updated successfully',
      hostel
    });
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(500).json({ success: false, error: 'Server error updating hostel' });
  }
});

// @route   PUT /api/hostels/:id/vacancies
// @desc    Update a hostel's vacancy counts (Owner only)
// @access  Private
router.put('/:id/vacancies', protect, authorize('owner'), async (req, res) => {
  try {
    let hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });
    if (hostel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { singleVacancy, sharing2Vacancy, sharing3Vacancy } = req.body;
    
    if (!hostel.availability) hostel.availability = {};
    if (singleVacancy !== undefined) hostel.availability.singleVacancy = singleVacancy;
    if (sharing2Vacancy !== undefined) hostel.availability.sharing2Vacancy = sharing2Vacancy;
    if (sharing3Vacancy !== undefined) hostel.availability.sharing3Vacancy = sharing3Vacancy;
    hostel.availability.lastUpdated = new Date();

    await hostel.save();
    res.json({ success: true, message: 'Vacancies updated', availability: hostel.availability });
  } catch (err) {
    console.error('Update vacancies error:', err);
    res.status(500).json({ success: false, error: 'Failed to update vacancies' });
  }
});

// @route   POST /api/hostels/:id/photos
// @desc    Upload photos for a hostel listing (Owner only)
// @access  Private
router.post('/:id/photos', protect, authorize('owner'), upload.array('photos', 5), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel profile not found' });
    }

    // Verify ownership
    if (hostel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to upload files for this listing' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one image' });
    }

    // Construct local serving URLs
    const photosPaths = req.files.map(file => `/uploads/${file.filename}`);
    
    // Add new photos to list
    hostel.photos = [...hostel.photos, ...photosPaths];
    await hostel.save();

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      photos: hostel.photos
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ success: false, error: error.message || 'Photo uploading process failed' });
  }
});

// @route   DELETE /api/hostels/:id
// @desc    Delete a hostel listing (Owner only)
// @access  Private
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel profile not found' });
    }

    // Verify ownership
    if (hostel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this listing' });
    }

    // Clean up local images first
    if (hostel.photos && hostel.photos.length > 0) {
      hostel.photos.forEach(photoPath => {
        const fullPath = path.join(__dirname, '../public', photoPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
          } catch (e) {
            console.error('Failed to delete image file on disk:', e);
          }
        }
      });
    }

    await Hostel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Hostel profile and files deleted successfully'
    });
  } catch (error) {
    console.error('Delete hostel error:', error);
    res.status(500).json({ success: false, error: 'Server error deleting hostel listing' });
  }
});

module.exports = router;
