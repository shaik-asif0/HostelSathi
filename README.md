# 🏠 HostelSathi

> **The #1 All-in-One Student Hostel Discovery, Roommate Finder & Management Platform — built for Telugu students and PG owners, by Telugu founders.**

HostelSathi connects students searching for hostels with verified hostel owners in Hyderabad — featuring real photos, transparent pricing, food menus, campus distance breakdown, AI-powered recommendations, roommate matching, digital rent payments, OCR receipt verification, and real-time chat. No middlemen. No outdated info. No Google Maps guesswork.

---

## 📌 The Problem We Solve

| Pain Point | Current Situation | HostelSathi Solution |
|---|---|---|
| **Outdated Info** | Google Maps listings are stale or dead numbers | Owner-managed live profiles with real-time vacancy updates |
| **No Student Focus** | NoBroker/MagicBricks focus on flats, not student PGs | Built specifically for student hostel & PG living |
| **Physical Trips** | Students must visit 10+ hostels in person | Photos, food menu, rules, fee structure & campus distance in-app |
| **Lack of Trust** | Reliance on unverified word-of-mouth | Verified student reviews (1 review per hostel) & transparent ratings |
| **Remote Evaluation** | Parents struggle to inspect hostels from far away | Share rich hostel profiles with parents via direct share links |
| **Roommate Friction** | Unknown roommates with mismatched habits | Dedicated **Roommate Finder** by college, course & budget |
| **Communication** | Endless phone tag with owners | Real-time **Socket.IO chat** with typing indicators & read status |
| **Cash Rent & Dues** | Cash-only rent with lost paper receipts | **Scan & Pay QR**, OCR UTR verification & digital rent receipts |
| **Platform Control** | Platform admins cannot monitor spam listings | **Admin Web Portal** for listing moderation & MRR analytics |

---

## 🎯 Target Users

*   **🎓 Students** — B.Tech, Degree, PG, and Competitive Exam students relocating to Hyderabad (Kukatpally, JNTU, Ameerpet, Dilsukhnagar, Gachibowli, etc.).
*   **🏢 Hostel / PG Owners** — Owners wanting qualified student leads, instant vacancy updates, streamlined rent tracking, and digital tenant management.
*   **🛡️ Platform Administrators** — System admins managing listing verification, platform moderation, and revenue performance.

---

## ✨ Complete Features Matrix

### 🎓 Student Mobile App Features

