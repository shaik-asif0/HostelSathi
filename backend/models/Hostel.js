const mongoose = require('mongoose');

const HostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hostel name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner reference is required']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Hostel address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Coordinates (longitude, latitude) are required']
    }
  },
  nearbyColleges: {
    type: [String],
    default: []
  },
  rent: {
    single: { type: Number, default: 0 },
    sharing2: { type: Number, default: 0 },
    sharing3: { type: Number, default: 0 },
    sharing4: { type: Number, default: 0 },
    sharing5: { type: Number, default: 0 }
  },
  foodIncluded: {
    type: Boolean,
    default: false
  },
  foodType: {
    type: String,
    enum: ['veg', 'nonveg', 'both', 'none'],
    default: 'none'
  },
  amenities: {
    type: [String],
    default: [] // e.g. ["WiFi", "AC", "Laundry", "Geyser", "CCTV", "Power Backup"]
  },
  photos: {
    type: [String],
    default: []
  },
  foodPhotos: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    enum: ['boys', 'girls', 'both'],
    required: [true, 'Gender classification is required (boys, girls, or both)']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // Availability tracking for room booking calendar
  availability: {
    singleVacancy: { type: Number, default: 0 },
    sharing2Vacancy: { type: Number, default: 0 },
    sharing3Vacancy: { type: Number, default: 0 },
    sharing4Vacancy: { type: Number, default: 0 },
    sharing5Vacancy: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  // Analytics: view tracking
  viewCount: {
    type: Number,
    default: 0
  },
  // Daily view history for sparkline charts (last 7 days)
  weeklyViews: {
    type: [Number],
    default: [0, 0, 0, 0, 0, 0, 0]
  },
  // Advanced Features: Rules & Fees
  paymentUpiId: {
    type: String,
    default: ''
  },
  rules: {
    curfewTime: { type: String, default: 'No curfew' },
    visitorsAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    drinkingAllowed: { type: Boolean, default: false }
  },
  fees: {
    depositAmount: { type: Number, default: 0 },
    maintenanceFee: { type: Number, default: 0 },
    noticePeriodDays: { type: Number, default: 30 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Setup 2dsphere index for location search
HostelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hostel', HostelSchema);
