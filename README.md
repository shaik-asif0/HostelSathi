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

---

## 🎯 Target Users

*   **Students** — BTech / Degree / PG students relocating to Hyderabad for college.
*   **Hostel Owners** — PG / hostel owners in Hyderabad wanting more student enquiries.

---

## 💰 Revenue Model

| Stream | Details | Timeline |
|---|---|---|
| Free basic listing | Owners list for free — builds supply | Month 1 onwards |
| Premium listing | ₹499/month — appear at top of search | Month 5 onwards |
| Lead fee | ₹200 per confirmed booking | Month 5 onwards |
| Vendor ads | Tiffin services, stationery shops advertising to students | Month 6 onwards |

---

## 🛠️ Tech Stack

### Frontend — Web MVP & Mobile
*   **Web MVP**: React + Vite, Vanilla CSS (Premium Dark/Light themes, Glassmorphism, Micro-animations)
*   **Mobile App**: React Native (Cross-platform iOS + Android, Redux Toolkit, React Navigation)
*   **APIs**: Leaflet / Google Maps Platform for distance calculation & map layouts
*   **Storage**: Axios, LocalStorage / AsyncStorage

### Backend & Database
*   **Runtime & Server**: Node.js + Express.js
*   **Auth**: JWT (JSON Web Tokens), BCrypt for hashing, Console-based Mock OTP (verification)
*   **Media**: Multer for photo uploads (supports Local fallback in MVP & AWS S3 integration)
*   **Database**: MongoDB Atlas + Mongoose ODM (using `2dsphere` geospatial indices)

---

## 📁 Project Structure

```
HostelSathi/
│
├── frontend/                  # React + Vite Web MVP (Student & Owner Portal)
│   ├── src/
│   │   ├── components/        # Interactive UI components (HostelCard, Map, etc.)
│   │   ├── screens/
│   │   │   ├── student/       # Home, Search, Details, Reviews, Saved
│   │   │   └── owner/         # Dashboard, AddHostel, EditHostel, Enquiries
│   │   ├── index.css          # Premium design system tokens & theme styles
│   │   └── App.jsx
│   └── package.json
│
├── mobile/                    # React Native App (Structured Scaffolding)
│   ├── src/
│   │   ├── screens/           # Student & Owner screens
│   │   ├── components/        # Reusable Native UI components
│   │   ├── navigation/        # Stack & Tab Navigators
│   │   ├── redux/             # Store & slices (auth, hostels)
│   │   └── utils/             # Helpers and constants
│   └── package.json
│
└── backend/                   # Node.js + Express Server
    ├── config/                # Mongoose database client
    ├── middleware/            # JWT authentication gate
    ├── models/                # User, Hostel, Review, and Enquiry schemas
    ├── routes/                # Auth, Hostels, Reviews, and Enquiries API
    ├── utils/                 # Database seed scripts
    ├── server.js
    └── package.json
```

---

## 🔌 API Endpoints

```
POST   /api/auth/register          Register student or owner
POST   /api/auth/login             Login + get JWT token
GET    /api/auth/me                Get current logged-in user profile

GET    /api/hostels                Get all hostels (with search & filters)
GET    /api/hostels/nearby         Hostels near coordinates (geospatial $near)
GET    /api/hostels/:id            Single hostel detail
POST   /api/hostels                Owner: create listing (auth required)
PUT    /api/hostels/:id            Owner: update listing (auth required)
DELETE /api/hostels/:id            Owner: delete listing (auth required)

POST   /api/reviews                Student: add review (auth required)
GET    /api/reviews/:hostelId      Get reviews for a hostel

POST   /api/enquiries              Student: request contact/book visit (auth required)
GET    /api/enquiries/owner        Owner: view received enquiries (auth required)
```

---

## 🚀 Getting Started

### 1. Database & Backend Setup
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

Start the developer server:
```bash
npm run dev
```

### 2. Frontend Web MVP Setup
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at the displayed port (usually `http://localhost:5173`) to experience the interactive Student & Owner experience.

### 3. Mobile Scaffolding
Navigate to the `mobile/` directory to inspect or test React Native code:
```bash
cd ../mobile
npm install
```

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

*Built with ❤️ in Hyderabad — for every student who ever dragged a suitcase through an unfamiliar city.*
