import Conversation from "../models/ConversationModel.js";
import GroupMessage from "../models/GroupMessageModel.js";
import Group from "../models/GroupModel.js";
import User from "../models/UserModel.js";
import CryptoJS from "crypto-js";
import mongoose from "mongoose";
export const createGroup = async (req, res) => {
    try {
      const { name, description, participants, admins, createdBy } = req.body;
      // Validation: Ensure necessary fields are provided
      if(participants.length==0){
        // console.log("SELECT ATLEAST ONE PARTICIPANT  ");
        return res.status(400).json({ message: "SELECT ATLEAST ONE PARTICIPANT  " });
      }
      if (!name || !participants || participants.length === 0 || !admins || admins.length === 0 || !createdBy) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      // Check if the group name is unique
      const existingGroup = await Group.findOne({ name });
      if (existingGroup) {
        return res.status(400).json({ message: "Group name already exists" });
      }
      
      // Step 1: Create a new Conversation for this group
      participants.push(createdBy);
      const newConversation = new Conversation({
        participants,
        group: true, // Assuming you have a flag indicating it's a group conversation
        lastMessage: null, // Will be updated when the first message is sent
      });
  
      const savedConversation = await newConversation.save();
  
      // Step 2: Create a new Group
      const newGroup = new Group({
        name,
        conversationId: savedConversation._id,
        description,
        participants,
        admins,
        createdBy,
        createdAt: Date.now(), // Auto-generated but can be manually set if needed
      });
  
      const savedGroup = await newGroup.save();
  
      // Return the created group data
      return res.status(201).json({
        message: "Group created successfully",
        group: savedGroup,
      });
    } catch (error) {
      console.error("Error creating group:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
export const getGroups = async (req, res) => {
    try {
        const { userId } = req.params;
    
        // Find groups where the user is a participant
        const groups = await Group.find({ participants: userId }).populate('participants admins lastMessage createdBy');
    
        if (!groups || groups.length === 0) {
          return res.status(404).json({ message: 'No groups found for this user.' });
        }
    
        return res.status(200).json(groups);
      } catch (error) {
        console.error('Error fetching groups by userId:', error);
        return res.status(500).json({ message: 'Server error' });
      }
}
export const getGroupById = async (req, res) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      return res.status(200).json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      return res.status(500).json({ message: "Server error" });
    }
}
  export const deleteGroup = async (req, res) => {
    try {
      const { groupId } = req.params;
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
     Promise.all([
      Conversation.deleteOne({ _id: group.conversationId }),
      Group.deleteOne({ _id: groupId }),      
     ])
      return res.status(200).json({ message: "Group and associated conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting group:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  export const getMessagesByGroupId = async(req,res)=>{
    try {
        const messages = await GroupMessage.find({ group: req.params.groupId }).sort({ createdAt: 1 });
        res.json(messages);
        // console.log(messages, "from group controllers.js")
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages', error });
      }
  }
  export const getLastMessageOfAllGroups = async (req, res) => {
    try {
      // Get all groupIds
      const groupIds = await Group.find().distinct('_id');
  
      // Loop through each groupId and retrieve its messages
      const groupsWithLastMessage = await Promise.all(groupIds.map(async (groupId) => {
        const messages = await GroupMessage.find({ group:groupId }).sort({ createdAt: 1 });
        const lastMessage = messages[messages.length-1];
         // Get the last message
        // console.log(messages);
        //  console.log({groupId,lastMessage});
        return { _id:groupId, lastMessage };
      }));
  
      res.json(groupsWithLastMessage);
    } catch (error) {
      console.error('Error getting last message of all groups:', error);
      res.status(500).json({ message: 'Error getting last message of all groups' });
    }
  };