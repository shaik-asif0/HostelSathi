const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

const IMAGES_BOYS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
];

const IMAGES_GIRLS = [
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80'
];

const IMAGES_BOTH = [
  'https://images.unsplash.com/photo-1623625409419-528f8045952f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
];

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80'
];

const AREAS = [
  { name: 'Kukatpally', lat: 17.4935, lng: 78.3912, colleges: ['JNTU Hyderabad', 'GRIET', 'VNR VJIET'] },
  { name: 'Ameerpet', lat: 17.4371, lng: 78.4461, colleges: ['Ameerpet IT Hub', 'Narayana College'] },
  { name: 'Madhapur', lat: 17.4356, lng: 78.3824, colleges: ['ISB Hyderabad'] },
  { name: 'Osmania University', lat: 17.4107, lng: 78.5171, colleges: ['Osmania University', 'Nizam College'] }
];

const AMENITIES_DB = ['WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 'Gym', 'Security Guard', 'Parking', 'Hot Water'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const randSubset = (arr, maxItems) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randInt(2, maxItems));
};

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`ℹ️ Database already contains ${userCount} users. Skipping auto-seed.`);
      return;
    }

    console.log('🌱 Database is empty. Running auto-seed for demo users and hostels...');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);

    // Create Demo Users
    const students = await User.insertMany([
      { name: 'Suresh Kumar', email: 'suresh@student.com', phone: '9876543210', password: hash, role: 'student', college: 'JNTU Hyderabad' },
      { name: 'Priya Reddy', email: 'priya@student.com', phone: '9876543211', password: hash, role: 'student', college: 'Osmania University' },
      { name: 'Arjun Rao', email: 'arjun@student.com', phone: '9876543212', password: hash, role: 'student', college: 'GRIET' }
    ]);

    const owners = await User.insertMany([
      { name: 'Rami Reddy', email: 'ramireddy@owner.com', phone: '9123456789', password: hash, role: 'owner' },
      { name: 'Lakshmi Devi', email: 'lakshmi@owner.com', phone: '9123456780', password: hash, role: 'owner' },
      { name: 'Venkat Rao', email: 'venkat@owner.com', phone: '9123456781', password: hash, role: 'owner' }
    ]);

    console.log('✅ Demo users seeded (Student: suresh@student.com / 9876543210, Owner: ramireddy@owner.com / 9123456789, Pass: 123456).');

    // Create Hostels
    const hostelsData = [];
    for (let i = 0; i < 40; i++) {
      const area = rand(AREAS);
      const owner = rand(owners);
      const gender = rand(['boys', 'girls', 'both']);
      const isPremium = i % 3 === 0;

      let nameStr = gender === 'boys' ? `Sri Srinivasa Boys PG ${area.name}` : (gender === 'girls' ? `Saraswathi Girls Hostel ${area.name}` : `${area.name} Smart Stay Co-Living`);
      let photos = gender === 'boys' ? randSubset(IMAGES_BOYS, 3) : (gender === 'girls' ? randSubset(IMAGES_GIRLS, 3) : randSubset(IMAGES_BOTH, 2));

      const hostel = {
        name: `${nameStr} #${i + 1}`,
        owner: owner._id,
        ownerName: owner.name,
        phone: owner.phone,
        address: `Plot ${randInt(10, 300)}, ${area.name}, Hyderabad`,
        location: {
          type: 'Point',
          coordinates: [area.lng + randFloat(-0.01, 0.01), area.lat + randFloat(-0.01, 0.01)]
        },
        nearbyColleges: area.colleges,
        rent: {
          single: 12000,
          sharing2: 8500,
          sharing3: 6500,
          sharing4: 5500,
          sharing5: 4500
        },
        foodIncluded: true,
        foodType: 'both',
        amenities: randSubset(AMENITIES_DB, 6),
        photos,
        foodPhotos: randSubset(FOOD_IMAGES, 2),
        gender,
        isVerified: true,
        isPremium,
        rating: (4.0 + (i % 10) * 0.1).toFixed(1),
        reviewCount: randInt(5, 50),
        viewCount: randInt(100, 500),
        weeklyViews: [20, 35, 50, 45, 60, 80, 95],
        availability: {
          singleVacancy: 2,
          sharing2Vacancy: 4,
          sharing3Vacancy: 5,
          sharing4Vacancy: 3,
          sharing5Vacancy: 6
        }
      };
      hostelsData.push(hostel);
    }

    const createdHostels = await Hostel.insertMany(hostelsData);
    console.log(`✅ ${createdHostels.length} Hyderabad hostels auto-seeded.`);

  } catch (err) {
    console.error('❌ Error during auto-seeding:', err);
  }
};

module.exports = autoSeedIfEmpty;
