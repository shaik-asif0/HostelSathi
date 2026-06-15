# 🏠 HostelSathi

> **The #1 Student Hostel Discovery App for Hyderabad — built for Telugu students, by Telugu founders.**

HostelSathi connects students searching for hostels with verified hostel owners — with real photos, honest pricing, food details, and distance from college. No middlemen. No outdated info. No Google Maps guesswork.

---

## 📌 The Problem We Solve

| Pain Point | Current Situation | HostelSathi Solution |
|---|---|---|
| Outdated hostel info | Google Maps listings are stale | Owner-managed live profiles |
| No student-specific platform | NoBroker/MagicBricks = flats, not hostels | Built only for student accommodation |
| Can't compare before visiting | Must visit each hostel physically | Photos, pricing, food, rules — all in app |
| No trust or reviews | Word-of-mouth only | Verified listings + student reviews |
| Parents can't evaluate remotely | Have to come to Hyderabad | Share hostel profile link with parents |
| No direct communication | Phone tag with owners | Real-time chat between student & owner |
| No digital payments | Cash-only rent payments | OCR-verified UPI payments & digital receipts |

---

## 🎯 Target Users

*   **Students** — BTech / Degree / PG students relocating to Hyderabad for college.
*   **Hostel Owners** — PG / hostel owners in Hyderabad wanting more student enquiries.

---

## ✨ Features Overview

### 🎓 Student Features

| Feature | Description |
|---|---|
| **🏠 Hostel Discovery** | Browse all listed hostels with photos, ratings, pricing, amenities, and food details |
| **🤖 AI Recommendations** | Personalized hostel suggestions scored by budget, gender, food preference, amenities & browsing history |
| **🔍 Advanced Search & Filters** | Filter by gender, budget (₹5K–₹20K), food type (veg/non-veg/both), amenities (WiFi, AC, Laundry, etc.), nearby college, and sort by price/rating/featured |
| **🔎 Search History** | Persisted recent search terms for quick re-search (stored locally via AsyncStorage) |
| **📊 Hostel Comparison** | Side-by-side comparison of up to 3 hostels on rent, rating, food, distance, and amenities |
| **📍 Nearby Hostels (Geospatial)** | Find hostels near you using MongoDB `2dsphere` geospatial queries with configurable radius |
| **🗺️ Map View** | View hostels on an interactive map with React Native Maps integration |
| **📷 Photo Gallery** | Full-screen swipeable photo gallery with indicators & food photo section |
| **⭐ Reviews & Ratings** | Read and write reviews (1–5 stars); one review per student per hostel enforced |
| **📋 Book a Visit** | Submit enquiry with room type preference, preferred move-in date (calendar picker), and custom message |
| **💬 Real-Time Chat** | Socket.IO powered instant messaging with typing indicators, read receipts & online presence |
| **❤️ Saved Hostels & Collections** | Save hostels locally + organize into named collections (e.g., "Near JNTU", "Budget Options") synced to server |
| **🔔 Notifications** | In-app notification center for new messages, enquiry updates, reviews, and system alerts with unread badge count |
| **📞 Contact Owner** | One-tap call, WhatsApp message, or in-app chat (gated behind ₹5 payment unlock) |
| **💳 Scan & Pay** | QR code scanner (via react-native-camera-kit) to identify hostel and initiate payment |
| **🧾 Digital Receipts** | Auto-generated rent payment receipts with UTR verification |
| **📜 House Rules** | View curfew time, visitor policy, smoking/drinking rules before booking |
| **💰 Fee Transparency** | Security deposit, maintenance fee, and notice period clearly displayed |
| **🏫 Campus Distance** | Auto-calculated walk/auto/bus travel times from hostel to nearby campus |
| **🛏️ Room Availability** | Real-time vacancy count for Single, 2-Sharing, 3-Sharing, 4-Sharing & 5-Sharing rooms |
| **👤 Profile Management** | Edit name, phone, college; set AI preferences (budget, gender, food, amenities) |
| **🎬 Onboarding** | Welcome screen introducing app features to first-time users |

### 🏢 Owner Features

