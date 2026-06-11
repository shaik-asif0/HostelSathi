const mongoose = require('mongoose');

const UsedUTRSchema = new mongoose.Schema({
  utr: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostelId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 31536000 // Automatically delete after 1 year
  }
});

module.exports = mongoose.model('UsedUTR', UsedUTRSchema);
