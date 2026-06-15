const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.IO setup for real-time chat
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB database
connectDB();

// Apply Security and Request parsing middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading images locally from frontend
}));
app.use(cors());

// Log requests in development BEFORE body parsing so we can see which request crashes
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (Hostel Photos)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Define API Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hostels', require('./routes/hostels'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/enquiries', require('./routes/enquiries'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/collections', require('./routes/collections'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tenants', require('./routes/tenants'));

// Root Endpoint for verification
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    message: 'Welcome to HostelSathi API Server v2.0 — with Chat, Recommendations & Analytics!',
    features: ['real-time-chat', 'ai-recommendations', 'push-notifications', 'analytics', 'wishlist-collections', 'availability-calendar'],
    timestamp: new Date()
  });
});

// ===== Socket.IO Real-Time Chat Logic =====
const Message = require('./models/Message');
const Notification = require('./models/Notification');

// Track online users: { userId -> socketId }
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Register user as online
  socket.on('user_online', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`[Socket] User ${userId} is online (${socket.id})`);
    io.emit('online_users', Object.keys(onlineUsers));
  });

  // Join a chat room (hostelId based room)
  socket.on('join_chat', ({ hostelId, userId }) => {
    const room = `chat_${hostelId}_${userId}`;
    socket.join(room);
    console.log(`[Socket] User ${userId} joined room: chat_${hostelId}`);
  });

  // Handle sending a message in real-time
  socket.on('send_message', async (data) => {
    try {
      const { hostelId, senderId, senderName, senderRole, receiverId, content } = data;

      // Persist message to DB
      const message = await Message.create({
        hostel: hostelId,
        sender: senderId,
        senderName,
        senderRole,
        receiver: receiverId,
        content: content.trim()
      });

      // Emit to receiver if online
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          ...message.toObject(),
          hostelId
        });
      }

      // Echo back to sender
      socket.emit('message_sent', message.toObject());

      // Create persistent notification for receiver
      await Notification.create({
        user: receiverId,
        type: 'new_message',
        title: `New message from ${senderName}`,
        body: content.length > 80 ? content.substring(0, 80) + '...' : content,
        data: { hostelId, messageId: message._id.toString() }
      });

      console.log(`[Socket] Message sent: ${senderId} → ${receiverId}`);
    } catch (err) {
      console.error('[Socket] Send message error:', err);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ hostelId, userId, receiverId, isTyping }) => {
    const receiverSocketId = onlineUsers[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { userId, hostelId, isTyping });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove user from online list
    for (const [userId, sid] of Object.entries(onlineUsers)) {
      if (sid === socket.id) {
        delete onlineUsers[userId];
        console.log(`[Socket] User ${userId} went offline`);
        break;
      }
    }
    io.emit('online_users', Object.keys(onlineUsers));
  });
});

// Fallback error handler for invalid paths
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error('Server error:', err);
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Start Server listening on ALL interfaces (0.0.0.0) so physical devices can connect
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // ✅ This allows physical device connections on same Wi-Fi

server.listen(PORT, HOST, () => {
  const os = require('os');
  const nets = os.networkInterfaces();
  let localIP = 'unknown';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        localIP = net.address;
        break;
      }
    }
  }
  console.log(`\n🚀 HostelSathi Server v2.0 running on port ${PORT}`);
  console.log(`👉 Local access: http://localhost:${PORT}/api/health`);
  console.log(`📱 Device access (update apiClient.js): http://${localIP}:${PORT}/api`);
  console.log(`💬 Socket.IO real-time chat: ENABLED`);
  console.log(`🤖 AI Recommendations: ENABLED`);
  console.log(`📊 Owner Analytics: ENABLED`);
  console.log(`\n✅ If your phone shows Network Error, update PHYSICAL_DEVICE_IP in mobile/src/api/apiClient.js to: ${localIP}\n`);
});