| Feature | Description |
|---|---|
| **📊 Pro Dashboard** | Overview with active listings count, total leads, total views, average rating & revenue forecast |
| **🏠 Hostel Listing Management** | Create, edit, and delete hostel profiles with all details (rent, food, amenities, rules, fees, photos) |
| **📸 Photo Upload** | Upload up to 5/6 photos per listing with Multer (5MB limit, JPEG/PNG/WebP) |
| **🛏️ Quick Vacancy Update** | One-tap modal to update room availability counts per room type |
| **📩 Enquiry Management** | View all student enquiries with status pipeline: Pending → Contacted → Visited → Closed |
| **📊 Per-Hostel Analytics** | Detailed analytics modal with: total views, weekly views sparkline chart, enquiry conversion funnel, room availability, and revenue potential |
| **💳 UPI Payment Setup** | Set UPI ID per hostel to receive direct rent payments from students |
| **🧑‍🎓 Tenant Management** | View active tenants, see payment details (UTR verified), send WhatsApp rent reminders, view/share digital receipts, and remove tenants |
| **💬 Real-Time Chat** | Chat with prospective and current students via Socket.IO |
| **🔔 Notifications** | Get alerts for new enquiries, messages, and reviews |
| **💰 Revenue Calculator** | Estimated full-occupancy monthly income across all listings |

### 🔐 Authentication Features

| Feature | Description |
|---|---|
| **Email/Phone Registration** | Register as Student or Owner with name, phone, email, password, and college (students) |
| **Email/Phone Login** | Login with email or phone number + password |
| **Mock OTP Verification** | Simulated SMS OTP for phone auth (4-digit code logged to server console, `1234` bypass for testing) |
| **JWT Authentication** | 30-day token with Bearer authorization header |
| **Role-Based Access** | Route-level `student` and `owner` role authorization middleware |
| **Profile Editing** | Update name, phone, college via protected API endpoint |
| **AI Preference Setup** | Students can set budget, gender preference, food preference, and preferred amenities for personalized recommendations |

### 💳 Payment & Monetization Features

| Feature | Description |
|---|---|
| **₹5 Contact Unlock** | Students pay ₹5 to unlock owner phone, WhatsApp, map, and chat for a hostel |
| **OCR Payment Verification** | Upload UPI payment screenshot → Tesseract.js OCR extracts 12-digit UTR → validated for uniqueness → hostel unlocked |
| **Rent Payment via QR** | Scan hostel QR code → view amount → pay via UPI → upload screenshot → OCR verifies UTR → student joins as tenant |
| **UTR Deduplication** | Used UTR numbers stored in DB with 1-year TTL auto-expiry to prevent reuse |
| **Digital Receipt Generation** | Auto-generated receipts with student name, amount, date, and verified UTR number |

---

## 💰 Revenue Model

| Stream | Details | Timeline |
|---|---|---|
| Free basic listing | Owners list for free — builds supply | Month 1 onwards |
| Premium listing | ₹499/month — appear at top of search | Month 5 onwards |
| Lead fee | ₹200 per confirmed booking | Month 5 onwards |
| Contact unlock fee | ₹5 per student per hostel unlock | Month 1 onwards |
| Vendor ads | Tiffin services, stationery shops advertising to students | Month 6 onwards |

---

## 🛠️ Tech Stack

### Frontend — React Native Mobile App
| Technology | Purpose |
|---|---|
| **React Native 0.74** | Cross-platform iOS & Android app |
| **Redux Toolkit** | Global state management (auth, hostels, chat, notifications) |
| **React Navigation 6** | Stack + Bottom Tab navigators with role-based routing |
| **Axios** | HTTP client with JWT interceptor & error handling |
| **Socket.IO Client** | Real-time WebSocket chat |
| **AsyncStorage** | Persistent local storage (tokens, saved hostels, filters, search history) |
| **React Native Maps** | Interactive map view |
| **React Native Camera Kit** | QR code scanner for Scan & Pay |
| **React Native Image Picker** | Photo upload from device gallery |
| **React Native Share** | Share hostel profiles |
| **React Native View Shot** | Screenshot receipts for sharing |
| **React Native Vector Icons** | UI icons throughout the app |

### Backend — Node.js + Express.js
| Technology | Purpose |
|---|---|
| **Node.js ≥18** | Server runtime |
| **Express.js 4** | REST API framework |
| **MongoDB Atlas + Mongoose** | NoSQL database with ODM |
| **Socket.IO** | Real-time WebSocket server for chat |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **BCrypt.js** | Password hashing (10 salt rounds) |
| **Multer** | Multipart file upload (photos + payment screenshots) |
| **Tesseract.js** | OCR engine for extracting UTR from payment screenshots |
| **Helmet** | HTTP security headers |
| **Express Validator** | Request body validation |
| **CORS** | Cross-origin resource sharing |
| **Nodemon** | Development auto-restart |

