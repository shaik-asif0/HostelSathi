import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * API Base URL:
 * - Android Emulator: 10.0.2.2 maps to host machine localhost
 * - Physical Android device: Use your computer's local Wi-Fi IP
 * - iOS Simulator: localhost works directly
 *
 * ⚠️ If your Wi-Fi IP changes, update PHYSICAL_DEVICE_IP below.
 */
const PHYSICAL_DEVICE_IP = '192.168.1.37'; // ← Your PC's Wi-Fi IP
const EMULATOR_HOST = '10.0.2.2';

// Since you are testing on a physical Android device, you MUST use your PC's Wi-Fi IP address.
// If you get a connection error, update the PHYSICAL_DEVICE_IP above to your current IPv4 address.
const BASE_URL = `http://${PHYSICAL_DEVICE_IP}:5000/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor: automatically attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Token read failed — proceed without auth
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: graceful error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.friendlyMessage = 'Request timed out. Check your Wi-Fi connection.';
    } else if (!error.response) {
      error.friendlyMessage = 'Cannot connect to server. Make sure backend is running and your phone is on the same Wi-Fi.';
    } else if (error.response.status === 401) {
      error.friendlyMessage = 'Session expired. Please log in again.';
    } else if (error.response.status === 403) {
      error.friendlyMessage = 'You do not have permission for this action.';
    } else if (error.response.status >= 500) {
      error.friendlyMessage = 'Server error. Please try again later.';
    }
    return Promise.reject(error);
  }
);

// ─── Typed API methods ────────────────────────────────────────────────────────

export const uploadAPI = {
  uploadFiles: (formData) =>
    apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};


export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  sendOtp: (phone) => apiClient.post('/auth/send-otp', { phone }),
  verifyOtp: (phone, code) => apiClient.post('/auth/verify-otp', { phone, code }),
  getMe: () => apiClient.get('/auth/me'),
};

export const hostelsAPI = {
  getAll: (params) => apiClient.get('/hostels', { params }),
  getNearby: (lat, lng, maxDistance = 5000) =>
    apiClient.get('/hostels/nearby', { params: { lat, lng, maxDistance } }),
  getRecommended: () => apiClient.get('/hostels/recommended'),
  getById: (id) => apiClient.get(`/hostels/${id}`),
  create: (data) => apiClient.post('/hostels', data),
  update: (id, data) => apiClient.put(`/hostels/${id}`, data),
  delete: (id) => apiClient.delete(`/hostels/${id}`),
  trackView: (id) => apiClient.post(`/hostels/${id}/track-view`),
  getAnalytics: (id) => apiClient.get(`/hostels/${id}/analytics`),
  uploadPhotos: (id, formData) =>
    apiClient.post(`/hostels/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const reviewsAPI = {
  getByHostelId: (hostelId) => apiClient.get(`/reviews/${hostelId}`),
  create: (data) => apiClient.post('/reviews', data),
};

export const enquiriesAPI = {
  create: (data) => apiClient.post('/enquiries', data),
  getOwnerEnquiries: () => apiClient.get('/enquiries/owner'),
  updateStatus: (id, status) => apiClient.put(`/enquiries/${id}`, { status }),
};

export const notificationsAPI = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.put(`/notifications/${id}/read`, {}),
  markAllRead: () => apiClient.put('/notifications/read-all', {}),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

export const paymentsAPI = {
  unlockHostel: (hostelId) => apiClient.post('/payments/unlock', { hostelId }),
  verifyScreenshot: (formData) => apiClient.post('/payments/verify-screenshot', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const tenantsAPI = {
  joinHostel: (formData) => apiClient.post('/tenants/join', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTenantsByHostel: (hostelId) => apiClient.get(`/tenants/hostel/${hostelId}`),
  removeTenant: (tenantId) => apiClient.put(`/tenants/${tenantId}/remove`)
};

export default apiClient;
