import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hostels: [],
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
      state.hostels = action.payload;
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
    }
  }
});

export const {
  fetchHostelsStart,
  fetchHostelsSuccess,
  fetchHostelsFailure,
  selectHostel,
  toggleSaveHostel
} = hostelSlice.actions;

export default hostelSlice.reducer;
