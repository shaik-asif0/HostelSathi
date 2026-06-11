const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const tesseract = require('tesseract.js');

const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/tenants/join
// @desc    Student joins hostel via UPI payment screenshot
// @access  Private (Students only)
router.post('/join', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { hostelId, roomType, rentAmount } = req.body;
    
    if (!hostelId || !roomType || !rentAmount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can join hostels' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Payment screenshot is required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    // Run Tesseract OCR on the image buffer
    console.log('Running OCR on rent payment screenshot...');
    const result = await tesseract.recognize(req.file.buffer, 'eng');
    
    const extractedText = result.data.text;
    
    // Find any 12-digit UTR numbers
    const utrRegex = /\b\d{12}\b/g;
    const matches = extractedText.match(utrRegex);
    
    if (!matches || matches.length === 0) {
      return res.status(400).json({ success: false, error: 'Could not detect a 12-digit UTR in the screenshot.' });
    }

    const detectedUtr = matches[0];

    // Check uniqueness across tenants
    const existingUtr = await Tenant.findOne({ utrNumber: detectedUtr });
    if (existingUtr) {
      return res.status(400).json({ success: false, error: `UTR ${detectedUtr} has already been used for a rent payment.` });
    }

    // Create Tenant
    const tenant = await Tenant.create({
      student: req.user._id,
      studentName: req.user.name,
      studentPhone: req.user.phone,
      hostel: hostelId,
      owner: hostel.owner,
      roomType,
      rentPaid: parseInt(rentAmount),
      utrNumber: detectedUtr,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined hostel and paid rent!',
      tenant
    });

  } catch (error) {
    console.error('Tenant join error:', error);
    res.status(500).json({ success: false, error: 'Failed to process rent payment' });
  }
});

// @route   GET /api/tenants/hostel/:hostelId
// @desc    Get all active tenants for a hostel
// @access  Private (Owner only)
router.get('/hostel/:hostelId', protect, authorize('owner'), async (req, res) => {
  try {
    const tenants = await Tenant.find({
      hostel: req.params.hostelId,
      owner: req.user._id,
      status: 'active'
    }).sort({ joinDate: -1 });

    res.json({ success: true, count: tenants.length, tenants });
  } catch (error) {
    console.error('Fetch tenants error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenants' });
  }
});

// @route   PUT /api/tenants/:id/remove
// @desc    Remove a tenant (mark as completed)
// @access  Private (Owner only)
router.put('/:id/remove', protect, authorize('owner'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    if (tenant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    tenant.status = 'completed';
    tenant.leaveDate = new Date();
    await tenant.save();

    res.json({ success: true, message: 'Student successfully removed', tenant });
  } catch (error) {
    console.error('Remove tenant error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove tenant' });
  }
});

module.exports = router;
