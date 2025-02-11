// authRoutes.ts
import express from 'express';
import { login, signup } from '../controllers/authController';

const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);

router.get('/test', (req, res) => {
    res.send('Hello from auth routes');
    });

export default router;