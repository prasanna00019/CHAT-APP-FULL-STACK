import mongoose from "mongoose";
const groupMessageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receivers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Array of user IDs who should receive the message
        required: true,
      }],
      group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group', // Reference to the group where the message is sent
        required: true,
      },    
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation', // Reference to the existing Conversation schema
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
        type: String, // URL of the media file (image, video, etc.)
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
        type: Date, // Store the expiration time as a date
      }
    },
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupMessage', // Reply reference to a group message
    },
    status: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true, // The user for whom the status is tracked
        },
        state: {
          type: String,
          enum: ['sent', 'delivered', 'read'],
          default: 'sent', // Default state is 'sent'
        },
        deliveredTime: {
          type: Date,
          default: null, // Time when the message was delivered to this user
        },
        readTime: {
          type: Date,
          default: null, // Time when the message was read by this user
        },
      }],      
  });
  
  const GroupMessage = mongoose.model('GroupMessage', groupMessageSchema);
  
  export default GroupMessage;
  