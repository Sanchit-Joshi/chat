import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    avatar?: string;
    status: 'online' | 'offline';
    lastSeen: Date;
    createdAt: Date;
    rooms: mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    mobile: {
        type: String,
        unique: false, // Remove the unique constraint
        sparse: true  // This allows multiple null values
    }
});

export const User = mongoose.model<IUser>('User', userSchema);