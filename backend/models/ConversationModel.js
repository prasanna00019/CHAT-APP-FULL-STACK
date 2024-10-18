import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    messages:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
      }
    ],
    NumPinnedMessages:{
      type: Number,
      default: 0,
    }
  });
  
  const Conversation = mongoose.model('Conversation', conversationSchema);
  
export default Conversation  