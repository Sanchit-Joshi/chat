import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addDummyUser = async () => {
  await connectDB();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const user = new User({
    mobile: '1234567890',
    email: 'dummy@example.com',
    password: hashedPassword,
  });

  await user.save();
  console.log('Dummy user added');
  mongoose.disconnect();
};

addDummyUser();