| Feature | Description |
|---|---|
| **🏠 Discovery Feed** | Interactive feed featuring AI recommendations, top-rated hostels, near-campus listings, and budget options |
| **🤖 AI Recommendation Engine** | Personalized hostel match score based on budget, gender preference, food type, required amenities, ratings, and view popularity |
| **🔍 Advanced Search & Filters** | Filter by rent range (₹3K–₹20K+), room sharing types (Single, 2, 3, 4, 5 sharing), gender (Boys/Girls/Co-ed), food preference (Veg/Non-Veg/Both), amenities (WiFi, AC, Laundry, Geyser, Power Backup, Gym, Security, CCTV, TV, Mess), and campus proximity |
| **🔎 Persisted Search History** | Local search term caching via AsyncStorage for fast, seamless re-searching |
| **🤝 Roommate Finder** | Discover potential roommates matched by college (JNTU, NRI, CBIT, OU), course (B.Tech, MBA, B.Arch), budget range, and lifestyle habits |
| **📊 Side-by-Side Hostel Comparison** | Compare up to 3 hostels simultaneously across rent tiers, rating, food menu, distance from college, and amenity list |
| **📍 Nearby Geospatial Search** | Locate hostels around your current coordinates or selected college hub using MongoDB `2dsphere` queries |
| **🗺️ Interactive Map View** | View map pins of hostels with distance markers, custom markers, and direct detail navigation using React Native Maps |
| **📷 Photo & Food Gallery** | Full-screen swipeable photo viewer for hostel rooms, washrooms, dining areas, and daily food menus |
| **⭐ Student Reviews & Ratings** | Read verified reviews and write 1–5 star ratings (enforces 1 review per student per hostel) |
| **📋 Book a Visit / Enquiry** | Submit booking requests with preferred room sharing, move-in date calendar picker, and custom message |
| **💬 Real-Time Chat & Inbox** | Instant messaging powered by Socket.IO with typing indicators, online presence badges, and message history |
| **❤️ Saved Hostels & Wishlist Collections**| Save favorite hostels and organize them into custom named collections (e.g., "Near JNTU", "Budget Options") synced to server |
| **💳 Scan & Pay (UPI QR)** | Scan hostel UPI QR code using `react-native-camera-kit` to pay rent directly to the owner |
| **🧾 OCR Payment & UTR Verification** | Upload UPI payment screenshot → Tesseract.js OCR extracts 12-digit UTR → validates UTR uniqueness → automatically confirms payment |
| **💸 Rent Due Management** | View current monthly dues, due dates, pending amounts, and pay dues with one tap |
| **📄 Digital Receipts** | Download and share auto-generated digital rent payment receipts with verified UTR numbers |
| **📜 House Rules & Fee Transparency** | Clear breakdown of curfew timings, visitor policies, deposit amounts, maintenance fees, and notice periods |
| **🏫 Campus Distance Breakdown** | Auto-calculated walk, auto, and bus commuting times to nearby universities and coaching centers |
| **🛏️ Vacancy Tracker** | Real-time available bed counts for Single, 2-Sharing, 3-Sharing, 4-Sharing & 5-Sharing rooms |
| **🔔 In-App Notifications** | Real-time notification center for messages, enquiry status changes, dues reminders, and system updates |
| **📞 Owner Contact Unlock** | ₹5 micro-payment unlock for direct phone call, WhatsApp, and exact map navigation |
| **🎬 Splash & Onboarding** | Animated branding splash screen + interactive welcome walkthrough |

---

### 🏢 Owner Mobile App Features

| Feature | Description |
|---|---|
| **📊 Pro Owner Dashboard** | Central dashboard with active listing counts, total student leads, profile views, average rating, and revenue forecasts |
| **🏠 Hostel Listing Management** | Complete CRUD operations for hostel listings including rent tiers, photos, food schedules, rules, fees, and UPI ID configuration |
| **📸 Multi-Photo Upload** | Upload up to 6 high-resolution room and food photos via Multer (JPEG/PNG/WebP, 5MB limit per photo) |
| **🛏️ Quick Vacancy Manager** | One-tap modal to instantly update room availability across Single, 2, 3, 4, and 5 sharing options |
| **📩 Lead & Enquiry Pipeline** | Manage student visit requests with state transitions: `Pending` → `Contacted` → `Visited` → `Closed` |
| **📊 Per-Hostel Performance Analytics** | Analytics overview with total views, weekly view sparklines, conversion funnel, and estimated full-occupancy revenue |
| **🧑‍🎓 Tenant Management Hub** | View active tenants, payment history, UTR verification status, send WhatsApp rent reminders with 1-tap, and manage tenant check-outs |
| **💳 UPI Payment Setup** | Configure custom UPI IDs per hostel to collect direct payments from students |
| **💬 Real-Time Student Chat** | Direct messaging stream to answer student queries, send visit confirmations, and coordinate move-ins |
| **🔔 Owner Alerts** | Instant notifications for incoming student leads, new reviews, and real-time chat messages |

---

### 🛡️ Admin Web Portal (`admin-web`)