### Database Architecture
| Model | Key Fields |
|---|---|
| **User** | name, phone, email, password, role, college, preferences, viewedHostels, savedCollections, fcmToken |
| **Hostel** | name, owner, address, location (GeoJSON Point), rent (single/2/3/4/5-sharing), amenities, photos, foodPhotos, gender, rules, fees, availability, viewCount, weeklyViews, paymentUpiId |
| **Review** | user, hostel, rating (1–5), comment (unique per user-hostel pair) |
| **Enquiry** | student, hostel, owner, message, status (pending/contacted/visited/closed), moveInDate, roomType |
| **Message** | hostel, sender, receiver, content, senderRole, read status |
| **Notification** | user, type, title, body, data (hostelId/enquiryId/messageId), read status |
| **Tenant** | student, hostel, owner, roomType, rentPaid, utrNumber (unique), status, joinDate |
| **UsedUTR** | utr (unique), userId, hostelId (1-year TTL auto-expire) |

---

## 📁 Project Structure

```
HostelSathi/
│
├── mobile/                          # React Native Mobile App
│   ├── App.js                       # Root component with Redux Provider & Navigation
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js         # Axios client with interceptors + typed API methods
│   │   ├── navigation/
│   │   │   └── AppNavigator.js      # Role-based routing (Auth → Student → Owner stacks)
│   │   ├── redux/
│   │   │   ├── store.js             # Redux store configuration
│   │   │   ├── authSlice.js         # Authentication state (login, register, token, user)
│   │   │   ├── hostelSlice.js       # Hostel listing state
│   │   │   ├── chatSlice.js         # Chat/messaging state
│   │   │   └── notificationSlice.js # Notification state + unread count
│   │   ├── screens/
│   │   │   ├── student/
│   │   │   │   ├── OnboardingScreen.js    # Welcome/intro screens
│   │   │   │   ├── AuthScreen.js          # Login + Register + OTP auth
│   │   │   │   ├── HomeScreen.js          # Discovery feed with AI recommendations
│   │   │   │   ├── SearchScreen.js        # Advanced search with filters & compare
│   │   │   │   ├── HostelDetailScreen.js  # Full hostel profile, booking, reviews, payments
│   │   │   │   ├── CompareScreen.js       # Side-by-side hostel comparison matrix
│   │   │   │   ├── SavedScreen.js         # Saved hostels + wishlist collections
│   │   │   │   ├── ChatScreen.js          # Real-time Socket.IO chat
│   │   │   │   ├── NotificationsScreen.js # Notification center
│   │   │   │   ├── ProfileScreen.js       # User profile + AI preferences
│   │   │   │   ├── ScanAndPayScreen.js    # QR code scanner + payment flow
│   │   │   │   ├── ReceiptScreen.js       # Digital payment receipt
│   │   │   │   ├── MyReceiptsScreen.js    # All past receipts
│   │   │   │   └── MapScreen.js           # Map view of hostels
│   │   │   ├── owner/
│   │   │   │   ├── DashboardScreen.js     # Pro dashboard with analytics & tenant management
│   │   │   │   ├── AddHostelScreen.js     # Create/edit hostel listing form
│   │   │   │   └── EnquiriesScreen.js     # Lead management with status pipeline
│   │   │   └── shared/
│   │   │       └── ConversationsScreen.js # Chat inbox (shared between student & owner)
│   │   └── utils/
│   │       ├── constants.js         # App-wide constants
│   │       └── socket.js            # Socket.IO singleton client with helpers
│   └── package.json
│
└── backend/                         # Node.js + Express API Server
    ├── server.js                    # Express app + Socket.IO server + route mounting
    ├── config/
    │   └── db.js                    # MongoDB Atlas connection via Mongoose
    ├── middleware/
    │   └── auth.js                  # JWT protect + role-based authorize middleware
    ├── models/
    │   ├── User.js                  # User schema (student/owner, preferences, collections)
    │   ├── Hostel.js                # Hostel schema (GeoJSON, rent tiers, availability, analytics)
    │   ├── Review.js                # Review schema (unique per user-hostel)
    │   ├── Enquiry.js               # Enquiry schema (status pipeline, moveInDate)
    │   ├── Message.js               # Chat message schema (indexed for performance)
    │   ├── Notification.js          # Notification schema (typed, with read state)
    │   ├── Tenant.js                # Tenant schema (verified rent payments)
    │   └── UsedUTR.js               # UTR dedup schema (1-year TTL)
    ├── routes/
    │   ├── auth.js                  # Register, login, OTP, profile, preferences
    │   ├── hostels.js               # CRUD, nearby, recommended, analytics, photos, view tracking
    │   ├── reviews.js               # Create review + get reviews per hostel
    │   ├── enquiries.js             # Submit, list owner enquiries, update status
    │   ├── messages.js              # Conversations list, chat history, send, mark read
    │   ├── notifications.js         # Get, mark read, mark all read, delete, FCM token
    │   ├── collections.js           # CRUD collections, add/remove hostels
    │   ├── payments.js              # Unlock hostel (₹5), verify screenshot via OCR
    │   ├── tenants.js               # Join hostel (rent OCR), list tenants, remove tenant
    │   └── upload.js                # Generic photo upload endpoint
    ├── utils/
    │   └── seed.js                  # Database seeder with sample Hyderabad hostels
    └── package.json
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register            Register student or owner
POST   /api/auth/login               Login (email or phone) + get JWT token
POST   /api/auth/send-otp            Send mock OTP to phone (logged to console)
POST   /api/auth/verify-otp          Verify OTP code + auto-login/register
GET    /api/auth/me                  Get current logged-in user profile
PUT    /api/auth/preferences         Update AI recommendation preferences
PUT    /api/auth/profile             Update user profile (name, phone, college)
```

