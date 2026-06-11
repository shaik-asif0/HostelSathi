const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');

dotenv.config();

const IMAGES_BOYS = [
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489171078254-c3365d6e359f?auto=format&fit=crop&w=800&q=80'
];

const IMAGES_GIRLS = [
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1616616609503-e88ce2bd9ae3?auto=format&fit=crop&w=800&q=80'
];

const IMAGES_BOTH = [
  'https://images.unsplash.com/photo-1623625409419-528f8045952f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
];

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', // Veg Bowl
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80', // Indian Curry
  'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&w=800&q=80', // Biryani
  'https://images.unsplash.com/photo-1626779848529-6883f3ba9e8a?auto=format&fit=crop&w=800&q=80', // Thali
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80', // Paneer
  'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80', // Idli Dosa
  'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80', // Breakfast
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80'  // Chapati
];

const AREAS = [
  { name: 'Kukatpally', lat: 17.4935, lng: 78.3912, colleges: ['JNTU Hyderabad', 'GRIET', 'VNR VJIET'] },
  { name: 'Ameerpet', lat: 17.4371, lng: 78.4461, colleges: ['Ameerpet IT Hub', 'Narayana College', 'SR Nagar Institutes'] },
  { name: 'Madhapur', lat: 17.4356, lng: 78.3824, colleges: ['ISB Hyderabad', 'Ameerpet IT Hub'] },
  { name: 'Osmania University', lat: 17.4107, lng: 78.5171, colleges: ['Osmania University', 'Nizam College', 'Aditya Degree College'] },
  { name: 'Dilsukhnagar', lat: 17.3685, lng: 78.5283, colleges: ['KVR College', 'Aditya Degree College', 'Narayana College'] },
  { name: 'Secunderabad', lat: 17.4418, lng: 78.4983, colleges: ['Nizam College', 'St. Francis College'] },
  { name: 'Miyapur', lat: 17.4956, lng: 78.3521, colleges: ['JNTU Hyderabad', 'BVRIT', 'MGIT'] },
  { name: 'Gachibowli', lat: 17.4399, lng: 78.3463, colleges: ['University of Hyderabad', 'ISB Hyderabad', 'CBIT'] },
  { name: 'SR Nagar', lat: 17.4451, lng: 78.4352, colleges: ['SR Nagar Institutes', 'Narayana College'] },
  { name: 'Nallagandla', lat: 17.4706, lng: 78.3224, colleges: ['IIT Hyderabad', 'BVRIT'] },
  { name: 'Mehdipatnam', lat: 17.3940, lng: 78.4217, colleges: ['Nizam College', 'Aditya Degree College'] },
  { name: 'Uppal', lat: 17.3878, lng: 78.5687, colleges: ['Aditya Degree College', 'KVR College'] }
];

const AMENITIES_DB = ['WiFi', 'AC', 'Laundry', 'Geyser', 'CCTV', 'Power Backup', 'Gym', 'Security Guard', 'Parking', 'Hot Water', 'RO Water', 'Fridge', 'TV'];

const ADJ_BOYS = ['Sri Srinivasa', 'KPHB Grand', 'Tech City', 'Elite', 'Comfort', 'Prestige', 'Royal', 'Balaji', 'Venkateshwara', 'New Age', 'Cyber', 'Metro', 'Urban', 'Central'];
const ADJ_GIRLS = ['Saraswathi', 'Green Valley', 'Padmavathi', 'Hyderabad Central', 'Safe Haven', 'Queens', 'Lakshmi', 'Bhavani', 'Modern', 'Secure', 'Sai', 'Premium', 'Elite'];
const ADJ_BOTH = ['Co-Living', 'NextGen', 'Smart Stay', 'Hub', 'Nest', 'Colive Space', 'Executive', 'Premium Stay', 'Campus View', 'Metro View'];

// Helpers
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const randSubset = (arr, maxItems) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randInt(2, maxItems));
};

