const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Hostel = require('../models/Hostel');
const { protect, authorize } = require('../middleware/auth');

// Helper function to update Hostel ratings
const updateHostelRating = async (hostelId) => {
  const reviews = await Review.find({ hostel: hostelId });
  const reviewCount = reviews.length;
  
  let rating = 0;
  if (reviewCount > 0) {
    const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
    rating = Math.round((sum / reviewCount) * 10) / 10; // Round to 1 decimal place
  }

  await Hostel.findByIdAndUpdate(hostelId, {
    rating,
    reviewCount
  });
};

// @route   POST /api/reviews
// @desc    Add review for a hostel (Student only)
// @access  Private
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { hostelId, rating, comment } = req.body;

    if (!hostelId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Please provide hostelId, rating, and comment' });
    }

    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    // Check if student already reviewed this hostel
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      hostel: hostelId
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted a review for this hostel'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      userName: req.user.name,
      hostel: hostelId,
      rating: parseInt(rating),
      comment
    });

    // Update the average rating & count on the Hostel model
    await updateHostelRating(hostelId);

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error adding review' });
  }
});

// @route   GET /api/reviews/:hostelId
// @desc    Get all reviews for a specific hostel
// @access  Public
router.get('/:hostelId', async (req, res) => {
  try {
    const reviews = await Review.find({ hostel: req.params.hostelId })
      .sort({ createdAt: -1 })
      .populate('user', 'name college');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving reviews' });
  }
});

module.exports = router;
