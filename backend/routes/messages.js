const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/:hostelId
// @desc    Get chat history for a hostel (between student and owner)
// @access  Private
router.get('/:hostelId', protect, async (req, res) => {
  try {
    const { hostelId } = req.params;
    const userId = req.user._id;

    // Fetch all messages where user is sender or receiver for this hostel
    const messages = await Message.find({
      hostel: hostelId,
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: 1 }).limit(100);

    // Mark received messages as read
    await Message.updateMany(
      { hostel: hostelId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, count: messages.length, messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// @route   POST /api/messages
// @desc    Send a message (also used as REST fallback when socket is unavailable)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { hostelId, receiverId, content } = req.body;

    if (!hostelId || !receiverId || !content) {
      return res.status(400).json({ success: false, error: 'hostelId, receiverId, and content are required' });
    }

    const message = await Message.create({
      hostel: hostelId,
      sender: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiver: receiverId,
      content: content.trim()
    });

    // Create a notification for the receiver
    await Notification.create({
      user: receiverId,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      body: content.length > 60 ? content.substring(0, 60) + '...' : content,
      data: { hostelId, messageId: message._id.toString() }
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// @route   GET /api/messages/conversations/list
// @desc    Get all conversations for current user (list of unique hostel threads)
// @access  Private
router.get('/conversations/list', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get distinct hostel IDs the user has chatted in
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$hostel',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'hostels',
          localField: '_id',
          foreignField: '_id',
          as: 'hostelInfo'
        }
      },
      { $unwind: { path: '$hostelInfo', preserveNullAndEmptyArrays: true } }
    ]);

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark a message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark message as read' });
  }
});

module.exports = router;
