import mongoose from "mongoose";
const groupMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receivers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  }],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group', 
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', 
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  isSystemMessage: {
    type: Boolean,
    default: false,
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
    ref: 'GroupMessage', 
  },
  status: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
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
  }],
});

const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);

export default GroupMessage;
