const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UsedUTR = require('../models/UsedUTR');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const tesseract = require('tesseract.js');

const upload = multer({ storage: multer.memoryStorage() });

// @route   POST /api/payments/unlock
// @desc    Simulate payment of ₹5 to unlock hostel details
// @access  Private (Students only)
router.post('/unlock', protect, async (req, res) => {
  try {
    const { hostelId } = req.body;
    
    if (!hostelId) {
      return res.status(400).json({ success: false, error: 'Hostel ID is required' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can unlock hostels' });
    }

    const user = await User.findById(req.user._id);

    // Check if already unlocked
    if (user.unlockedHostels && user.unlockedHostels.includes(hostelId)) {
      return res.status(400).json({ success: false, error: 'Hostel already unlocked' });
    }

    // SIMULATE PAYMENT PROCESSING...
    // In a real app, you would verify a Razorpay/Stripe signature here.
    
    // Add to unlocked list
    if (!user.unlockedHostels) {
      user.unlockedHostels = [];
    }
    user.unlockedHostels.push(hostelId);
    await user.save();

    res.json({
      success: true,
      message: 'Payment successful. Hostel contact details unlocked!',
      unlockedHostels: user.unlockedHostels
    });

  } catch (error) {
    console.error('Payment unlock error:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
});

// @route   POST /api/payments/verify-screenshot
// @desc    Verify payment screenshot using OCR
// @access  Private (Students only)
router.post('/verify-screenshot', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { hostelId } = req.body;
    
    if (!hostelId) {
      return res.status(400).json({ success: false, error: 'Hostel ID is required' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can unlock hostels' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Screenshot image is required' });
    }

    // Run Tesseract OCR on the image buffer
    console.log('Running OCR on screenshot...');
    const result = await tesseract.recognize(req.file.buffer, 'eng', {
      logger: m => console.log(m.status, Math.round(m.progress * 100) + '%')
    });
    
    const extractedText = result.data.text;
    console.log('Extracted text length:', extractedText.length);
    
    // Find any 12-digit numbers
    const utrRegex = /\b\d{12}\b/g;
    const matches = extractedText.match(utrRegex);
    
    if (!matches || matches.length === 0) {
      return res.status(400).json({ success: false, error: 'Could not detect a 12-digit UTR in the screenshot. Please upload a clear payment success image.' });
    }

    // Use the first 12-digit number found
    const detectedUtr = matches[0];
    console.log('Detected UTR:', detectedUtr);

    // Check uniqueness
    const existingUtr = await UsedUTR.findOne({ utr: detectedUtr });
    if (existingUtr) {
      return res.status(400).json({ success: false, error: `UTR ${detectedUtr} has already been used. Please upload a unique payment screenshot.` });
    }

    const user = await User.findById(req.user._id);

    if (user.unlockedHostels && user.unlockedHostels.includes(hostelId)) {
      return res.status(400).json({ success: false, error: 'Hostel already unlocked' });
    }

    // Save UTR and unlock hostel
    const usedUtr = new UsedUTR({ utr: detectedUtr, userId: user._id, hostelId });
    await usedUtr.save();

    if (!user.unlockedHostels) {
      user.unlockedHostels = [];
    }
    user.unlockedHostels.push(hostelId);
    await user.save();

    res.json({
      success: true,
      message: `Verified successfully (UTR: ${detectedUtr}). Details unlocked!`,
      unlockedHostels: user.unlockedHostels
    });

  } catch (error) {
    console.error('OCR Verification error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify screenshot using AI.' });
  }
});

module.exports = router;
