const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  userName: {
    type: String,
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only leave one review per hostel
ReviewSchema.index({ user: 1, hostel: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