### Hostels
```
GET    /api/hostels                  Get all hostels (with search & filters)
GET    /api/hostels/nearby           Hostels near coordinates (geospatial $near)
GET    /api/hostels/recommended      AI-scored personalized recommendations (top 10)
GET    /api/hostels/:id              Get single hostel detail
GET    /api/hostels/:id/analytics    Owner: per-hostel analytics (views, funnel, revenue)
POST   /api/hostels                  Owner: create listing (auth required)
PUT    /api/hostels/:id              Owner: update listing (auth required)
DELETE /api/hostels/:id              Owner: delete listing + cleanup photos
POST   /api/hostels/:id/photos       Owner: upload photos (up to 5, 5MB each)
POST   /api/hostels/:id/track-view   Increment view count + weekly analytics
```

### Reviews
```
POST   /api/reviews                  Student: add review (1 per hostel, auth required)
GET    /api/reviews/:hostelId        Get all reviews for a hostel
```

### Enquiries
```
POST   /api/enquiries                Student: submit contact/visit enquiry
GET    /api/enquiries/owner          Owner: view received enquiries
PUT    /api/enquiries/:id            Owner: update status (pending → contacted → visited → closed)
```

### Real-Time Chat (REST + Socket.IO)
```
GET    /api/messages/conversations/list   Get all chat threads for current user
GET    /api/messages/:hostelId/:studentId? Get chat history for a hostel thread
POST   /api/messages                      Send message (REST fallback)
PUT    /api/messages/:id/read             Mark message as read

Socket Events:
  → user_online(userId)                   Register user as online
  → join_chat({ hostelId, userId })       Join hostel-specific chat room
  → send_message(data)                    Send real-time message
  → typing({ hostelId, userId, receiverId, isTyping })  Typing indicator
  ← receive_message(message)             Incoming message from other user
  ← message_sent(message)                Confirmation of sent message
  ← user_typing({ userId, hostelId, isTyping })  Typing notification
  ← online_users(userIds[])              List of currently online users
```

### Notifications
```
GET    /api/notifications            Get all notifications (last 50) + unread count
PUT    /api/notifications/:id/read   Mark single notification as read
PUT    /api/notifications/read-all   Mark all notifications as read
DELETE /api/notifications/:id        Delete a notification
PUT    /api/notifications/fcm-token  Register device FCM push token
```

### Wishlist Collections
```
GET    /api/collections              Get all saved collections
POST   /api/collections              Create a new collection
PUT    /api/collections/:id/add      Add hostel to a collection
PUT    /api/collections/:id/remove   Remove hostel from a collection
PUT    /api/collections/:id/rename   Rename a collection
DELETE /api/collections/:id          Delete a collection
GET    /api/collections/:id/hostels  Get full hostel details in a collection
```

### Payments & OCR
```
POST   /api/payments/unlock              Simulate ₹5 payment to unlock hostel details
POST   /api/payments/verify-screenshot   OCR verify payment screenshot (12-digit UTR extraction)
```

### Tenant Management
```
POST   /api/tenants/join                 Student joins hostel with rent payment screenshot (OCR)
GET    /api/tenants/hostel/:hostelId      Owner: list active tenants for a hostel
PUT    /api/tenants/:id/remove           Owner: remove tenant (mark as completed)
```

### Uploads & Utility
```
POST   /api/upload                   Upload multiple hostel photos (up to 6)
GET    /api/health                   Server health check + feature list
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.0.0
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Android Studio** or physical Android device (for mobile app)
- **React Native CLI** environment setup ([guide](https://reactnative.dev/docs/environment-setup))

### 1. Backend Setup

Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostelsathi
JWT_SECRET=hostelsathi_super_secret_key
# Optional AWS settings (uses local storage fallback if empty)
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET=
```

