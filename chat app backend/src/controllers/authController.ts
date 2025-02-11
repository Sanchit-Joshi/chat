import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcryptjs';
interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface SignupRequest extends Request {
  body: {
    username: string;
    password: string;
    email: string;
    mobile: string;
  };
}

export const signup = async (req: SignupRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log('Signup request received:', req.body);
  const { username, password, email, mobile } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { mobile }] });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      mobile,
    });

    await newUser.save();

    const token = generateToken(newUser._id.toString());
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: LoginRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log('Login request received:', req.body);
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token });
  } catch (error) {
    next(error);
  }
};