const seedData = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostelsathi';
    console.log(`Connecting to database: ${connUri}`);
    await mongoose.connect(connUri);

    await User.deleteMany();
    await Hostel.deleteMany();
    await Review.deleteMany();
    await Enquiry.deleteMany();
    console.log('✅ Database cleared.');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);

    // ── Create Users ────────────────────────────────────────────────────────
    const students = await User.insertMany([
      { name: 'Suresh Kumar', email: 'suresh@student.com', phone: '9876543210', password: hash, role: 'student', college: 'JNTU Hyderabad' },
      { name: 'Priya Reddy', email: 'priya@student.com', phone: '9876543211', password: hash, role: 'student', college: 'Osmania University' },
      { name: 'Arjun Rao', email: 'arjun@student.com', phone: '9876543212', password: hash, role: 'student', college: 'GRIET' }
    ]);

    const owners = await User.insertMany([
      { name: 'Rami Reddy', email: 'ramireddy@owner.com', phone: '9123456789', password: hash, role: 'owner' },
      { name: 'Lakshmi Devi', email: 'lakshmi@owner.com', phone: '9123456780', password: hash, role: 'owner' },
      { name: 'Venkat Rao', email: 'venkat@owner.com', phone: '9123456781', password: hash, role: 'owner' },
      { name: 'Sujatha Naidu', email: 'sujatha@owner.com', phone: '9123456782', password: hash, role: 'owner' }
    ]);

    console.log('✅ Demo users created.');

    // ── Generate 120 Hostels ────────────────────────────────────────────────
    console.log('⏳ Generating 120+ real-world hostels... This may take a moment.');
    const hostelsData = [];

    for (let i = 0; i < 120; i++) {
      const area = rand(AREAS);
      const owner = rand(owners);
      const gender = rand(['boys', 'boys', 'girls', 'girls', 'both']);
      const isPremium = Math.random() > 0.7; // 30% premium
      
      let nameStr = '';
      let photos = [];
      if (gender === 'boys') {
        nameStr = `${rand(ADJ_BOYS)} Boys PG ${area.name}`;
        photos = randSubset(IMAGES_BOYS, 4);
      } else if (gender === 'girls') {
        nameStr = `${rand(ADJ_GIRLS)} Girls Hostel ${area.name}`;
        photos = randSubset(IMAGES_GIRLS, 4);
      } else {
        nameStr = `${area.name} ${rand(ADJ_BOTH)}`;
        photos = randSubset(IMAGES_BOTH, 4);
      }

      // Add 1 or 2 extra random photos from the general pool for variety
      photos.push(rand([...IMAGES_BOYS, ...IMAGES_GIRLS, ...IMAGES_BOTH]));
      photos.push(rand([...IMAGES_BOYS, ...IMAGES_GIRLS, ...IMAGES_BOTH]));

      const foodIncluded = Math.random() > 0.3; // 70% have food
      const foodPhotos = foodIncluded ? randSubset(FOOD_IMAGES, 4) : [];

      // Base rent by area
      const baseRent = isPremium ? randInt(120, 180) * 100 : randInt(80, 130) * 100;

      const hostel = {
        name: nameStr,
        owner: owner._id,
        ownerName: owner.name,
        phone: owner.phone,
        address: `Plot ${randInt(10, 500)}, Near Main Road, ${area.name}, Hyderabad`,
        location: {
          type: 'Point',
          coordinates: [
            area.lng + randFloat(-0.015, 0.015), // Random jitter ~1.5km
            area.lat + randFloat(-0.015, 0.015)
          ]
        },
        nearbyColleges: randSubset(area.colleges, 3),
        rent: {
          single: baseRent,
          sharing2: Math.round(baseRent * 0.75 / 100) * 100,
          sharing3: Math.round(baseRent * 0.60 / 100) * 100,
          sharing4: Math.round(baseRent * 0.50 / 100) * 100,
          sharing5: Math.round(baseRent * 0.40 / 100) * 100
        },
        foodIncluded,
        foodType: foodIncluded ? rand(['veg', 'nonveg', 'both', 'both']) : 'none',
        amenities: randSubset(AMENITIES_DB, 8),
        photos,
        foodPhotos,
        gender,
        isVerified: Math.random() > 0.4, // 60% verified
        isPremium,
        rating: randFloat(3.5, 5.0).toFixed(1),
        reviewCount: randInt(5, 80),
        viewCount: randInt(100, 1500),
        weeklyViews: Array.from({length: 7}, () => randInt(10, 100)),
        availability: {
          singleVacancy: randInt(0, 3),
          sharing2Vacancy: randInt(0, 6),
          sharing3Vacancy: randInt(0, 8),
          sharing4Vacancy: randInt(0, 10),
          sharing5Vacancy: randInt(0, 15)
        }
      };

      hostelsData.push(hostel);
    }

    const createdHostels = await Hostel.insertMany(hostelsData);
    console.log(`✅ ${createdHostels.length} Hyderabad hostels securely seeded.`);

    // ── Generate some random reviews ─────────────────────────────────────────
    const reviewsData = [];
    createdHostels.slice(0, 30).forEach(hostel => {
      // 1 to 3 reviews per first 30 hostels
      const numReviews = randInt(1, 3);
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      
      for(let j=0; j<numReviews; j++){
        const student = shuffledStudents[j];
        reviewsData.push({
          user: student._id,
          userName: student.name,
          hostel: hostel._id,
          rating: randInt(3, 5),
          comment: `Great experience staying at ${hostel.name}. The amenities were exactly as described.`
        });
      }
    });
    await Review.insertMany(reviewsData);
    console.log(`✅ ${reviewsData.length} Reviews seeded.`);

    console.log('\n🎉 HostelSathi MASSIVE Seed Complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