| Feature | Description |
|---|---|
| **🔑 Secure Admin Auth** | Web-based authentication portal for platform administrators |
| **📊 System Performance Metrics** | View global stats: total registered hostels, active premium listings count, and calculated Monthly Recurring Revenue (MRR) |
| **🌟 Premium Listing Toggle** | Instantly upgrade or downgrade hostels between Standard and Premium (`isPremium`) tiers |
| **🗑️ Listing Moderation** | Inspect and delete invalid, duplicate, or policy-violating hostel listings |
| **🖥️ Modern Responsive UI** | Built with React 19, Vite, Lucide Icons, and Tailwind CSS for seamless desktop administration |

---

### 🔐 Authentication & Security

| Feature | Description |
|---|---|
| **Multi-Role Registration** | Register as `student` or `owner` with name, phone, email, password, and college association |
| **Phone & Email Login** | Login using email address or mobile phone number |
| **Mock OTP Verification** | Simulated SMS OTP flow (logged to server console with `1234` test bypass) |
| **JWT Stateless Security** | 30-day signed JSON Web Tokens sent via HTTP Bearer authorization headers |
| **Role-Based Authorization** | Express middleware enforcing `protect` and `authorize('student', 'owner')` on sensitive routes |
| **UTR Fraud Prevention** | 12-digit UTR extraction via Tesseract.js with `UsedUTR` MongoDB 1-year TTL collection to block duplicate receipt reuse |
| **HTTP Security Headers** | Helmet middleware protection against XSS, clickjacking, and header sniffing |
| **Input Sanitization** | Express Validator checks on login, registration, and listing fields |

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────────────────┐
                     │            HostelSathi Platform              │
                     └──────────────────────┬───────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌─────────────────┐                ┌─────────────────┐                ┌─────────────────┐
│   Mobile App    │                │  Admin Web Portal│                │ Backend Engine  │
│  (React Native) │                │  (React + Vite) │                │ (Node/Express)  │
└────────┬────────┘                └────────┬────────┘                └────────┬────────┘
         │                                  │                                  │
         │ REST API & WebSockets            │ REST API                         │ Mongoose ODM
         └──────────────────────────────────┼──────────────────────────────────┘
                                            ▼
                                  ┌───────────────────┐
                                  │   MongoDB Atlas   │
                                  │ (Geospatial 2DS)  │
                                  └───────────────────┘
```

### 📱 Frontend — Mobile Application (`mobile`, `student-app`, `owner-app`)
*   **Core**: React Native 0.74.1, React 18.2.0
*   **State Management**: Redux Toolkit (`authSlice`, `hostelSlice`, `chatSlice`, `notificationSlice`, `bookingsSlice`)
*   **Navigation**: React Navigation 6 (Native Stack + Bottom Tabs with dynamic badge integration)
*   **HTTP Client**: Axios with request/response interceptors & Bearer token injection
*   **Real-Time Messaging**: Socket.IO Client 4.8.3
*   **Local Storage**: `@react-native-async-storage/async-storage` for tokens, wishlist, search history, and filters
*   **Maps & Location**: `react-native-maps` for interactive pin rendering & location visualization
*   **Scanner & Camera**: `react-native-camera-kit` for QR code scanning & `react-native-image-picker` for photo uploads
*   **Payments & Receipts**: `react-native-razorpay`, `react-native-view-shot` for receipt image exports, `react-native-share` for sharing profiles & receipts

### 🖥️ Frontend — Admin Web Portal (`admin-web`)
*   **Core Framework**: React 19.2.6, React Router DOM 7.17.0
*   **Build Tool**: Vite 8.0.12
*   **Styling**: Tailwind CSS 4.3.0, PostCSS, Autoprefixer
*   **Icons**: Lucide React 1.18.0
*   **HTTP**: Axios 1.17.0

### ⚙️ Backend — API Server & Real-Time Engine (`backend`)
*   **Runtime Framework**: Node.js ≥18.0.0, Express.js 4.19.2
*   **Database & ODM**: MongoDB Atlas / Local MongoDB, Mongoose 8.4.1 (with `2dsphere` index support)
*   **Real-Time Engine**: Socket.IO 4.8.3 (WebSockets with fallback polling)
*   **OCR Processing Engine**: Tesseract.js 7.0.0 for automated receipt text & UTR parsing
*   **Authentication & Cryptography**: JSONWebToken 9.0.2, BCrypt.js 2.4.3 (10 salt rounds)
*   **File Handling**: Multer 1.4.5 (Multipart uploads with MIME validation and local/S3 fallback)
*   **Security & Validation**: Helmet 7.1.0, Express Validator 7.1.0, CORS 2.8.5

---

## 🗄️ Database Schema Architecture

```
User (Students & Owners)
├── _id, name, email, phone, password, role ('student'|'owner')
├── college, preferences (budget, gender, food, amenities)
└── viewedHostels[], savedCollections[], fcmToken

