const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @route   GET /api/messages/conversations/list
// @desc    Get all conversations for current user (list of unique threads)
// @access  Private
router.get('/conversations/list', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          // Group by hostel AND the other user to isolate threads!
          _id: {
            hostel: '$hostel',
            otherUser: {
              $cond: [ { $eq: ['$sender', userId] }, '$receiver', '$sender' ]
            }
          },
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
          localField: '_id.hostel',
          foreignField: '_id',
          as: 'hostelInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUserInfo'
        }
      },
      { $unwind: { path: '$hostelInfo', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$otherUserInfo', preserveNullAndEmptyArrays: true } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    // Format to match old output shape but with otherUser info included
    const formattedConversations = conversations.map(c => ({
      _id: c._id.hostel, // keep _id as hostel for frontend legacy reasons
      otherUserId: c._id.otherUser,
      otherUserName: c.otherUserInfo ? c.otherUserInfo.name : 'Unknown User',
      hostelInfo: c.hostelInfo,
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount
    }));

    res.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
});

// @route   GET /api/messages/:hostelId/:studentId?
// @desc    Get chat history for a hostel (between student and owner)
// @access  Private
router.get('/:hostelId/:studentId?', protect, async (req, res) => {
  try {
    const { hostelId, studentId } = req.params;
    const userId = req.user._id;

    const query = { hostel: hostelId };
    
    // If a specific studentId is provided (by owner), restrict thread to that user.
    // Otherwise, assume it's the current user (student viewing owner's thread).
    if (studentId) {
      query.$or = [
        { sender: userId, receiver: studentId },
        { sender: studentId, receiver: userId }
      ];
    } else {
      query.$or = [{ sender: userId }, { receiver: userId }];
    }

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(100);

    // Mark received messages as read
    await Message.updateMany(
      { ...query, receiver: userId, read: false },
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
