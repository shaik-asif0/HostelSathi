import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    // messages keyed by hostelId for each conversation
    conversations: {}, // { hostelId: [messages] }
    activeHostelId: null,
    unreadCounts: {},  // { hostelId: count }
    totalUnread: 0,
    isConnected: false,
    loading: false,
    error: null
  },
  reducers: {
    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
    setActiveConversation: (state, action) => {
      state.activeHostelId = action.payload;
    },
    loadMessages: (state, action) => {
      const { hostelId, messages } = action.payload;
      state.conversations[hostelId] = messages;
      // Reset unread for this conversation
      state.unreadCounts[hostelId] = 0;
      state.totalUnread = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
    },
    appendMessage: (state, action) => {
      const { hostelId, message } = action.payload;
      if (!state.conversations[hostelId]) {
        state.conversations[hostelId] = [];
      }
      // Avoid duplicates
      const exists = state.conversations[hostelId].some(m => m._id === message._id);
      if (!exists) {
        state.conversations[hostelId].push(message);
      }
    },
    receiveMessage: (state, action) => {
      const { hostelId, message } = action.payload;
      if (!state.conversations[hostelId]) {
        state.conversations[hostelId] = [];
      }
      const exists = state.conversations[hostelId].some(m => m._id === message._id);
      if (!exists) {
        state.conversations[hostelId].push(message);
        // Increment unread if not viewing this conversation
        if (state.activeHostelId !== hostelId) {
          state.unreadCounts[hostelId] = (state.unreadCounts[hostelId] || 0) + 1;
          state.totalUnread = Object.values(state.unreadCounts).reduce((a, b) => a + b, 0);
        }
      }
    },
    setChatLoading: (state, action) => {
      state.loading = action.payload;
    },
    setChatError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearChat: (state) => {
      state.conversations = {};
      state.unreadCounts = {};
      state.totalUnread = 0;
      state.activeHostelId = null;
      state.isConnected = false;
    }
  }
});

export const {
  setConnected,
  setActiveConversation,
  loadMessages,
  appendMessage,
  receiveMessage,
  setChatLoading,
  setChatError,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;
