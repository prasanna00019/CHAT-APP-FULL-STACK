import mongoose from "mongoose";
const StorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username:{
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: 'yellow',
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically deletes the story after 24 hours (86400 seconds)
  },
  visibility: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [], // List of user IDs who can view the story
  },
  viewers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
    
  ]
  ,
});
StorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
const Story = mongoose.model('Story', StorySchema);

export default Story;
