const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentPhone: {
    type: String,
    required: true
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomType: {
    type: String, // e.g. 'Single', 'Sharing 2', 'Sharing 3'
    required: true
  },
  rentPaid: {
    type: Number,
    required: true
  },
  utrNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  leaveDate: {
    type: Date
  }
});

module.exports = mongoose.model('Tenant', TenantSchema);
