// import { db } from "../utils/firebase.js";
import { collection, doc, getDocs, setDoc, addDoc, query, where, updateDoc, arrayUnion, getDoc, deleteDoc, arrayRemove, Firestore, orderBy, limit } from "firebase/firestore";
import { db } from "../utils/FireBase.js";
import Message from "../models/MessageModel.js";
import Conversation from "../models/ConversationModel.js";
import User from "../models/UserModel.js";
// Function to send a message
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = req.params.toId;
    const senderId = req.params.fromId;
    console.log(receiverId);
    console.log(senderId);

    // Check if the receiver is online
    const receiver = await User.findById(receiverId);
    const isReceiverOnline = receiver?.online || false;

    // Check if a conversation already exists between the users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        messages: [],
        updatedAt: new Date(),
      });
      await conversation.save();
    }

    // Create a new message object with status based on receiver's online status
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      text: message,
      sentAt: Date.now(),
      editedAt: null,
      deletedForEveryone: false,
      deletedFor: [],
      reactions: [],
      status: {
        state: isReceiverOnline ? 'delivered' : 'sent',
        deliveredTime: isReceiverOnline ? Date.now() : null,
        readTime: null,
      },
    });

    // Save the new message in the database
    await newMessage.save();

    // Update the conversation with the new message
    conversation.messages.push(newMessage._id);
    conversation.updatedAt = new Date();
    await conversation.save();

    // Respond with the newly created message
    res.status(201).json({ id: newMessage._id, ...newMessage.toObject() });

  } catch (error) {
    console.error("Error in sending message controller:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
// Function to get all messages between two users
export const getMessages = async (req, res) => {
  try {
    const { toId: userToChatId, fromId: senderId } = req.params;

    // If the sender and recipient are the same, return an empty array
    if (senderId === userToChatId) {
      return res.status(200).json([]);
    }

    // Query for the conversation between the two users
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });

    // If no conversation exists, return an empty array
    if (!conversation) {
      console.log("No conversation found between these users.");
      return res.status(200).json([]);
    }

    // Retrieve messages by their IDs stored in the conversation
    const messages = await Message.find({ _id: { $in: conversation.messages } });

    // If no messages are found, return an empty array
    if (messages.length === 0) {
      console.log("No messages found in this conversation.");
      return res.status(200).json([]);
    }

    // Respond with the fetched messages
    res.status(200).json(messages);

  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
  console.log(messageId);
  console.log(typeof(messageId));
    // Find the message in the database
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.deletedForEveryone) {
      // If the message is already marked as deleted for everyone, remove it from the database
      await Message.findByIdAndDelete(messageId);

      // Find the conversation that contains this message
      const conversation = await Conversation.findOne({ messages: messageId });

      if (conversation) {
        // Remove the message ID from the conversation's messages array
        conversation.messages.pull(messageId);
        await conversation.save();
      }
    } else {
      // Update the message to reflect that it's been deleted for everyone
      message.text = 'DELETED FOR EVERYONE';
      message.deletedForEveryone = true;
      await message.save();

      res.status(200).json({ message: 'Message marked as deleted for everyone' });
      return;
    }

    res.status(200).json({ message: 'Message deleted for everyone' });

  } catch (error) {
    console.error('Error in deleteMessageForEveryone controller:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// export const deleteMessageForEveryone = async (req, res) => {
//   try {
//     const { messageId } = req.params;
//     const messageRef = doc(db, 'messages', messageId);
//     const messageSnapshot = await getDoc(messageRef);
//     const messageData = messageSnapshot.data();

//     if (!messageSnapshot.exists()) {
//       return res.status(404).json({ error: 'Message not found' });
//     }

//     if (messageData.deletedForEveryone) {
//       // If the message is already deleted for everyone, delete it from the database
//       await deleteDoc(messageRef);

//       // Remove the message ID from the conversation's message array
//       await updateConversationMessageArray(messageData.conversationId, messageId);

//       res.status(200).json({ message: 'Message deleted for everyone and removed from conversation' });
//     } else {
//       // Update the message to reflect that it's been deleted for everyone
//       await updateDoc(messageRef, {
//         text: 'DELETED FOR EVERYONE',
//         deletedForEveryone: true,
//       });

//       // Remove the message ID from the conversation's message array
//       await updateConversationMessageArray(messageData.conversationId, messageId);

//       res.status(200).json({ message: 'Message marked as deleted for everyone and removed from conversation' });
//     }
//   } catch (error) {
//     console.error('Error in deleteMessageForEveryone controller:', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
// Backend function to handle "Delete for me"

export const deleteMessageForMe = async (req, res) => {
  const { messageId } = req.params; 
  const { userId } = req.params;

  try {
    // Update the message to include the userId in the deletedFor array
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId } // Add userId to deletedFor array without duplicates
    });

    res.status(200).json({ message: "Message deleted for you" });
  } catch (error) {
    console.error("Error deleting message for user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { editedText } = req.body; // Updated message text

    // Update the message's text and the editedAt timestamp
    await Message.findByIdAndUpdate(messageId, {
      text: editedText,
      editedAt: new Date() // Record the time of edit
    }, { new: true }); // Return the updated document

    res.status(200).json({ message: 'Message updated successfully' });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const starMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Find the message in the database
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get the current starred status
    const currentStarredStatus = message.starred || false;

    // Toggle the starred status
    const newStarredStatus = !currentStarredStatus;

    // Update the starred status in the database
    await Message.findByIdAndUpdate(messageId, { starred: newStarredStatus });

    return res.status(200).json({ message: 'Starred status updated', starred: newStarredStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update starred status' });
  }
};
export const pinMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    // Get the message document from MongoDB
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Get the current pinned status
    const currentPinnedStatus = message.pinned || false;
    const senderId = message.sender;
    const receiverId = message.receiver;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Sender or Receiver ID is undefined' });
    }

    // Query for the conversation involving the sender and receiver
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Initialize NumPinnedMessages field if it doesn't exist
    const numPinnedMessages = conversation.NumPinnedMessages || 0;

    // Check if we're pinning a message and the number of pinned messages is already at the limit
    if (!currentPinnedStatus && numPinnedMessages >= 3) {
      return res.status(200).json({ message: 'Cannot pin more than 3 messages' });
    }

    // Toggle the pinned status
    const newPinnedStatus = !currentPinnedStatus;

    // Update the pinned status in the message
    await Message.findByIdAndUpdate(messageId, { pinned: newPinnedStatus });

    // Update the NumPinnedMessages field in the conversation
    if (newPinnedStatus) {
      await Conversation.findByIdAndUpdate(conversation._id, { NumPinnedMessages: numPinnedMessages + 1 });
    } else {
      await Conversation.findByIdAndUpdate(conversation._id, { NumPinnedMessages: numPinnedMessages - 1 });
    }

    return res.status(200).json({ message: 'Pinned status updated', pinned: newPinnedStatus });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update pinned status' });
  }
};
export const ReactMessage = async (req, res) => {
  const { messageId, userId } = req.params;
  const { r } = req.body; // 'r' is the reaction
  console.log("message id in react message", messageId, userId, r);
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const currentReactions = message.reactions || [];

    // Check if the user already has a reaction in the reactions array
    const existingReactionIndex = currentReactions.findIndex(
      reaction => reaction.userId.toString() === userId
    );
    
    console.log("existingReactionIndex", existingReactionIndex);
    console.log(currentReactions, "current ");
    
    if (existingReactionIndex > -1) {
      // User has already reacted
      const existingReaction = currentReactions[existingReactionIndex];

      if (existingReaction.r === r) {
        // If the reaction is the same, remove it (unreact)
        currentReactions.splice(existingReactionIndex, 1);
      } else {
        // If it's a different reaction, update the reaction
        currentReactions[existingReactionIndex].r = r;
      }
    } else {
      // User hasn't reacted yet, add the new reaction
      currentReactions.push({ userId, r });
    }

    // Update the message document with the new reactions array
    await Message.findByIdAndUpdate(messageId, { reactions: currentReactions });

    return res.status(200).json({ message: 'Reactions updated', reactions: currentReactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to react to message' });
  }
};

export const getLastMessage = async (req, res) => {
  const { userId1, userId2 } = req.params; // Two user IDs between whom you want to find the conversation

  try {
    // Query the conversations collection for a conversation between userId1 and userId2
    const conversation = await Conversation.findOne({
      participants: { $all: [userId1, userId2] }
    });

    if (!conversation) {
      return res.status(200).json({ lastMessage: 'No messages till now' });
    }

    const messageIds = conversation.messages; // Assuming 'messages' is an array of message IDs

    if (!messageIds || messageIds.length === 0) {
      return res.status(200).json({ lastMessage: 'No messages till now' });
    }

    // Fetch the last message from the messages collection
    const lastMessageId = messageIds[messageIds.length - 1]; // Get the last message ID
    const lastMessage = await Message.findById(lastMessageId);

    if (!lastMessage) {
      return res.status(200).json({ lastMessage: 'No last message found' });
    }

    return res.status(200).json({ lastMessage });
  } catch (error) {
    console.error('Error fetching last message: ', error);
    return res.status(500).json({ error: 'Error fetching last message' });
  }
};

// When the user comes online
 export const  changeMessageStatusToDelivered = async (req, res) => {
  try {
    const { userId } = req.params; // Get the userId from the route parameter

    // Check if there are any messages that need updating
    const messagesToUpdate = await Message.find({
      receiver: userId,
      'status.state': 'sent',
    });

    if (messagesToUpdate.length === 0) {
      // If no messages with 'sent' status are found, return a response
      return res.status(200).json({ message: 'No messages to update as delivered.' });
    }

    // Proceed to update the messages if there are any with 'sent' status
    const filter = {
      receiver: userId,
      'status.state': 'sent',
    };

    const update = {
      'status.state': 'delivered',
      'status.deliveredTime': Date.now(),
    };

    // Update all matching messages in a single operation
    const result = await Message.updateMany(filter, { $set: update });

    console.log(`Updated ${result.modifiedCount} messages to delivered for user ${userId}`);
    res.status(200).json({ message: `Updated ${result.modifiedCount} messages to delivered.` });

  } catch (error) {
    console.error("Error in updating message status when user comes online:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
// Mark a specific message as read
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params; // Get the messageId from the route parameter

    // Find the message and update its status to 'read'
    const result = await Message.findOneAndUpdate(
      { _id: messageId, 'status.state': { $ne: 'read' } }, // Update only if it's not already 'read'
      {
        $set: {
          'status.state': 'read',
          'status.readTime': Date.now(),
        },
      },
      { new: true } // Return the updated document
    );

    // If the message was not found or already marked as read, return a message
    if (!result) {
      return res.status(200).json({ message: 'No unread message found to update.' });
    }

    // Respond with the updated message
    res.status(200).json({ message: 'Message marked as read.', updatedMessage: result });

  } catch (error) {
    console.error("Error in marking message as read:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
export const getSenderIdFromMessageId = async (req, res) => {
  try {
    const { messageId } = req.params; // Get the messageId from the URL parameters

    // Find the message by its ID
    const message = await Message.findById(messageId);

    // Check if the message exists
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Return the senderId as a response
    res.status(200).json({ sender: message.sender });

  } catch (error) {
    console.error("Error retrieving senderId:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};
export const getMessageDeliveryAndReadTime = async (req, res) => {
  try {
    const { messageId } = req.params; // Get the messageId from the URL parameters

    // Find the message by its ID
    const message = await Message.findById(messageId);

    // Check if the message exists
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Extract deliveredTime and readTime from the status
    const { deliveredTime, readTime } = message.status || {};

    // Return the deliveredTime and readTime as a response
    res.status(200).json({ deliveredTime, readTime });

  } catch (error) {
    console.error("Error retrieving deliveredTime and readTime:", error.message);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};