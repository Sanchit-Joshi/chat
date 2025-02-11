import { Request, Response } from 'express';
import { Message } from '../models/Message';

export const sendMessage = async (req: Request, res: Response) => {
    const { sender, content, roomId } = req.body;
    try {
        const message = new Message({ sender, content, room: roomId });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    const { roomId } = req.params;
    try {
        const messages = await Message.find({ room: roomId }).populate('sender', 'username');
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};