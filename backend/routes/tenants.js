const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');
const Hostel = require('../models/Hostel');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/tenants/join
// @desc    Student joins hostel (Creates Tenant Record + Generates Initial Due)
// @access  Private (Students only)
router.post('/join', protect, async (req, res) => {
  try {
    const { hostelId, roomType, rentAmount } = req.body;
    
    if (!hostelId || !roomType || !rentAmount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, error: 'Only students can join hostels' });
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ success: false, error: 'Hostel not found' });
    }

    // Check if already a tenant
    const existingTenant = await Tenant.findOne({ student: req.user._id, hostel: hostelId, status: 'active' });
    if (existingTenant) {
      return res.status(400).json({ success: false, error: 'You are already a tenant in this hostel' });
    }

    // Set initial due date to today + 5 days grace period
    const initialDueDate = new Date();
    initialDueDate.setDate(initialDueDate.getDate() + 5);

    // Create Tenant
    const tenant = await Tenant.create({
      student: req.user._id,
      studentName: req.user.name,
      studentPhone: req.user.phone,
      hostel: hostelId,
      owner: hostel.owner,
      roomType,
      rentAmount: parseInt(rentAmount),
      pendingAmount: parseInt(rentAmount),
      paidAmount: 0,
      dueDate: initialDueDate,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined hostel! Rent due generated.',
      tenant
    });

  } catch (error) {
    console.error('Tenant join error:', error);
    res.status(500).json({ success: false, error: 'Failed to join hostel' });
  }
});

// @route   GET /api/tenants/me
// @desc    Get current student tenant info
// @access  Private (Student only)
router.get('/me', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ student: req.user._id, status: 'active' });
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'No active tenancy found' });
    }
    res.json({ success: true, tenant });
  } catch (error) {
    console.error('Fetch my tenant info error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tenant info' });
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

// @route   PUT /api/tenants/:id/due
// @desc    Owner manually updates/generates due for a tenant
// @access  Private (Owner only)
router.put('/:id/due', protect, authorize('owner'), async (req, res) => {
  try {
    const { pendingAmount, lateFee, dueDate } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });
    if (tenant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (pendingAmount !== undefined) tenant.pendingAmount = pendingAmount;
    if (lateFee !== undefined) tenant.lateFee = lateFee;
    if (dueDate !== undefined) tenant.dueDate = new Date(dueDate);

    await tenant.save();
    res.json({ success: true, message: 'Dues updated successfully', tenant });
  } catch (error) {
    console.error('Update dues error:', error);
    res.status(500).json({ success: false, error: 'Failed to update dues' });
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
