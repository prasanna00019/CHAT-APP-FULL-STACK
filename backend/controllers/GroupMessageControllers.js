import mongoose from "mongoose";
import Conversation from "../models/ConversationModel.js";
import GroupMessage from "../models/GroupMessageModel.js";
import Group from "../models/GroupModel.js";
import User from "../models/UserModel.js";
import CryptoJS from "crypto-js";
function encryptMessage(message, secretKey) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}
function decryptMessage(encryptedMessage, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
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
        media: messageData.media
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
  export const ReactMessage = async (req, res) => {
    const { messageId, userId } = req.params;
    const { r } = req.body; // 'r' is the reaction
    console.log("message id in react message", messageId, userId, r);
    try {
      const message = await GroupMessage.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      const currentReactions = message.reactions || [];
      // Check if the user already has a reaction in the reactions array
      const existingReactionIndex = currentReactions.findIndex(
        reaction => reaction.userId.toString() === userId
      );
      if (existingReactionIndex > -1) {
        const existingReaction = currentReactions[existingReactionIndex];  
        if (existingReaction.r === r) {
          currentReactions.splice(existingReactionIndex, 1);
        } else {
          currentReactions[existingReactionIndex].r = r;
        }
      } else {
        currentReactions.push({ userId, r });
      }
      // Update the message document with the new reactions array
      await GroupMessage.findByIdAndUpdate(messageId, { reactions: currentReactions });
      return res.status(200).json(message);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to react to message' });
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
  export const deleteMessageById = async (req, res) => {
    try {
      const messageId = req.params.messageId; // assuming you're passing the message ID as a route parameter
      const message = await GroupMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (!message.deletedForEveryone && decryptMessage(message.text,process.env.GROUP_CHAT_SECRET_KEY)==='DELETED FOR EVERYONE'
   && message.flaggedForDeletion) {
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
      res.status(200).json(m);
    }
    else {
      // Update the message to reflect that it's been deleted for everyone
      message.text =encryptMessage ('DELETED FOR EVERYONE',process.env.GROUP_CHAT_SECRET_KEY);
      // message.deletedForEveryone = false;
      message.flaggedForDeletion=true;
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
  export const markGroupMessageAsRead = async (req, res) => {
    try {
      const { messageId,authUserId } = req.params; // Get the messageId from the route parameter  
      // Find the group message
      const message = await GroupMessage.findById(messageId);
    //  console.log(message)
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      // Check if the user already exists in the status array
      const userStatusIndex = message.status.findIndex(status => status.userId.toString() === authUserId.toString());
  // console.log(userStatusIndex)
  if (userStatusIndex !== -1 && message.status[userStatusIndex].state === 'read') {
    return res.status(200).json({ message: 'N/A' });
  }
      if (userStatusIndex !== -1) {
        // console.log('here...')
        // User exists, update their status to 'read'
        message.status[userStatusIndex].state = 'read';
        message.status[userStatusIndex].readTime = Date.now();
        // console.log(message,'seconf');
      } else {

        // User does not exist, push a new status entry for the user
        message.status.push({
          userId: authUserId,
          state: 'read',
          deliveredTime: null, // You can set this if needed
          readTime: Date.now(),
        });
      }
  
      // Save the updated message
      await message.save();
      // console.log(message,'three')
      res.status(200).json({message:message});
    } catch (error) {
      console.error("Error in marking group message as read:", error.message);
      res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
  };
  export const searchMessages = async (req, res) => {
    try {
      const { conversationId, searchTerm } = req.body;
      const messages = await GroupMessage.aggregate([
        {
          $search: {
            index: "default", // The name of the Atlas Search index
            text: {
              query: 'U2FsdGVkX1',
              path: "text",
              fuzzy: {
                maxEdits: 2, 
              },
            },
          },
        },
        {
          $lookup: {
            from: "conversations", // The collection name for Conversation
            localField: "_id",
            foreignField: "messages", // Assuming 'messages' field in Conversation contains message IDs
            as: "conversationData"
          }
        },
        {
          $match: { "conversationData._id": new mongoose.Types.ObjectId(conversationId) }
        },
        {
          $limit: 50 // Limit the number of search results
        }
      ]);
      const matchingMessages = messages.filter((message) => {
              try {
                const decryptedText = decryptMessage(message.text, process.env.GROUP_CHAT_SECRET_KEY);
                message.text=decryptedText;
                return decryptedText.toLowerCase().includes(searchTerm.toLowerCase());
              } catch (error) {
                console.error('Error decrypting message:', error);
                return false; 
              }
            });
      //  console.log(matchingMessages);     
      res.status(200).json(matchingMessages);
    } catch (error) {
      console.error("Error searching messages:", error);
      res.status(500).json({ error: "INTERNAL SERVER ERROR" });
    }
  };
  