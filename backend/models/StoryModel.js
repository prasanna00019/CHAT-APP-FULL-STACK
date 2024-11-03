import mongoose from "mongoose";
const StorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  media: {
    type: String,
    default: '',
  },
  backgroundColor: {
    type: String,
    default: 'yellow',
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  visibility: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    default: [], 
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
