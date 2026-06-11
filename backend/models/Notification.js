const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  type: {
    type: String,
    enum: ['new_enquiry', 'enquiry_update', 'new_message', 'new_hostel_nearby', 'review', 'general'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  body: {
    type: String,
    required: [true, 'Notification body is required'],
    trim: true
  },
  data: {
    // Extra context (hostelId, enquiryId, messageId etc.)
    hostelId: { type: String, default: null },
    enquiryId: { type: String, default: null },
    messageId: { type: String, default: null }
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
