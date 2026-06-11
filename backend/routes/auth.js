const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'hostelsathi_super_secret_key', {
    expiresIn: '30d'
  });
};

// Simple active verification codes in-memory cache for mock OTP
const mockOtps = {};

// @route   POST /api/auth/register
// @desc    Register a student or owner
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty(),
    body('phone', 'Please enter a valid phone number').isLength({ min: 10 }),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    body('role', 'Role must be student or owner').isIn(['student', 'owner'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, email, password, role, college } = req.body;

    try {
      // Check if user exists (by email or phone)
      let user = await User.findOne({ $or: [{ email }, { phone }] });
      if (user) {
        return res.status(400).json({
          success: false,
          error: user.phone === phone ? 'Phone number already registered' : 'Email already registered'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      user = await User.create({
        name,
        phone,
        email,
        password: hashedPassword,
        role,
        college: role === 'student' ? (college || '') : ''
      });

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          college: user.college
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Server registration error' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user (student or owner) & get token
// @access  Public
router.post(
  '/login',
  [
    body('username', 'Username (Email or Phone) is required').notEmpty(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check user by email or phone
      const user = await User.findOne({
        $or: [{ email: username.toLowerCase() }, { phone: username }]
      });

      if (!user) {
        return res.status(400).json({ success: false, error: 'Invalid Credentials' });
      }

      // Match password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: 'Invalid Credentials' });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          college: user.college
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Server login error' });
    }
  }
);

// @route   POST /api/auth/send-otp
// @desc    Simulate sending OTP verification code (for Mobile Auth simulation)
// @access  Public
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ success: false, error: 'Please enter a valid phone number' });
  }

  // Generate a mock 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  mockOtps[phone] = code;

  console.log(`\n=============================================`);
  console.log(`🔥 [HostelSathi SMS] OTP code for ${phone} is: ${code}`);
  console.log(`=============================================\n`);

  res.json({
    success: true,
    message: `Verification code printed to developer console. Check backend log output!`,
    // For convenience in frontend dev environment, we also return the code
    code: code
  });
});

// @route   POST /api/auth/verify-otp
// @desc    Verify mock OTP and login/register
// @access  Public
router.post('/verify-otp', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ success: false, error: 'Phone and code are required' });
  }

  if (mockOtps[phone] === code || code === '1234') { // Allow '1234' as universal testing bypass
    delete mockOtps[phone]; // Clean up
    
    // Find user by phone, if exists return token, else tell client to complete registration
    let user = await User.findOne({ phone });
    if (user) {
      return res.json({
        success: true,
        registered: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          college: user.college
        }
      });
    } else {
      return res.json({
        success: true,
        registered: false,
        message: 'Phone verified. Complete registration.'
      });
    }
  }

  res.status(400).json({ success: false, error: 'Invalid verification code' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
