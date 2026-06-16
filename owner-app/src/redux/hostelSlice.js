import { createSlice } from '@reduxjs/toolkit';

const MOCK_DB = [
  {
    _id: "mock1",
    name: "Miyapur Metro View PG",
    gender: "boys",
    photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80"],
    rent: { single: 5500, sharing2: 4500, sharing3: 3500 },
    rating: 4.2,
    reviews: 128,
    address: "Near Metro Station, Miyapur",
    amenities: ["WiFi", "AC", "Laundry", "Food"],
    description: "Premium boys PG located just 2 mins walk from Miyapur Metro."
  },
  {
    _id: "mock2",
    name: "Central Boys PG",
    gender: "boys",
    photos: ["https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80"],
    rent: { single: 7800, sharing2: 6000, sharing3: 5000 },
    rating: 4.5,
    reviews: 240,
    address: "Central Hub, Gachibowli",
    amenities: ["WiFi", "AC", "Gym", "Food", "Laundry"],
    description: "Luxury stay for students and IT professionals."
  },
  {
    _id: "mock3",
    name: "Sunrise Girls Hostel",
    gender: "girls",
    photos: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80"],
    rent: { single: 6500, sharing2: 5000, sharing3: 4000 },
    rating: 4.8,
    reviews: 312,
    address: "KPHB Phase 1, Near JNTU",
    amenities: ["WiFi", "AC", "CCTV", "Food", "Security"],
    description: "Highly secure and safe environment for girls with homely food."
  },
  {
    _id: "mock4",
    name: "Urban Co-Living Space",
    gender: "both",
    photos: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80"],
    rent: { single: 9000, sharing2: 7000, sharing3: 0 },
    rating: 4.6,
    reviews: 89,
    address: "Madhapur Main Road",
    amenities: ["WiFi", "AC", "Lounge", "Kitchen", "Gym"],
    description: "Modern co-living space with fantastic community events."
  }
];

const initialState = {
  hostels: MOCK_DB,
  recommended: [MOCK_DB[0], MOCK_DB[2]],
  selectedHostel: null,
  savedHostels: [], 
  loading: false,
  error: null
};

const hostelSlice = createSlice({
  name: 'hostels',
  initialState,
  reducers: {
    fetchHostelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHostelsSuccess: (state, action) => {
      state.loading = false;
      // In mock mode, we just keep the MOCK_DB unless action.payload overrides it
      if (action.payload && action.payload.length > 0) {
         state.hostels = action.payload;
      }
    },
    fetchHostelsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectHostel: (state, action) => {
      state.selectedHostel = action.payload;
    },
    toggleSaveHostel: (state, action) => {
      const id = action.payload;
      if (state.savedHostels.includes(id)) {
        state.savedHostels = state.savedHostels.filter(item => item !== id);
      } else {
        state.savedHostels.push(id);
      }
    },
    addHostel: (state, action) => {
      state.hostels.push({
        _id: 'hostel_' + Date.now(),
        photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=500&q=80'],
        rating: 0,
        reviews: 0,
        ...action.payload
      });
    }
  }
});

export const {
  fetchHostelsStart,
  fetchHostelsSuccess,
  fetchHostelsFailure,
  selectHostel,
  toggleSaveHostel,
  addHostel
} = hostelSlice.actions;

export default hostelSlice.reducer;
