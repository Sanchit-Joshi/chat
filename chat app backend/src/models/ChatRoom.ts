import mongoose, { Document } from 'mongoose';

export interface IChatRoom extends Document {
    name: string;
    type: 'direct' | 'group';
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    admins: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['direct', 'group'],
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

chatRoomSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Index for faster queries
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ type: 1 });

export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema); 