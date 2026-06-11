import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  savedHostels: [] // IDs of saved hostels, persisted locally
};

// ✅ Proper async thunk for logout (side effects belong here, not in reducer)
export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.multiRemove(['userToken', 'userData', 'savedHostels']);
});

// ✅ Thunk to restore session on app startup
export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const token = await AsyncStorage.getItem('userToken');
  const userData = await AsyncStorage.getItem('userData');
  const savedHostels = await AsyncStorage.getItem('savedHostels');
  if (token && userData) {
    return {
      token,
      user: JSON.parse(userData),
      savedHostels: savedHostels ? JSON.parse(savedHostels) : []
    };
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      // Persist to AsyncStorage (called outside reducer via middleware)
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    toggleSaveHostel: (state, action) => {
      const id = action.payload;
      if (state.savedHostels.includes(id)) {
        state.savedHostels = state.savedHostels.filter(h => h !== id);
      } else {
        state.savedHostels.push(id);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Logout thunk
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.savedHostels = [];
        state.error = null;
      })
      // Session restore thunk
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.savedHostels = action.payload.savedHostels;
        }
        state.loading = false;
      })
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { loginStart, loginSuccess, loginFailure, clearError, toggleSaveHostel } = authSlice.actions;
export default authSlice.reducer;
