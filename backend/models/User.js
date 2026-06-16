const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['student', 'owner'],
    default: 'student'
  },
  college: {
    type: String,
    trim: true,
    // Optional, relevant for students
    default: ''
  },
  hostelName: {
    type: String,
    trim: true,
    // Optional, relevant for owners
    default: ''
  },
  // Push Notification FCM Token
  fcmToken: {
    type: String,
    default: null
  },
  // Student Preferences for AI Recommendation Engine
  preferences: {
    budget: { type: Number, default: 10000 },
    gender: { type: String, enum: ['boys', 'girls', 'both', 'all'], default: 'all' },
    foodRequired: { type: Boolean, default: false },
    preferredAmenities: { type: [String], default: [] }
  },
  // IDs of hostels recently viewed by user (for recommendation scoring)
  viewedHostels: {
    type: [String],
    default: []
  },
  savedCollections: {
    type: [{
      name: { type: String, required: true },
      hostels: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  },
  // Unlocked contact details for hostels
  unlockedHostels: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