Hostel (Geospatial & Listing Data)
├── _id, name, owner (ref: User), address, location (GeoJSON Point: [lng, lat])
├── rent { single, sharing2, sharing3, sharing4, sharing5 }
├── amenities[], photos[], foodPhotos[], gender ('boys'|'girls'|'coed')
├── rules { curfew, visitors, smoking, drinking }, fees { deposit, maintenance, noticePeriod }
├── availability { single, sharing2, sharing3, sharing4, sharing5 }
├── isVerified, isPremium, viewCount, weeklyViews[], paymentUpiId
└── rating, numReviews

Review (1-per-student-per-hostel)
├── _id, user (ref: User), hostel (ref: Hostel), rating (1-5), comment

Enquiry (Lead Pipeline)
├── _id, student (ref: User), hostel (ref: Hostel), owner (ref: User)
├── roomType, moveInDate, message, status ('pending'|'contacted'|'visited'|'closed')

Message (Socket.IO Chat History)
├── _id, hostel (ref: Hostel), sender (ref: User), receiver (ref: User)
├── content, senderRole, read (boolean)

Notification (In-App Alert Inbox)
├── _id, user (ref: User), type, title, body, data {}, read (boolean)

Tenant (Active Renters)
├── _id, student (ref: User), hostel (ref: Hostel), owner (ref: User)
├── roomType, rentPaid, utrNumber (unique), status ('active'|'completed'), joinDate

