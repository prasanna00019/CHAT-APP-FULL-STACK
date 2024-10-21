import Story from "../models/StoryModel.js";
import { io } from "../server.js";
export const createStory = async (req, res) => {
    try {
        // console.log(Date.now());
        const { userId, content, visibility,username } = req.body;
        // Validation
        if (!userId || !constent) {
            return res.status(400).json({ message: 'User ID and content are required.' });
        }
        // Create the story
        visibility.push(userId);
        visibility.push('670ff84eb261513b586a2b94');
        const newStory = new Story({
            userId,
            content,
            visibility,
            username,
        });
        await newStory.save();
        io.emit('storyCreated', newStory);
        return res.status(201).json({ message: 'Story created successfully', story: newStory });
    } catch (error) {
        console.error('Error creating story:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const getStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId).populate('userId', 'username').populate('viewers.userId', 'username');
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        return res.status(200).json( story );
    } catch (error) {
        console.error('Error fetching story:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
export const getAllStories = async (req, res) => {
    try {
        const { userId, AuthuserId } = req.params   ; // Optional: filter based on visibility for a specific user

        let query = {};
        if (userId) {
            // Only return stories that are visible to the specified user
            query = { $or: [{ visibility: { $in: [AuthuserId] } }, { visibility: [] }] };
        }

        const stories = await Story.find(query)
            // .populate('userId')
            // .populate('viewers.userId')
            .sort({ createdAt: -1 }); // Optional: sort by most recent

            
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stories', error });
    }
};
// In your StoryControllers.js or wherever you define the controller
export const getUserStories = async (req, res) => {
    try {
        const { userId } = req.params   ; // Optional: filter based on visibility for a specific user

        let query = {};
        if (userId) {
            // Only return stories that are visible to the specified user
            query = { $or: [{ visibility: { $in: [userId] } }, { visibility: [] }] };
        }

        const stories = await Story.find(query)
            .populate('userId')
            // .populate('viewers.userId')
            .sort({ createdAt: -1 }); // Optional: sort by most recent

            
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stories', error });
    }
  };
  
export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findByIdAndDelete(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        return res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting story:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
export const getViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const story = await Story.findById(storyId)
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }
        // console.log(story.viewers);
        return res.status(200).json(story.viewers);
    } catch (error) {
        console.error('Error fetching story:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}