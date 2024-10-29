import mongoose from "mongoose";
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
    unique: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', 
    required: true,
  },
  description: {
    type: String,
    default: "", 
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now, 
    immutable: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupMessage',
  },
  groupIcon: {
    type: String, 
    default: "",
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
