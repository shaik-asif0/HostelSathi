import { io } from 'socket.io-client';

const PHYSICAL_DEVICE_IP = '192.168.1.57';
const SOCKET_URL = `http://${PHYSICAL_DEVICE_IP}:5000`;

let socket = null;

/**
 * Initialize and return the Socket.IO singleton connection.
 * @param {string} userId - The current authenticated user's ID
 */
export const initSocket = (userId) => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket.id);
    if (userId) {
      socket.emit('user_online', userId);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
};

/**
 * Get the existing socket instance (without reinitializing)
 */
export const getSocket = () => socket;

/**
 * Disconnect and destroy the socket connection (on logout)
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[Socket] Manually disconnected');
  }
};

/**
 * Join a hostel-specific chat room
 * @param {string} hostelId
 * @param {string} userId
 */
export const joinChatRoom = (hostelId, userId) => {
  if (socket) {
    socket.emit('join_chat', { hostelId, userId });
  }
};

/**
 * Send a chat message via socket
 */
export const sendSocketMessage = (data) => {
  if (socket && socket.connected) {
    socket.emit('send_message', data);
    return true;
  }
  return false;
};

/**
 * Emit typing indicator
 */
export const emitTyping = (hostelId, userId, receiverId, isTyping) => {
  if (socket) {
    socket.emit('typing', { hostelId, userId, receiverId, isTyping });
  }
};