Seed the database with sample Hyderabad student hostels (Kukatpally, JNTU, Ameerpet):
```bash
npm run seed
```

Start the development server:
```bash
npm run dev
```

The server starts on `http://0.0.0.0:5000` and prints your local Wi-Fi IP for device access.

### 2. Mobile App Setup

Navigate to the `mobile/` directory:
```bash
cd mobile
npm install
```

**Important: Configure your server IP**

Edit `mobile/src/api/apiClient.js` and `mobile/src/utils/socket.js`:
```javascript
const PHYSICAL_DEVICE_IP = 'YOUR_PC_WIFI_IP'; // e.g., 192.168.1.37
```

> 💡 Your backend server prints this IP on startup. Both files must have the same IP.

Start the Metro bundler and run the app:
```bash
npm start
# In a new terminal:
npm run android
# or for iOS:
npm run ios
```

### 3. Test Accounts

After seeding, you can register fresh accounts or use the OTP bypass code `1234` for phone-based login.

---

## 📱 App Navigation Flow

```
┌─────────────────────────────────────────────────┐
│              UNAUTHENTICATED                     │
│  Onboarding Screen → Auth Screen (Login/Register)│
└──────────────────────┬──────────────────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
   ┌─────────────────┐  ┌─────────────────┐
   │  STUDENT TABS    │  │   OWNER TABS     │
   │  ┌─────────────┐ │  │  ┌────────────┐  │
   │  │ 🏠 Home     │ │  │  │ 📊 Dashboard│  │
   │  │ 🔍 Search   │ │  │  │ 📩 Enquiries│  │
   │  │ ❤️ Saved    │ │  │  │ 💬 Chats    │  │
   │  │ 💬 Chats    │ │  │  │ 👤 Profile  │  │
   │  │ 👤 Profile  │ │  │  └────────────┘  │
   │  └─────────────┘ │  └─────────────────┘
   │                   │
   │  + HostelDetail   │  + AddHostel
   │  + Compare        │  + Chat
   │  + Chat           │  + Notifications
   │  + Notifications  │
   │  + ScanAndPay     │
   │  + Receipt        │
   │  + MyReceipts     │
   │  + Map            │
   └───────────────────┘
```

---

## 🤖 AI Recommendation Engine

The recommendation engine scores each hostel based on:

| Factor | Max Points | Logic |
|---|---|---|
| Premium listing | +30 | Boosted visibility for paying owners |
| Verified listing | +20 | Trust signal |
| Rating score | +25 | `rating × 5` points |
| Review count | +10 | `min(reviewCount × 2, 10)` |
| Popularity (views) | +15 | `min(viewCount / 10, 15)` |
| Budget match | +25 | Full match if rent ≤ budget, +10 if within 120% |
| Gender preference | +15 | Match user's gender preference |
| Food preference | +15 | Match if user requires food & hostel provides it |
| Amenity overlap | +5 each | Per matching amenity between user prefs & hostel |

Returns the **top 10** highest-scored hostels, personalized when user is authenticated.

---

## 🔒 Security

- **Helmet.js** for HTTP security headers
- **BCrypt** password hashing (10 salt rounds) with input trimming
- **JWT** tokens with 30-day expiry
- **Role-based middleware** (`protect` + `authorize`) on all sensitive routes
- **Ownership verification** on hostel updates/deletes
- **File upload validation** — image-only filter (JPEG, PNG, WebP), 5MB limit
- **UTR deduplication** — prevents payment screenshot reuse
- **Input validation** via Express Validator on registration/login

---

## 👥 Founding Team

*   **Co-founder (Business)**: Hostel owner onboarding, student outreach, marketing, operations.
*   **Co-founder (Technical)**: App development, backend, deployment, tech decisions.

---

## 📍 Launch Market

*   **Phase 1**: Kukatpally + JNTU area, Hyderabad.
*   **Phase 2**: Ameerpet, Dilsukhnagar, Begumpet.
*   **Phase 3**: Vijayawada, Warangal, Tirupati (Telugu belt expansion).

---

## 🗺️ Roadmap

- [ ] Firebase Push Notifications (FCM integration — token registration already built)
- [ ] AWS S3 cloud photo storage (fallback logic already built)
- [ ] Razorpay/Stripe real payment gateway integration
- [ ] Admin dashboard for listing verification
- [ ] Multi-language support (Telugu, Hindi)
- [ ] Roommate matching algorithm
- [ ] In-app video tour of hostels

---

## 📄 License

This project is proprietary. All rights reserved.

---

*Built with ❤️ in Hyderabad — for every student who ever dragged a suitcase through an unfamiliar city.*
