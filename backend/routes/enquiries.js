const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const Hostel = require('../models/Hostel');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/enquiries
// @desc    Student creates a new enquiry/lead for a hostel
// @access  Private (Student)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can create enquiries' });
    }

    const { hostelId, message, moveInDate, roomType, studentCollege } = req.body;

    if (!hostelId) {
      return res.status(400).json({ success: false, error: 'Hostel ID is required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    // Check if student already has a pending enquiry for this hostel
    const existingEnquiry = await Enquiry.findOne({
      student: req.user._id,
      hostel: hostelId,
      status: { $in: ['pending', 'contacted'] }
    });

    if (existingEnquiry) {
      return res.status(400).json({ success: false, error: 'You already have an active enquiry for this hostel' });
    }

    const newEnquiry = await Enquiry.create({
      student: req.user._id,
      studentName: req.user.name,
      studentPhone: req.user.phone,
      studentEmail: req.user.email,
      studentCollege: studentCollege || '',
      hostel: hostel._id,
      hostelName: hostel.name,
      owner: hostel.owner,
      message: message || 'I am interested in joining your hostel.',
      moveInDate: moveInDate || null,
      roomType: roomType || 'any'
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry sent successfully to the owner',
      enquiry: newEnquiry
    });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
});

// @route   GET /api/enquiries/me
// @desc    Get all enquiries made by the student
// @access  Private (Student)
router.get('/me', protect, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    console.error('Fetch student enquiries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

// @route   GET /api/enquiries/owner
// @desc    Get all enquiries for the owner's hostels
// @access  Private (Owner)
router.get('/owner', protect, authorize('owner'), async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    console.error('Fetch owner enquiries error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
});

// @route   PUT /api/enquiries/:id/status
// @desc    Owner updates the status of an enquiry (Lead Management)
// @access  Private (Owner)
router.put('/:id/status', protect, authorize('owner'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'visited', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }

    if (enquiry.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this enquiry' });
    }

    enquiry.status = status;
    await enquiry.save();

    res.json({
      success: true,
      message: `Enquiry marked as ${status}`,
      enquiry
    });
  } catch (error) {
    console.error('Update enquiry status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update enquiry status' });
  }
});

module.exports = router;
