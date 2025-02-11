import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.ts';
import authRoutes from './routes/authRoutes.ts';
import messageRoutes from './routes/messageRoutes.ts';
import { Message } from './models/Message';
// import mongoose from 'mongoose';


dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);


// WebSocket setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room
  socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Fetch previous messages for the room
      const messages = await Message.find({ room: roomId }).populate('sender', 'username');
      socket.emit('previousMessages', messages);
  });

  // Handle sending messages
  socket.on('sendMessage', async ({ roomId, content, sender }) => {
      const message = new Message({ content, sender, room: roomId });
      await message.save();

      // Broadcast the message to everyone in the room
      io.to(roomId).emit('receiveMessage', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app', {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true,
// })
// .then(() => {
  
// })
// .catch((err) => console.error('MongoDB connection error:', err));