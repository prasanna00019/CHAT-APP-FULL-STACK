import mongoose from "mongoose";
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name of the group
    unique: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', // References the existing Conversation schema
    required: true,
  },
  description: {
    type: String,
    default: "", // Optional description for the group
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References to the users who are part of the group
    required: true,
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References to the users who are admins of the group
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now, // The time the group was created
    immutable: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // The user who created the group
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupMessage', // Reference to the last message sent in the group
  },
  groupIcon: {
    type: String, // URL for the group icon image
    default: "",
  },
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
