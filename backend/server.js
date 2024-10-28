import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from 'socket.io';
import authRoutes from "./routes/AuthRoutes.js";
import userRoutes from './routes/UserRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import StoryRoutes from './routes/StoryRoutes.js'
import GroupRoutes from './routes/GroupRoutes.js'
import path from "path";
import connectDB from "./DB/connectDB.js";
import Story from "./models/StoryModel.js";
import GroupMessage from "./models/GroupMessageModel.js";
import { group } from "console";
import User from "./models/UserModel.js";
dotenv.config();
const PORT = 5000;
const app = express();

// Create HTTP server for Express and Socket.IO
const server = http.createServer(app);

// Initialize Firebase Admin

// Initialize Socket.IO with CORS support
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust this to your React frontend's URL
    methods: ['GET', 'POST']
  }
});
const onlineUsers = {}; // Store online users
export let userSocketMap = {}; // To map socket IDs to user IDs
const updateMessageToDelivered=async(userId)=>{
  try{
    const res=await fetch(`http://localhost:5000/message/Message-delivered/${userId}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      }
    });
    const data=await res.json();
    console.log(data)
  }
  catch(error){
    console.log(error)
  }
}
const updateMessageToDeliveredGroup=async(userId)=>{
  try{
    const res=await fetch(`http://localhost:5000/group/changeDeliveryStatus/${userId}`,{
      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      }
    });
    const data=await res.json();
    // console.log(data , "from update database")
    return data;
  }
  catch(error){
    console.log(error)
  }
}
const updateUserStatusInDatabase = async(userId,status) => {
  // const userId = Authuser._id; // Assuming Authuser._id contains the user ID
 console.log('User ID:', userId);
 console.log('Online status:', status);
  const url = `http://localhost:5000/users/updateStatus/${userId}`;
  const bodyData = {
      online: status.online,
      lastSeen: status.lastSeen || null
  };

  try {
    if(userId){
      const response = await fetch(url, {
          method: 'PUT', // Use 'PUT' or 'PATCH' depending on your backend setup
          headers: {
              'Content-Type': 'application/json', // Set the content type to JSON
          },
          body: JSON.stringify(bodyData), // Convert the JavaScript object to JSON
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Handle error response
      }
      
      const data = await response.json(); // Parse the JSON response
      console.log('User status updated:', data);
    }
  } catch (error) {
      console.error('Error updating user status:', error);
  }
};
 io.on('connection', async(socket) => {
  const userId = socket.handshake.query.userId;
  const Authuser=socket.handshake.query.Authuser;
    console.log('New user connected:', socket.id);
    socket.on('joinGroup', (groupId) => {
      console.log(`Socket ${socket.id} joining group ${groupId}`);
      socket.join(groupId);
    });
    socket.on('sendMessageGroup', async(messageData) => {
      console.log('Message received:', messageData);
      // Broadcast message to the group
      try {
        const response=await fetch(`http://localhost:5000/group/sendMessageGroup/${messageData.sender}/${messageData.group}`,{
          method:'POST'
      ,    headers:{ "Content-Type": "application/json" },
      body: JSON.stringify({ messageData, replyTo:messageData.replyTo })
    }
      );
      const savedMessage = await response.json();
      console.log('Message saved to database:', savedMessage);
      // console.log(response," from server.js message sent successfuly ")
      // socket.broadcast.to(messageData.group).emit('receiveMessage', savedMessage);
      io.to(messageData.group).emit('receiveMessage', savedMessage);
      io.to(messageData.group).emit('lastMessageGroup', savedMessage);
      }
      catch (error) {
        console.error('Error saving message:', error);
      }
    });  
   // Handle "Delete for Me"
socket.on('deleteForMe', async (messageId, groupId) => {
  console.log(`User wants to delete message for themselves: ${messageId}`);
  
  try {
    // Update the message data in the database to add the user's ID to "DeleteForMe" array (or similar)
    const response = await fetch(`http://localhost:5000/group/deleteMessageForMe/${messageId}/${Authuser}`, {
      method: 'PATCH',
      headers: { "Content-Type": "application/json" },
     // Assuming the user is connected via Socket.IO
    });
  //  console.log("response from server.js ",Authuser);
      if (response.ok) {
        const savedMessage = await response.json();
      // Broadcast the event to update only the user's UI (if necessary)
      socket.emit('messageDeletedForMe', savedMessage);
      socket.emit('lastMessageGroup', savedMessage);
    }
  } catch (error) {
    console.error('Error deleting message for the user:', error);
  }
});
// Handle "Delete for Everyone"
socket.on('deleteForEveryone', async (messageId, groupId) => {
  // console.log(`User wants to delete message for everyone: ${messageId}`);
  try {
    // Delete the message from the database
    const response = await fetch(`http://localhost:5000/group/deleteMessageById/${messageId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      const savedMessage = await response.json();
      // console.log(previousMessage);
      io.to(groupId).emit('messageDeletedForEveryone', savedMessage);
      io.to(groupId).emit('lastMessageGroup', savedMessage);
    }
  } catch (error) {
    console.error('Error deleting message for everyone:', error);
  }
});    
// server.js

// server.js

socket.on('pinMessageGroup', async (messageId, pinData,groupId) => {
  try {
    const message = await GroupMessage.findById(messageId);
    if (!message) {
      // return socket.emit('error', 'Message not found'); 
      return;
    }
    if(!message.pinned.isPinned){
      message.pinned.isPinned= true;
      message.pinned.expiration= pinData.expiration
    // console.log("Message pinned successfully");
  }
  else{
      message.pinned.isPinned=false;
      message.pinned.expiration= null;
  }
  await message.save();
  // socket.emit('messagePinnedGroup',message);
  // console.log(message.group);
  io.to(groupId).emit('messagePinnedGroup',message);
  } catch (error) {
    console.error("Error pinning message:", error.message);
  }
});
socket.on('starMessageGroup', async (messageId, userId) => {
  try {
    // Step 1: Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return socket.emit('error', 'User not found');
    }
    // Step 2: Check if messageId is already in the starredMessages array
    const messageIndex = user.starredMessages.findIndex(
      (starredMessageId) => starredMessageId.toString() === messageId.toString()
    );
    if (messageIndex === -1) {
      // Step 3: If messageId is not in starredMessages, add it
      user.starredMessages.push(messageId);
      socket.emit('messageStarredGroup', user);
    } else {
      // Step 4: If messageId exists in starredMessages, remove it
      user.starredMessages.splice(messageIndex, 1);
      socket.emit('messageStarredGroup', user);
    }
    // Save the updated user document
    await user.save();
  } catch (error) {
    console.error('Error updating starred messages:', error);
    socket.emit('error', 'An error occurred while updating starred messages');
  }
});
socket.on('editMessageGroup', async ({ messageId, groupId, newText }) => {
  try {
    // Find the message by ID
    const message = await GroupMessage.findById(messageId);
    if (!message) {
      return socket.emit('error', 'Message not found');
    }
    // Update the message text
    message.text = newText;
    message.editedAt = Date.now(); // Optionally store the time when the message was edited
    // Save the updated message
    await message.save();
    // Emit the updated message to the group
    io.to(groupId).emit('messageEditedGroup', message);
  } catch (error) {
    console.error('Error editing message:', error);
    socket.emit('error', 'Failed to edit message');
  }
});
socket.on('typingGroup', (data) => {
      // console.log(data.sender," is typing from server.js");
      socket.broadcast.to(data.group).emit('typingGroup', {
        conversationId: data.conversationId,
        group: data.group,  
        sender: data.sender
      }); 
    });
    socket.on('stopTypingGroup', (data) => {  
      // console.log(data);
      socket.broadcast.to(data.group).emit('stopTypingGroup', {
        conversationId: data.conversationId,
        group: data.group,
        sender: data.sender 
      });
    })
   
    if (Authuser) {
      // Register user
      onlineUsers[Authuser] = { socketId: socket.id, lastSeen: null };
      // userSocketMap[socket.id] = Authuser; // the danger line
      // userSocketMap[socket.id] = userId; // the danger line
      socket.broadcast.emit('user_online', { Authuser, joinedTime: new Date().toLocaleTimeString() });
      updateUserStatusInDatabase(Authuser, { online: true, lastSeen: null });
      updateMessageToDelivered(Authuser);
    
      console.log(`User ${Authuser} registered with socket ID outside ${socket.id}`);
      console.log("User connected with user ID from server.js outside :",userSocketMap[socket.id]);

       socket.on('register', (userId) => {
         userSocketMap[socket.id] = userId;
         console.log(`User ${userId} registered with socket ID inside ${socket.id}`);
       })
     if(userId!==null ){  
      // Send the current online users list to the newly connected user
      socket.emit('current_online_users', Object.keys(onlineUsers));
      // Also send the online status for the new user
      // if(Authuser){
        socket.emit('user_online', { Authuser, joinedTime: new Date().toLocaleTimeString() });
        updateUserStatusInDatabase(Authuser, { online: true, lastSeen: null});
      // } 
     }
    }
    const updatedMessages= await updateMessageToDeliveredGroup(Authuser);
    // console.log(updatedMessages, ' from server.ts ');
    io.to(updatedMessages[0]?.group).emit('updateMessages', updatedMessages); 
    // Handle message sending
    socket.on('send_message', ({ receiverId, message }) => {
      const receiverSocket = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === receiverId
      );
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive_message', { message,senderId:userSocketMap[socket.id] });
        console.log(`Message sent from ${userSocketMap[socket.id]} to ${receiverId}`);
      }
    });
  
    socket.on('typing', ({ receiverId }) => {
      // console.log(' typing in server.js .... ')
      const receiverSocket = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === receiverId
      );
      // console.log(receiverSocket," from here");
      if (receiverSocket) {
        io.to(receiverSocket).emit('typing', userSocketMap[socket.id]);
      }
    });
  
    socket.on('stop-typing', ({ receiverId }) => {
      const receiverSocket = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === receiverId
      );
      if (receiverSocket) {
        io.to(receiverSocket).emit('stop-typing', userSocketMap[socket.id]);
      }
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      const lastSeen = new Date().toLocaleTimeString();
      updateUserStatusInDatabase(Authuser, { online: false, lastSeen });
      console.log(userSocketMap[socket.id]," from here");
      if (userSocketMap[socket.id]) {
        const lastSeen = new Date().toLocaleTimeString();
        const userId = userSocketMap[socket.id];
        // console.log(`Updated last seen for user ${userId} to ${lastSeen} online to false`);
        try{
          updateUserStatusInDatabase(userId, { online: false, lastSeen });
          console.log(`Updated last seen for user ${userId} to ${lastSeen} online to false from disconnect `);
        // console.log("ee")
        }
        catch(err){
          console.log(err);
        }
      }
        // Notify other clients that the user is offline
        socket.broadcast.emit('user_offline', { userId, lastSeen });
        console.log('User disconnected:', socket.id);
        
        // Remove user from onlineUsers and userSocketMap
        delete onlineUsers[userId];
        delete userSocketMap[socket.id];
      
    });
    socket.on('deleteStory', async (storyId) => {
      console.log('delete socket working well ... ')
      try {
        await Story.findByIdAndDelete(storyId); // Delete the story from the database
        io.emit('storyDeleted', storyId); // Optionally, notify all clients about the deletion
        // socket.broadcast.emit('storyDeleted', storyId);
      } catch (error) {
        console.error('Error deleting story:', error);
        socket.emit('storyError', { message: 'Failed to delete story' });
      }
    });
    
    socket.on('viewStory', async ({ storyId, userId }) => {
      try {
        const story = await Story.findById(storyId);
        if (!story) return;
        const alreadyViewed = story.viewers.some(viewer => viewer.userId.toString() === userId);
        // console.log(alreadyViewed);
        if (!alreadyViewed) {
          story.viewers.push({ userId, viewedAt: new Date() });
          await story.save();
          socket.broadcast.emit('updateViewers', {storyId, viewers:story.viewers});
        }
      } catch (error) {
        console.error('Error updating view count:', error);
      }
    });
    socket.on('createStory', async (storyData) => {
      // console.log(" socket working in backend .... ")
      try {
        const newStory = new Story(storyData);
        
        await newStory.save();
        
        // Emit the new story to all connected clients
        io.emit('storyCreated', newStory);
        socket.broadcast.emit('newStory', { message: 'New Story added' , story: newStory });

        // console.log('Story created and emitted:', newStory);
      } catch (error) {
        console.error('Error creating story:', error);
        // Optionally emit an error event to the client
        socket.emit('storyError', { message: 'Failed to create story' });
      }
    });
    socket.on('likeStory', async ({ storyId, userId }) => {
      try {
        const story = await Story.findById(storyId);
        if (!story) {
          return;
        }
    
        // Check if the user has already liked the story
        const alreadyLiked = story.likes.some(like => like.userId.toString() === userId);
        // console.log('liked status ', alreadyLiked);
        if (!alreadyLiked) {
          // Add the like to the story
          story.likes.push({ userId });
          await story.save();
    
          // Emit the updated likes to all clients
          io.emit('updateLikes', { storyId, likes: story.likes });
        }
        else{
          // Remove the like from the story
          story.likes = story.likes.filter(like => like.userId.toString() !== userId);
          await story.save();
    
          // Emit the updated likes to all clients
          io.emit('updateLikes', { storyId, likes: story.likes });
        }
      } catch (error) {
        console.error('Error liking story:', error);
      }
    });
    
  });
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/message', messageRoutes);
app.use('/story',StoryRoutes);
app.use('/group',GroupRoutes);
// Test route
app.get('/', (req, res) => {
  res.send("Hello, chat app CN project!");
});

// Listen on the PORT using the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
export { io };