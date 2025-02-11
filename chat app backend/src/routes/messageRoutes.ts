import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';

const router = express.Router();

router.post('/messages', sendMessage);
router.get('/messages/:roomId', getMessages);

export default router;
