import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.ts';
import authRoutes from './routes/authRoutes.ts';
import messageRoutes from './routes/messageRoutes.ts';
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


// WebSocket
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', (message) => {
    socket.broadcast.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
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