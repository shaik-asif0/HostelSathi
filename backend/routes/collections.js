const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const { protect } = require('../middleware/auth');

// @route   GET /api/collections
// @desc    Get all saved collections for a student
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, collections: user.savedCollections || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collections' });
  }
});

// @route   POST /api/collections
// @desc    Create a new collection
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Collection name is required' });
    }

    const user = await User.findById(req.user._id);
    user.savedCollections.push({ name: name.trim(), hostels: [] });
    await user.save();

    res.status(201).json({
      success: true,
      collections: user.savedCollections
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create collection' });
  }
});

// @route   PUT /api/collections/:collectionId/add
// @desc    Add a hostel to a collection
// @access  Private
router.put('/:collectionId/add', protect, async (req, res) => {
  try {
    const { hostelId } = req.body;
    if (!hostelId) {
      return res.status(400).json({ success: false, error: 'hostelId is required' });
    }

    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    if (!collection.hostels.includes(hostelId)) {
      collection.hostels.push(hostelId);
    }
    await user.save();

    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add hostel to collection' });
  }
});

// @route   PUT /api/collections/:collectionId/remove
// @desc    Remove a hostel from a collection
// @access  Private
router.put('/:collectionId/remove', protect, async (req, res) => {
  try {
    const { hostelId } = req.body;

    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    collection.hostels = collection.hostels.filter(id => id.toString() !== hostelId);
    await user.save();

    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove hostel from collection' });
  }
});

// @route   PUT /api/collections/:collectionId/rename
// @desc    Rename a collection
// @access  Private
router.put('/:collectionId/rename', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'New name is required' });
    }

    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    collection.name = name.trim();
    await user.save();

    res.json({ success: true, collections: user.savedCollections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to rename collection' });
  }
});

// @route   DELETE /api/collections/:collectionId
// @desc    Delete a collection
// @access  Private
router.delete('/:collectionId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedCollections = user.savedCollections.filter(
      c => c._id.toString() !== req.params.collectionId
    );
    await user.save();

    res.json({ success: true, collections: user.savedCollections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete collection' });
  }
});

// @route   GET /api/collections/:collectionId/hostels
// @desc    Get full hostel details for all hostels in a collection
// @access  Private
router.get('/:collectionId/hostels', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const collection = user.savedCollections.id(req.params.collectionId);
    if (!collection) {
      return res.status(404).json({ success: false, error: 'Collection not found' });
    }

    const hostels = await Hostel.find({ _id: { $in: collection.hostels } });
    res.json({ success: true, collection: { ...collection.toObject(), hostelDetails: hostels } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch collection hostels' });
  }
});

module.exports = router;
