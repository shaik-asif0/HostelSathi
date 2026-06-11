const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student user is required']
  },
  studentName: {
    type: String,
    required: true
  },
  studentPhone: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  studentCollege: {
    type: String,
    default: ''
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel',
    required: [true, 'Hostel reference is required']
  },
  hostelName: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required']
  },
  message: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'visited', 'closed'],
    default: 'pending'
  },
  // Booking date preference for calendar feature
  moveInDate: {
    type: Date,
    default: null
  },
  // Room type preference
  roomType: {
    type: String,
    enum: ['single', 'sharing2', 'sharing3', 'any'],
    default: 'any'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enquiry', EnquirySchema);
