const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const User = require('../models/User');
const Payment = require('../models/Payment');
const Tenant = require('../models/Tenant');
const Hostel = require('../models/Hostel');
const { protect } = require('../middleware/auth');

// Initialize Razorpay (User must provide real keys in .env)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order for rent/deposit
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, type, tenantId, hostelId } = req.body;

    if (!amount || !type || !hostelId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Amount should be in paise (multiply by 100)
    const options = {
      amount: parseInt(amount) * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Save initial Payment record
    let ownerId;
    const hostel = await Hostel.findById(hostelId);
    if (hostel) ownerId = hostel.owner;

    const payment = await Payment.create({
      tenant: tenantId || null,
      student: req.user._id,
      hostel: hostelId,
      owner: ownerId,
      amount: parseInt(amount),
      type,
      razorpayOrderId: order.id,
      status: 'created'
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment signature
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      payment_record_id
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is successful
      const payment = await Payment.findById(payment_record_id);
      if (!payment) return res.status(404).json({ success: false, error: 'Payment record not found' });

      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'successful';
      
      // Auto-generate a simple receipt URL placeholder
      payment.receiptUrl = `/receipts/${payment._id}`;
      await payment.save();

      // If this is a rent payment, update Tenant dues
      if (payment.tenant && payment.type === 'rent') {
        const tenant = await Tenant.findById(payment.tenant);
        if (tenant) {
          tenant.paidAmount += payment.amount;
          tenant.pendingAmount = Math.max(0, tenant.pendingAmount - payment.amount);
          
          // If fully paid, clear late fee and set next due date (e.g. 1 month later)
          if (tenant.pendingAmount === 0) {
            tenant.lateFee = 0;
            // Next due date logic can be added here
          }
          await tenant.save();
        }
      }

      // If it's the 5 INR contact unlock
      if (payment.type === 'other' && payment.amount === 5) {
        const user = await User.findById(req.user._id);
        if (!user.unlockedHostels) user.unlockedHostels = [];
        if (!user.unlockedHostels.includes(payment.hostel)) {
          user.unlockedHostels.push(payment.hostel);
          await user.save();
        }
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        payment
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
});

// @route   GET /api/payments/me
// @desc    Get user's past payments/receipts
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user._id, status: 'successful' })
      .populate('hostel', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
  }
});

// @route   POST /api/payments/verify-screenshot
// @desc    Verify payment screenshot for unlocking a hostel
// @access  Private
router.post('/verify-screenshot', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { hostelId } = req.body;
    
    if (!req.file || !hostelId) {
      return res.status(400).json({ success: false, error: 'Screenshot and hostelId are required' });
    }

    // Generate MD5 hash of the image buffer to simulate UTR extraction/deduplication
    const utrCode = crypto.createHash('md5').update(req.file.buffer).digest('hex');

    // Check for duplicate screenshot
    const existingPayment = await Payment.findOne({ utrCode });
    if (existingPayment) {
      return res.status(400).json({ success: false, error: 'Duplicate screenshot detected. This payment has already been verified.' });
    }

    // Find hostel to get owner ID
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });

    // Save payment record
    const payment = await Payment.create({
      student: req.user._id,
      hostel: hostelId,
      owner: hostel.owner,
      amount: 5,
      type: 'other',
      razorpayOrderId: `mock_order_${Date.now()}`,
      status: 'successful',
      utrCode: utrCode
    });

    // Unlock hostel for user
    const user = await User.findById(req.user._id);
    if (!user.unlockedHostels) user.unlockedHostels = [];
    if (!user.unlockedHostels.includes(hostelId)) {
      user.unlockedHostels.push(hostelId);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Screenshot verified. Contact details unlocked.',
      payment,
      unlockedHostels: user.unlockedHostels
    });

  } catch (error) {
    console.error('Verify screenshot error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify screenshot' });
  }
});

// @route   POST /api/payments/scan-pay
// @desc    Mock Scan & Pay flow
// @access  Private
router.post('/scan-pay', protect, async (req, res) => {
  try {
    const { amount, hostelId, type } = req.body;
    
    if (!amount || !hostelId) {
      return res.status(400).json({ success: false, error: 'Amount and hostelId are required' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });

    // Mock Razorpay Order ID for receipt
    const mockOrderId = `mock_order_${crypto.randomBytes(6).toString('hex')}`;
    const mockPaymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;

    const payment = await Payment.create({
      student: req.user._id,
      hostel: hostelId,
      owner: hostel.owner,
      amount: parseInt(amount),
      type: type || 'other',
      razorpayOrderId: mockOrderId,
      razorpayPaymentId: mockPaymentId,
      status: 'successful',
      receiptUrl: `/receipts/mock_${Date.now()}`
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error('Scan Pay error:', error);
    res.status(500).json({ success: false, error: 'Failed to process scan and pay' });
  }
});

module.exports = router;