UsedUTR (Anti-Fraud Dedup Engine)
└── _id, utr (unique index), userId, hostelId, createdAt (1-Year TTL Index)
```

---

## 📁 Repository Structure

```
HostelSathi/
│
├── mobile/                          # Primary React Native Mobile Application
│   ├── App.js                       # Entry point with Provider & Navigation setup
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js         # Centralized Axios client & API endpoints
│   │   ├── navigation/
│   │   │   └── AppNavigator.js      # Auth → Student Stack → Owner Stack router
│   │   ├── redux/
│   │   │   ├── store.js             # Global Redux store
│   │   │   ├── authSlice.js         # Auth session & user state
│   │   │   ├── hostelSlice.js       # Hostel discovery & search state
│   │   │   ├── chatSlice.js         # Socket.IO chat state & messages
│   │   │   ├── notificationSlice.js # In-app notification center state
│   │   │   └── bookingsSlice.js     # Dues & payment booking state
│   │   ├── screens/
│   │   │   ├── student/             # Student screens (Home, Search, Compare, Roommate, etc.)
│   │   │   ├── owner/               # Owner screens (Dashboard, AddHostel, Enquiries)
│   │   │   └── shared/              # Shared screens (Conversations, Splash)
│   │   └── utils/
│   │       ├── constants.js         # App Constants & theme definitions
│   │       └── socket.js            # Socket.IO client helper singleton
│   └── package.json
│
├── admin-web/                       # Admin Web Management Dashboard (React + Vite)
│   ├── index.html                   # HTML Entry Point
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind styling configuration
│   ├── src/
│   │   ├── App.jsx                  # Main dashboard switcher & state
│   │   ├── main.jsx                 # React root mount
│   │   └── components/
│   │       ├── Login.jsx            # Admin login screen
│   │       └── Dashboard.jsx        # Moderation table, stats & MRR counter
│   └── package.json
│
├── backend/                         # Node.js REST API + Real-Time Engine
│   ├── server.js                    # Server init, Socket.IO listeners, route mounting
│   ├── config/
│   │   └── db.js                    # MongoDB Mongoose connection handler
│   ├── middleware/
│   │   └── auth.js                  # JWT protect & role authorization middleware
│   ├── models/                      # Mongoose Schema definitions (User, Hostel, etc.)
│   ├── routes/                      # RESTful Express route controllers
│   │   ├── auth.js                  # Login, register, profile, OTP, AI preferences
│   │   ├── hostels.js               # CRUD, geospatial, recommendations, views
│   │   ├── reviews.js               # Review submission & retrieval
│   │   ├── enquiries.js             # Lead pipeline management
│   │   ├── messages.js              # REST messaging & thread history
│   │   ├── notifications.js         # In-app notifications & FCM tokens
│   │   ├── collections.js           # Wishlist collection CRUD
│   │   ├── payments.js              # ₹5 contact unlock & OCR UTR extraction
│   │   ├── tenants.js               # Tenant onboarding & rent management
│   │   └── upload.js                # Multipart photo upload endpoint
│   ├── utils/
│   │   └── seed.js                  # Database seeder with sample Hyderabad hostels
│   └── package.json
│
├── student-app/                     # Dedicated Student App Variant
├── owner-app/                       # Dedicated Owner App Variant
└── README.md                        # Master Project Documentation
```

---

## 🔌 Complete API Documentation

### 🔑 Authentication (`/api/auth`)
*   `POST /api/auth/register` — Register student or owner user
*   `POST /api/auth/login` — Authenticate via email or phone + receive JWT
*   `POST /api/auth/send-otp` — Request mock phone OTP code
*   `POST /api/auth/verify-otp` — Verify OTP code and auto-authenticate
*   `GET /api/auth/me` — Fetch current user profile details
*   `PUT /api/auth/preferences` — Update AI recommendation preference matrix
*   `PUT /api/auth/profile` — Update user profile details (name, phone, college)

### 🏠 Hostels & AI Engine (`/api/hostels`)
*   `GET /api/hostels` — Search & filter hostels (supports text search, budget range, gender, amenities)
*   `GET /api/hostels/nearby` — Find hostels by lat/lng coordinates via MongoDB `$near`
*   `GET /api/hostels/recommended` — Get top 10 AI-scored personalized hostel recommendations
*   `GET /api/hostels/:id` — Get full single hostel profile details
*   `POST /api/hostels` — Owner: Create a new hostel listing (Auth required)
*   `PUT /api/hostels/:id` — Owner/Admin: Update hostel details or toggle `isPremium`
*   `DELETE /api/hostels/:id` — Owner/Admin: Permanently delete a hostel listing
*   `POST /api/hostels/:id/photos` — Owner: Upload up to 6 hostel photos
*   `GET /api/hostels/:id/analytics` — Owner: Per-hostel performance metrics (views, leads, revenue)
*   `POST /api/hostels/:id/track-view` — Increment view count & log weekly analytics

### ⭐ Reviews (`/api/reviews`)
*   `POST /api/reviews` — Student: Submit hostel review & rating (1 per student per hostel)
*   `GET /api/reviews/:hostelId` — Get all reviews for a specific hostel

### 📩 Enquiries & Leads (`/api/enquiries`)
*   `POST /api/enquiries` — Student: Book a visit or request room contact
*   `GET /api/enquiries/owner` — Owner: View received student enquiries
*   `PUT /api/enquiries/:id` — Owner: Update enquiry pipeline state (`pending` → `contacted` → `visited` → `closed`)

### 💬 Real-Time Chat (REST + Socket.IO) (`/api/messages`)
*   `GET /api/messages/conversations/list` — Retrieve user active chat conversations
*   `GET /api/messages/:hostelId/:studentId?` — Load thread message history
*   `POST /api/messages` — Send chat message (REST fallback)
*   `PUT /api/messages/:id/read` — Mark message as read

**WebSocket Events (Port 5000):**
```
Client Emits:
  → user_online(userId)
  → join_chat({ hostelId, userId })
  → send_message({ hostelId, senderId, receiverId, content })
  → typing({ hostelId, userId, receiverId, isTyping })

