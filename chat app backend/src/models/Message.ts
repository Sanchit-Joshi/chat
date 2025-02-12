import mongoose, { Document, Schema } from 'mongoose';

interface IMessage extends Document {
  content: string;
  sender: mongoose.Types.ObjectId;
  room: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  content: { 
    type: String, 
    required: [true, 'Message content is required'],
    trim: true
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: [true, 'Sender ID is required']
  },
  room: { 
    type: String, 
    required: [true, 'Room ID is required'],
    trim: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Add a pre-save middleware to log the document before saving
MessageSchema.pre('save', function(next) {
  console.log('Attempting to save message:', {
    content: this.content,
    sender: this.sender,
    room: this.room
  });
  next();
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export { Message, IMessage };