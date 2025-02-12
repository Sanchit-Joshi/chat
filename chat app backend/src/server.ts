import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import { Message } from './models/Message';
import { User } from './models/User';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);

// Track online users
const onlineUsers = new Map<string, string>(); // Map<socket.id, userId>

// WebSocket setup
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('join', async ({ roomId, userId }) => {
    try {
      console.log('join event received:', { roomId, userId });

      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Update user status to "online"
      await User.findByIdAndUpdate(userId, { status: 'online' });
      console.log(`User ${userId} status updated to online`);

      // Add user to online users
      onlineUsers.set(socket.id, userId);
      console.log(`User ${userId} added to online users`);

      // Fetch previous messages for the room
      const messages = await Message.find({ room: roomId }).populate('sender', 'username');
      socket.emit('previousMessages', messages);
      console.log(`Previous messages sent to user ${socket.id}`);

      // Broadcast updated online users list
      const users = await User.find({ _id: { $in: Array.from(onlineUsers.values()) } }).select('username');
      io.to(roomId).emit('onlineUsers', users);
      console.log(`Online users list broadcasted to room ${roomId}`);
    } catch (error) {
      console.error('Error handling join event:', error);
    }
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ roomId, content, sender }) => {
    try {
      console.log('sendMessage event received:', { roomId, content, sender });

      // Validate sender
      if (!sender) {
        console.error('Sender is required');
        return;
      }

      // Find the user by username
      const user = await User.findOne({ username: sender });
      if (!user) {
        console.error('User not found');
        return;
      }

      // Create and save the message
      const message = new Message({ content, sender: user._id, room: roomId });
      await message.save();
      console.log('Message saved:', message);

      // Populate the sender field with the username
      await message.populate('sender', 'username');

      // Broadcast the message to everyone in the room
      io.to(roomId).emit('receiveMessage', message);
      console.log('Message broadcasted to room:', roomId);
    } catch (error) {
      console.error('Error handling sendMessage event:', error);
    }
  });

  // Handle typing
  socket.on('typing', ({ roomId, username }) => {
    console.log('typing event received:', { roomId, username });
    io.to(roomId).emit('userTyping', username);
  });

  // Handle stop typing
  socket.on('stopTyping', ({ roomId }) => {
    console.log('stopTyping event received:', { roomId });
    io.to(roomId).emit('userStoppedTyping');
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      console.log('A user disconnected:', socket.id);
      const userId = onlineUsers.get(socket.id);
      if (userId) {
        // Update user status to "offline"
        await User.findByIdAndUpdate(userId, { status: 'offline' });
        console.log(`User ${userId} status updated to offline`);
      }

      // Remove user from online users
      onlineUsers.delete(socket.id);
      console.log(`User ${userId} removed from online users`);

      // Broadcast updated online users list
      const roomIds = Array.from(socket.rooms);
      roomIds.forEach((roomId) => {
        io.to(roomId).emit('onlineUsers', Array.from(onlineUsers.values()));
        console.log(`Online users list broadcasted to room ${roomId}`);
      });
    } catch (error) {
      console.error('Error handling disconnect event:', error);
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));