Server Emits:
  ← receive_message(message)
  ← message_sent(message)
  ← user_typing({ userId, hostelId, isTyping })
  ← online_users(userIds[])
```

### 💳 Payments, OCR & Dues (`/api/payments` & `/api/tenants`)
*   `POST /api/payments/unlock` — Simulate ₹5 micro-payment to unlock owner contact details
*   `POST /api/payments/verify-screenshot` — Execute Tesseract.js OCR to extract & validate 12-digit UTR
*   `POST /api/tenants/join` — Student joins hostel by uploading rent payment screenshot (OCR verified)
*   `GET /api/tenants/hostel/:hostelId` — Owner: Fetch list of active tenants
*   `PUT /api/tenants/:id/remove` — Owner: Mark tenant check-out as completed

### 🔔 Notifications & Collections (`/api/notifications` & `/api/collections`)
*   `GET /api/notifications` — Get user notifications + unread count
*   `PUT /api/notifications/:id/read` — Mark single notification as read
*   `PUT /api/notifications/read-all` — Mark all notifications as read
*   `PUT /api/notifications/fcm-token` — Save mobile device push token
*   `GET /api/collections` — Fetch saved wishlist collections
*   `POST /api/collections` — Create new wishlist collection
*   `PUT /api/collections/:id/add` — Add hostel to collection
*   `PUT /api/collections/:id/remove` — Remove hostel from collection

---

## 🤖 AI Recommendation Engine Scoring Logic

Every hostel is dynamically evaluated and scored for the user based on weighted factors:

$$\text{Score} = S_{\text{premium}} + S_{\text{verified}} + S_{\text{rating}} + S_{\text{reviews}} + S_{\text{views}} + S_{\text{budget}} + S_{\text{gender}} + S_{\text{food}} + S_{\text{amenities}}$$

| Factor | Max Points | Logic |
|---|---|---|
| **Premium Boost** | **+30** | Promotes paid owner listings (`isPremium: true`) |
| **Verified Listing** | **+20** | Trust badge score boost (`isVerified: true`) |
| **Rating Score** | **+25** | Calculated as $\text{Rating} \times 5$ |
| **Review Count** | **+10** | $\min(\text{ReviewCount} \times 2, 10)$ |
| **Popularity** | **+15** | $\min(\text{ViewCount} / 10, 15)$ |
| **Budget Fit** | **+25** | Full +25 if rent $\le$ student budget; +10 if within 120% |
| **Gender Match** | **+15** | Exact match with student gender preference |
| **Food Preference**| **+15** | Match if hostel provides required food type |
| **Amenity Overlap**| **+5 each**| Points for every matching amenity (WiFi, AC, Laundry, etc.) |

---

## ⚡ Getting Started & Installation Guide

### Prerequisites
*   **Node.js** ≥ 18.0.0
*   **MongoDB** (Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
*   **React Native Environment** (Android Studio / Xcode setup)
*   **Git**

---

### 1. Backend API Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Configure `.env` in `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/hostelsathi
JWT_SECRET=hostelsathi_super_secret_jwt_key_2026
```

Seed the database with sample Hyderabad student hostels:
```bash
npm run seed
```

Start the development server:
```bash
npm run dev
```
> 💡 Server runs on `http://localhost:5000` and displays your Wi-Fi network IP for mobile device connections.

