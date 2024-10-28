import mongoose from "mongoose";
import Conversation from "../models/ConversationModel.js";
import GroupMessage from "../models/GroupMessageModel.js";
import Group from "../models/GroupModel.js";
import User from "../models/UserModel.js";
export const sendMessageGroup = async (req, res) => {
    try {
      const { messageData, replyTo } = req.body; 
      const senderId = req.params.fromId;
      const groupId = req.params.groupId;
  
      console.log(senderId);
      console.log(groupId);
      const receivers = messageData.receivers;
      console.log(receivers);
  
      // Get the online status for each receiver
      const users = await User.find({ _id: { $in: receivers } });
      const onlineStatuses = users.map(user => ({
        userId: user._id,
        state: user.online ? 'delivered' : 'sent',
        deliveredTime: user.online ? Date.now() : null,
        readTime: null
      }));
  
      // Create the new group message
      const newGroupMessage = new GroupMessage({
        sender: senderId,
        receivers: receivers,
        group: groupId,
        conversationId: messageData.conversationId,
        text: messageData.text,
        reply: replyTo || null,
        status: onlineStatuses,
      });
  
      // Save the new message in the database
      const savedMessage = await newGroupMessage.save();

      // Update the conversation with the new message ID
      await Conversation.findByIdAndUpdate(
        messageData.conversationId,
        { $push: { messages: savedMessage._id }, updatedAt: Date.now(),lastMessage:savedMessage._id}, // Add message ID and update timestamp
        { new: true } // Return the updated document
      );
    
      return  res.status(201).json(savedMessage);
    } catch (error) {
      console.error("Error in sending group message:", error.message);
      res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
  };
  export const changeGroupMessageStatusToDelivered = async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from route parameter
  
      // Get all groups the user is part of by checking participants
      const groups = await Group.find({
        participants: { $in: [new mongoose.Types.ObjectId(userId)] } // Check if userId is in participants
      });
  
      if (groups.length === 0) {
        return res.status(200).json({ message: 'User is not part of any groups.' });
      }
  
      // Initialize a count for updated messages
      let updatedCount = 0;
      let messages;
      // Loop through each group
      for (const group of groups) {
        // Get all messages for the current group
         messages = await GroupMessage.find({ group: group._id });
  
        // Loop through each message and update the status
        for (const message of messages) {
          // Check if the userId is in the receivers array
          if (message.receivers.includes(userId)) {
            // Check if the status for this userId is 'sent'
            const statusEntry = message.status.find(entry => entry.userId.toString() === userId && entry.state === 'sent');
  
            if (statusEntry) {
              // Update the status to 'delivered'
              statusEntry.state = 'delivered';
              statusEntry.deliveredTime = Date.now();
              updatedCount++;
  
              // Save the updated message
              await message.save();
            }
          }
        }
      }
  
      console.log(`Updated ${updatedCount} messages to delivered for user ${userId}`);
      res.status(200).json(messages);
  
    } catch (error) {
      console.error("Error in updating group message status when user comes online:", error.message);
      res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
  };

  // export const changeGroupMessageStatusToDelivered = async (req, res) => {
  //   try {
  //     const { userId } = req.params; // Get userId from route parameter
  
  //     // Step 1: Get all groups the user is part of by checking participants
  //     const groups = await Group.find({
  //       participants: { $in: [new mongoose.Types.ObjectId(userId)] } // Check if userId is in participants
  //     });
  
  //     if (groups.length === 0) {
  //       return res.status(200).json({ message: 'User is not part of any groups.' });
  //     }
  
  //     const groupIds = groups.map(group => group._id); // Extract group IDs
  
  //     // Step 2: Get all messages for the groups the user is part of
  //     const messages = await GroupMessage.find({
  //       group: { $in: groupIds },
  //       'status.userId': userId,
  //       'status.state': 'sent'
  //     });
  
  //     if (messages.length === 0) {
  //       return res.status(200).json({ message: 'No messages to update.' });
  //     }
  
  //     // Step 3: Update the status of the messages to 'delivered' for the user
  //     let updatedCount = 0;
  //     const updatedMessages = [];
  
  //     for (const message of messages) {
  //       // Update the status to 'delivered' for this specific user
  //       message.status = message.status.map(entry => {
  //         if (entry.userId.toString() === userId && entry.state === 'sent') {
  //           entry.state = 'delivered';
  //           entry.deliveredTime = Date.now();
  //           updatedCount++;
  //         }
  //         return entry;
  //       });
  
  //       // Save the updated message and keep track of it for later
  //       await message.save();
  //       updatedMessages.push(message); // Collect updated messages for emitting
  //     }
  
  //     console.log(`Updated ${updatedCount} messages to delivered for user ${userId}`);
  
  //     // Step 4: Group messages by group ID for emitting updates
  //     const groupedMessages = updatedMessages.reduce((groupsMap, message) => {
  //       if (!groupsMap[message.group]) {
  //         groupsMap[message.group] = [];
  //       }
  //       groupsMap[message.group].push(message);
  //       return groupsMap;
  //     }, {});
  
  //     // Step 5: Emit the updated messages to the relevant groups using socket
  //     Object.keys(groupedMessages).forEach((groupId) => {
  //       io.to(groupId).emit('updateMessages', groupedMessages[groupId]);
  //     });
  
  //     res.status(200).json({ message: `Updated ${updatedCount} messages to delivered.`, updatedMessages });
  
  //   } catch (error) {
  //     console.error("Error in updating group message status when user comes online:", error.message);
  //     res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  //   }
  // };
  
  export const getMessageById=async(req,res)=>{
    const { messageId } = req.params; // Extract message ID from request parameters
  try {
    const message = await GroupMessage.findById(messageId) // Populate sender, receivers, and reply fields if needed
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message); // Respond with the message data
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'INTERNAL SERVER ERROR' });
  }
  }
  // export const deleteMessageById = async (req, res) => {
  //   try {
  //     const messageId = req.params.messageId; // assuming you're passing the message ID as a route parameter
  //     const message = await GroupMessage.findByIdAndDelete(messageId);
  //     if (!message) {
  //       return res.status(404).json({ message: 'Message not found' });
  //     }
  //     const conversation = await Conversation.findOne({ messages: messageId });
  //     if (conversation) {
  //       // Remove the message ID from the conversation's messages array
  //       conversation.messages.pull(messageId);
  //       await conversation.save();
  //     }
  //     res.status(200).json({ message: 'Message deleted successfully' });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Error deleting message' });
  //   }
  // };
  export const deleteMessageById = async (req, res) => {
    try {
      const messageId = req.params.messageId; // assuming you're passing the message ID as a route parameter
      const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (!message.deletedForEveryone && message.text==='DELETED FOR EVERYONE') {
      // If the message is already marked as deleted for everyone, remove it from the database
      const m=await GroupMessage.findById(messageId);
      m.deletedForEveryone=true;
      await GroupMessage.findByIdAndDelete(messageId);
      // Find the conversation that contains this message
      const conversation = await Conversation.findOne({ messages: messageId });
      if (conversation) {
        // Remove the message ID from the conversation's messages array
        conversation.messages.pull(messageId);
        await conversation.save();
      }
      const previousMessage = await GroupMessage.findOne({
        conversationId: conversation._id,
        sentAt: { $lt: m.sentAt },
      })
        .sort({ sentAt: -1 }) // Sort in descending order to get the most recent message before this one
        .exec();
        // console.log(previousMessage," from srk")
      res.status(200).json(m);
    }
    else {
      // Update the message to reflect that it's been deleted for everyone
      message.text = 'DELETED FOR EVERYONE'
      message.deletedForEveryone = false;
      await message.save();
      res.status(200).json(message);
      return;
    }
    // res.status(200).json({ message: 'Message deleted for everyone' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting message' });
    }
  };
  export const deleteMessageForMe=async(req,res)=>{
    const { messageId } = req.params; 
    const { userId } = req.params;
    try {
      // Update the message to include the userId in the deletedFor array
      await GroupMessage.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: userId } // Add userId to deletedFor array without duplicates
      });
      const message=await GroupMessage.findById(messageId);
      res.status(200).json(message);
    } catch (error) {
      console.error("Error deleting message for user:", error);
      res.status(500).json({ message: "Server error" });
    }
  }