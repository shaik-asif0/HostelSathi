const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const Hostel = require('../models/Hostel');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/enquiries
// @desc    Submit a new contact/visit enquiry for a hostel (Student only)
// @access  Private
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { hostelId, message } = req.body;

    if (!hostelId) {
      return res.status(400).json({ success: false, error: 'Hostel ID is required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    const enquiry = await Enquiry.create({
      student: req.user._id,
      studentName: req.user.name,
      studentPhone: req.user.phone,
      studentEmail: req.user.email,
      studentCollege: req.user.college,
      hostel: hostelId,
      hostelName: hostel.name,
      owner: hostel.owner,
      message: message || `Hi! I am interested in visiting the ${hostel.name} hostel. Please contact me.`
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully. The hostel owner will contact you soon.',
      enquiry
    });
  } catch (error) {
    console.error('Submit enquiry error:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error submitting enquiry' });
  }
});

// @route   GET /api/enquiries/owner
// @desc    Get all enquiries submitted to this owner's hostels (Owner only)
// @access  Private
router.get('/owner', protect, authorize('owner'), async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    console.error('Fetch owner enquiries error:', error);
    res.status(500).json({ success: false, error: 'Server error retrieving enquiries' });
  }
});

// @route   PUT /api/enquiries/:id
// @desc    Update enquiry status (Owner only)
// @access  Private
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'contacted', 'visited', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid status update' });
    }

    let enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry record not found' });
    }

    // Verify ownership
    if (enquiry.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to modify this enquiry record' });
    }

    enquiry.status = status;
    await enquiry.save();

    res.json({
      success: true,
      message: `Enquiry status updated to ${status}`,
      enquiry
    });
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({ success: false, error: 'Server error updating enquiry status' });
  }
});

module.exports = router;
