import express from 'express'
import { createStory, deleteStory, getAllStories, getStory, getUserStories, getViewers } from '../controllers/StoryControllers.js';
const router=express.Router();
router.post('/create-story/',createStory);
router.get('/story/:storyId',getStory);
router.get('/viewers/:storyId',getViewers)
router.get('/all/:userId/:AuthuserId',getAllStories)
router.get('/user/:userId', getUserStories);
router.delete('/delete/:storyId',deleteStory)
export default router