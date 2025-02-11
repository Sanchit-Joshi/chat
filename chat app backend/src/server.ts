import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
const io = new Server(server, { cors: { origin: '*' } });

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
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room
    socket.on('joinRoom', async ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Add user to online users
        onlineUsers.set(socket.id, userId);

        // Fetch previous messages for the room
        const messages = await Message.find({ room: roomId }).populate('sender', 'username');
        socket.emit('previousMessages', messages);

        // Broadcast updated online users list
        const users = await User.find({ _id: { $in: Array.from(onlineUsers.values()) } }).select('username');
        io.to(roomId).emit('onlineUsers', users);
    });

    // Handle sending messages
    socket.on('sendMessage', async ({ roomId, content, sender }) => {
        const message = new Message({ content, sender, room: roomId }); // roomId is a string
        await message.save();
    
        // Broadcast the message to everyone in the room
        io.to(roomId).emit('receiveMessage', message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);

        // Remove user from online users
        onlineUsers.delete(socket.id);

        // Broadcast updated online users list
        const roomIds = Array.from(socket.rooms);
        roomIds.forEach((roomId) => {
            io.to(roomId).emit('onlineUsers', Array.from(onlineUsers.values()));
        });
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));