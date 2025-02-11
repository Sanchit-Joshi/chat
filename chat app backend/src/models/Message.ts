import mongoose, { Document } from 'mongoose';

export interface IMessage extends Document {
    content: string;
    sender: mongoose.Types.ObjectId;
    room: mongoose.Types.ObjectId;
    type: 'text' | 'image' | 'file';
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    readBy: [{
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

messageSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);