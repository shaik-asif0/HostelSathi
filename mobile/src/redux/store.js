import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import hostelReducer from './hostelSlice';
import chatReducer from './chatSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hostels: hostelReducer,
    chat: chatReducer,
    notifications: notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
