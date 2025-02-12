import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

export const signup = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Signup request received:", req.body);
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();
    console.log("User created successfully:", user);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log("Token generated successfully");

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set user status to online
    user.status = 'online';
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log("Login successful for user:", email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  console.log("Token verification request received");
  res.status(200).json({ valid: true });
};

export const logout = async (req: Request, res: Response): Promise<Response | void | any> => {
  try {
    const userId = req.body.userId;
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // Update user status to "offline"
        user.status = 'offline';
        await user.save();
      }
    }
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: 'Error logging out', error });
  }
};

export const getCurrentUser = async (req: Request & { user?: any }, res: Response): Promise<Response | void | any> => {
  try {
    console.log("Get current user request received for user ID:", req.user.userId);
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.log("User not found for ID:", req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User found:", user);
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
};