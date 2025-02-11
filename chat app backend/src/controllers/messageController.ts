import { Request, Response } from 'express';
import Message from '../models/Message';

export const sendMessage = async (req: Request, res: Response) => {
  const { sender, content } = req.body;
  try {
    const message = new Message({ sender, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().populate('sender', 'mobile');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};