---

### 2. Mobile App Setup (`mobile`)

```bash
# Navigate to mobile directory
cd ../mobile

# Install dependencies
npm install
```

**Configure Wi-Fi IP for physical devices or emulators:**
Update `PHYSICAL_DEVICE_IP` in `mobile/src/api/apiClient.js` and `mobile/src/utils/socket.js`:
```javascript
const PHYSICAL_DEVICE_IP = '192.168.x.x'; // Insert your PC's Wi-Fi IP address
```

Start Metro Bundler & Application:
```bash
# Start Metro bundler
npm start

# In a separate terminal tab:
npm run android    # Run on Android emulator/device
# or
npm run ios        # Run on iOS simulator
```

---

### 3. Admin Web Portal Setup (`admin-web`)

```bash
# Navigate to admin-web directory
cd ../admin-web

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> 🌐 Admin Portal starts on `http://localhost:5173`.

---

## 📱 App Navigation Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          UNAUTHENTICATED                               │
│        Splash Screen ──► Onboarding Screen ──► Auth (Login/Register)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
      ┌───────────────────────┐           ┌───────────────────────┐
      │  STUDENT TAB STACK    │           │   OWNER TAB STACK     │
      ├───────────────────────┤           ├───────────────────────┤
      │  🏠 Home (Discover)   │           │  📊 Pro Dashboard     │
      │  🔍 Search & Filters  │           │  📩 Enquiries & Leads │
      │  ❤️ Saved Wishlist    │           │  💬 Conversations     │
      │  💬 Conversations     │           │  👤 Profile & Settings│
      │  👤 Profile           │           └───────────┬───────────┘
      └───────────┬───────────┘                       │
                  │                                   │
                  ├► Roommate Finder                  ├► Add / Edit Listing
                  ├► Compare Hostels                  ├► Tenant Manager
                  ├► Detailed Hostel View             └► Per-Hostel Analytics
                  ├► Interactive Map
                  ├► Scan & Pay QR
                  ├► Rent Due Manager
                  ├► Digital Receipts
                  └► Socket.IO Chat
```

---

## 🔒 Security Highlights

*   **HTTP Protection**: Secured via Helmet headers preventing clickjacking, MIME-sniffing, and XSS attacks.
*   **Password Security**: Hashed using BCrypt.js with 10 salt rounds and whitespace trimming.
*   **Stateless Auth**: 30-day JWT signature verification.
*   **Role Enforcement**: Route-level access control restricting owner/student endpoints.
*   **UTR Fraud Shield**: Unique UTR index with 1-year TTL auto-expiry preventing double-claiming of rent payments.
*   **Safe File Uploads**: Image-only MIME type verification (JPEG, PNG, WebP) with strict 5MB size limits.

---

## 🗺️ Product Expansion Roadmap

- [x] Student Discovery & AI Recommendation Engine
- [x] Roommate Matching Matrix Screen
- [x] Real-time Socket.IO Chat with Typing Status
- [x] OCR Rent Screenshot UTR Extraction
- [x] Side-by-Side Hostel Comparison Matrix
- [x] Admin Web Management & MRR Portal
- [ ] Firebase Push Notifications (FCM token backend ready)
- [ ] Direct AWS S3 Cloud Storage Integration (fallback logic ready)
- [ ] Payment Gateway Integration (Razorpay live mode)
- [ ] Multi-Language Support (Telugu & Hindi localization)

---

## 👥 Team & Acknowledgments

*   **Business Operations**: Hostel owner onboarding, university outreach, marketing, and market growth.
*   **Technical Engineering**: Full-stack application architecture, React Native mobile apps, Node.js backend & web portals.

---

## 📄 License

This project is proprietary. All rights reserved.

---

*Built with ❤️ in Hyderabad — empowering every student to find a safe, affordable, and comfortable home away from home.*
