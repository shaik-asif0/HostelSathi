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
  rentAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date
  },
  lateFee: {
    type: Number,
    default: 0
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
