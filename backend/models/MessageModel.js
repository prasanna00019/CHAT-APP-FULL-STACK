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
  media: {
    type: String,
    default: "",
  },
  sentAt: {
    type: Date,
    default: Date.now, 
    immutable: true, 
  },
  editedAt: {
    type: Date,
    default: null, 
  },
  deletedForEveryone: {
    type: Boolean,
    default: false,  
  },
  flaggedForDeletion: {
    type: Boolean,
    default: false,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
  }],
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    r: { type: String },
  }],
  pinned: {
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiration: {
      type: Date, 
    }
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message', 
  },
  type:{
   type:String,
   default:"text" 
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