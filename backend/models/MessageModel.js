import { Timestamp } from "firebase/firestore";
import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now, // Sets the default to the current date and time
    immutable: true, // This field won't be updated after creation
  },
  editedAt: {
    type: Date,
    default: null,  // Tracks when a message is edited
  },
  deletedForEveryone: {
    type: Boolean,
    default: false,  // True if the message is deleted for everyone
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Array of user IDs for whom the message is deleted
  }],
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    r: { type: String },
  }],
  pinned:{
    type:Boolean,
    default: false
  },
  starred:{
    type:Boolean,
    default: false
  },
  status: {
    type: {
      state: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent',
      },
      deliveredTime: {
        type: Date,
        default: null,
      },
      readTime: {
        type: Date,
        default: null,
      },
    },
    default: {
      state: 'sent',
      deliveredTime: null,
      readTime: null,
    },
  },
});

const Message = mongoose.model('Message', messageSchema);

export default Message