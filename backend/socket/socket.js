import { Server } from "socket.io";
import http from "http";
import bcrypt from 'bcryptjs';
import Story from "../models/StoryModel.js";
import GroupMessage from "../models/GroupMessageModel.js";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";
import CryptoJS from "crypto-js";
import Group from "../models/GroupModel.js";
import express from "express"
import Conversation from "../models/ConversationModel.js";
const app=express();
const server=http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });
  const onlineUsers = {}; // Store online users
  function encryptMessage(message, secretKey) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  }
  export let userSocketMap = {}; // To map socket IDs to user IDs
  const updateMessageToDelivered = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/message/Message-delivered/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      // console.log(data)
    }
    catch (error) {
      console.log(error)
    }
  }
  const updateMessageToDeliveredGroup = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/group/changeDeliveryStatus/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const data = await res.json();
      return data;
    }
    catch (error) {
      console.log(error)
    }
  }
  const updateUserStatusInDatabase = async (userId, status) => {
    const url = `http://localhost:5000/users/updateStatus/${userId}`;
    const bodyData = {
      online: status.online,
      lastSeen: status.lastSeen || null
    };
    try {
      if (userId) {
        const response = await fetch(url, {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData), 
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); 
        }
        // const data = await response.json(); 
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const Authuser = socket.handshake.query.Authuser;
    console.log(userId,' ... userId');
    console.log(Authuser,' ... AuthUserId');
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
    });
    socket.on('sendMessageOneToOne', async (messageData) => {
      try {
        const res = await fetch(`http://localhost:5000/message/send/${messageData.sender}/${messageData.receiver}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageData.message, replyTo: messageData.reply,type:messageData.type })
        });
        const data = await res.json();   
        const receiverSocket = Object.keys(userSocketMap).find(
          (key) => userSocketMap[key] === messageData.receiver
        );
        console.log(userSocketMap, ' from send message');
        socket.emit('receiveMessage', data);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receiveMessage', data);
        }
        if(messageData.type==='story'){
          const res1 = await fetch(`http://localhost:5000/message/send/${messageData.receiver}/${messageData.sender}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: encryptMessage("AUTOMATED MESSAGE TESTING",'!@#$%^y7gH*3xs'), replyTo: messageData.reply
              ,type:"automated"
             })
          });
          const data1 = await res1.json();
          socket.emit('receiveMessage', data1);
          if (receiverSocket) {
            io.to(receiverSocket).emit('receiveMessage', data1);
          } 
        }
      }
      catch (e) {
        console.log(e)
      }
    })
    socket.on('addMembers', async ({ groupId, participants ,conversationId}) => {
      try {
        const group = await Group.findById(groupId);
        const conv=await Conversation.findById(conversationId);
      if (!group) {
        throw new Error('Group not found');
      }
  
      // Add new participants, avoiding duplicates
      const updatedParticipants = [...new Set([...group.participants, ...participants])];
      console.log(updatedParticipants);
      // Update the group in the database
      group.participants = updatedParticipants;
      conv.participants = updatedParticipants;
      await conv.save();
      const updatedGroup = await group.save();
        io.to(groupId).emit('groupUpdated', updatedGroup);
      } catch (error) {
        console.error('Error adding members:', error);
        socket.emit('error', { message: 'Failed to add members to group' });
      }
    });
    socket.on('removeMembers', async ({ groupId, participants, conversationId }) => {
      try {
        const group = await Group.findById(groupId);
        const conv = await Conversation.findById(conversationId);
        // Remove participants, ensuring no duplicates and only removing those in the group
        const updatedParticipants = group.participants.filter(
          (participant) => !participants.includes(participant)
        );
        console.log(updatedParticipants);
    
        // Update the group and conversation models with the new participants list
        group.participants = updatedParticipants;
        conv.participants = updatedParticipants;
    
        // Save both the group and conversation
        await group.save();
        await conv.save();
    
        // Emit the updated group to all connected users
        io.to(groupId).emit('groupUpdated', group);
      } catch (error) {
        console.error('Error removing members:', error);
        socket.emit('error', { message: 'Failed to remove members from group' });
      }
    });
    socket.on('makeAdmin',async({groupId,participants})=>{
       try{
        const group = await Group.findById(groupId);
        const updatedAdmins = [...new Set([...group.admins, ...participants])];
        group.admins = updatedAdmins;
        await group.save();
        io.to(groupId).emit('groupUpdated', group);
       }
       catch(err){
        console.log(err)
       }
    })
    socket.on('removeAdmin',async({groupId,participants})=>{
      try{
        const group = await Group.findById(groupId);
        const updatedAdmins = group.admins.filter(
          (participant) => !participants.includes(participant)
        );
        group.admins = updatedAdmins;
        await group.save();
        io.to(groupId).emit('groupUpdated', group);
      }
      catch(err){
       console.log(err)
      }
    });
    socket.on('sendMessageGroup', async (messageData,delay) => {
      console.log('Message received:', messageData,delay);
      // Broadcast message to the group
      try {
       if(delay!==0){
        const targetTime = new Date(Date.now() + delay);
    const targetMinutes = targetTime.getMinutes();
    const targetSeconds = targetTime.getSeconds();
  
    // Schedule a cron job to execute at the target time
    const testCron = cron.schedule(`${targetSeconds} ${targetMinutes} * * * *`, async() => {
      const response = await fetch(`http://localhost:5000/group/sendMessageGroup/${messageData.sender}/${messageData.group}`, {
        method: 'POST'
        , headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageData, replyTo: messageData.replyTo })
      }
      );
      const savedMessage = await response.json();
      io.to(messageData.group).emit('receiveMessage', savedMessage);
      io.to(messageData.group).emit('lastMessageGroup', savedMessage);
      testCron.stop(); // Stop the cron job after execution to prevent repeated runs
    });
       } 
       else{
        const response = await fetch(`http://localhost:5000/group/sendMessageGroup/${messageData.sender}/${messageData.group}`, {
          method: 'POST'
          , headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageData, replyTo: messageData.replyTo })
        }
        );
        const savedMessage = await response.json();
        io.to(messageData.group).emit('receiveMessage', savedMessage);
        io.to(messageData.group).emit('lastMessageGroup', savedMessage);
      }
    }
      catch (error) {
        console.error('Error saving message:', error);
      }
    });
    socket.on('deleteMessageForMeGroupUndo', async (message, AuthuserId,index) => {
      try {
        // Remove the AuthuserId from the deletedFor array
        await GroupMessage.findByIdAndUpdate(message._id, {
          $pull: { deletedFor: AuthuserId }
        });
        
        const updatedMessage = await GroupMessage.findById(message._id);
        socket.emit('messageUpdatedUndo', updatedMessage,index); // Send back updated message
      } catch (error) {
        console.error("Error restoring message for user:", error);
      }
    });
    socket.on('DMEgroupUndo', async (message, AuthuserId,text) => {
      try{
         await GroupMessage.findByIdAndUpdate(message._id, {
           text: text,
           flaggedForDeletion: false
         })
         const updatedMessage = await GroupMessage.findById(message._id);
         io.to(message.group).emit('DMEGroupUpdated', updatedMessage);
      }
      catch(err){
        console.log(err)
      }
    }  
    )
    //FOR GROUPS 
    socket.on('deleteForMe', async (messageId, groupId,index) => {
      try {
        const response = await fetch(`http://localhost:5000/group/deleteMessageForMe/${messageId}/${Authuser}`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const savedMessage = await response.json();
          socket.emit('messageDeletedForMe', savedMessage,index);
          socket.emit('lastMessageGroup', savedMessage);
        }
      } catch (error) {
        console.error('Error deleting message for the user:', error);
      }
    });
    socket.on('deleteForMeOnetoOne', async (messageId, userId) => {
      console.log(`User wants to delete message for themselves: ${messageId}`);
      try {
        const response = await fetch(`http://localhost:5000/message/deleteMessageForMe/${messageId}/${userId}`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          // Assuming the user is connected via Socket.IO
        });
        if (response.ok) {
          const savedMessage = await response.json();
          socket.emit('messageDeletedForMeOnetoOne', savedMessage);
        }
      } catch (error) {
        console.error('Error deleting message for the user:', error);
      }
    })
    // Handle "Delete for Everyone" in groups !!! 
    socket.on('deleteForEveryone', async (messageId, groupId,text) => {
      try {
        // Delete the message from the database
        const response = await fetch(`http://localhost:5000/group/deleteMessageById/${messageId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          const savedMessage = await response.json();
          io.to(groupId).emit('messageDeletedForEveryone', savedMessage,text);
          io.to(groupId).emit('lastMessageGroup', savedMessage);
        }
      } catch (error) {
        console.error('Error deleting message for everyone:', error);
      }
    });
    socket.on('cronTesting', async (delay) => {
      console.log('Received delay for cron test:', delay, 'ms');
    console.log('recieved request at ', new Date(Date.now()).toLocaleTimeString());
      // Calculate the target time by adding delay to the current timestamp
      const targetTime = new Date(Date.now() + delay);
      const targetMinutes = targetTime.getMinutes();
      const targetSeconds = targetTime.getSeconds();
    
      // Schedule a cron job to execute at the target time
      const testCron = cron.schedule(`${targetSeconds} ${targetMinutes} * * * *`, () => {
        console.log('Cron job executed at:', new Date(Date.now()).toLocaleTimeString());
        testCron.stop(); // Stop the cron job after execution to prevent repeated runs
      });
    
      console.log('Scheduled cron to execute at:', targetTime.toLocaleTimeString());
    });
    socket.on('deleteForEveryoneOnetoOne', async (messageId, userId) => {
      try {
        const response = await fetch(`http://localhost:5000/message/deleteForEveryone/${messageId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          const savedMessage = await response.json();
          // Emit the deleted message info to both the sender and the receiver
          const receiverSocketId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === userId
          );
          socket.emit('messageDeletedForEveryoneOnetoOne', savedMessage);  // Emit to sender
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeletedForEveryoneOnetoOne', savedMessage); // Emit to receiver
          }
        }
      }
      catch (error) {
        console.error('Error deleting message for everyone:', error);
      }
    });
    socket.on('pinMessageGroup', async (messageId, pinData, groupId) => {
      try {
        const message = await GroupMessage.findById(messageId);
        if (!message) {
          // return socket.emit('error', 'Message not found'); 
          return;
        }
        if (!message.pinned.isPinned) {
          message.pinned.isPinned = true;
          message.pinned.expiration = pinData.expiration
        }
        else {
          message.pinned.isPinned = false;
          message.pinned.expiration = null;
        }
        await message.save();
        io.to(groupId).emit('messagePinnedGroup', message);
      } catch (error) {
        console.error("Error pinning message:", error.message);
      }
    });
    socket.on('PinMessageOnetoOne', async (messageId, pinData, userId) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return;
        }
        if (!message.pinned.isPinned) {
          message.pinned.isPinned = true;
          message.pinned.expiration = pinData.expiration
        }
        else {
          message.pinned.isPinned = false;
          message.pinned.expiration = null;
        }
        await message.save();
        const receiverSocketId = Object.keys(userSocketMap).find(
          (key) => userSocketMap[key] === userId
        );
        socket.emit('messagePinnedOnetoOne', message);  // Emit to sender
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('messagePinnedOnetoOne', message); // Emit to receiver
        }
      }
      catch (error) {
        console.log(error);
      }
    })
    socket.on('AddReactionGroup', async ({ emoji, messageId, userId, groupId }) => {
      try {
        const res = await fetch(`http://localhost:5000/group/reaction/${messageId}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ r: emoji }),
        })
        const message = await res.json();
        io.to(groupId).emit('messageReactedGroup', message);
      }
      catch (error) {
        console.log(error, " in react message group ... ");
      }
    })
    socket.on('AddReactionOnetoOne', async ({ emoji, messageId, userId, receiverId }) => {
      try {
        const res = await fetch(`http://localhost:5000/message/reaction/${messageId}/${userId}`, {
          method: "PUT",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ r: emoji }),
        })
        const message = await res.json();
        const receiverSocketId = Object.keys(userSocketMap).find(
          (key) => userSocketMap[key] === receiverId
        );
        socket.emit('messageReactedOneToOne', message);  // Emit to sender
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('messageReactedOneToOne', message); // Emit to receiver
        }
      }
      catch (error) {
  
      }
    })
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
    socket.on('ChatLock',async({AuthuserId,receiverId,password,remove})=>{
         try{
          const user = await User.findById(AuthuserId);
          // Initialize LockedChats if it does not exist
          if (!user.LockedChats) {
            user.LockedChats = [];
          }
          // Find the index of the receiverId in LockedChats
          let lockIndex = user.LockedChats.findIndex(lock => lock.userId === receiverId);
          if (password) {
            // If password provided, add or update the lock
            const hashedPassword = await bcrypt.hash(password, 10);
            const lockEntry = { userId: receiverId, password: password };
      
            if (lockIndex === -1) {
              // If the targetId is not already locked, add a new entry
              user.LockedChats.push(lockEntry);
            } else {
              // If already locked, update the password
              user.LockedChats[lockIndex].password = password;
            }
          } else if(remove) {
            if (lockIndex !== -1) {
              user.LockedChats.splice(lockIndex, 1);
            }
          }
          // Save changes to the user document
          await user.save();
          // console.log(user);
          const receiverSocketId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === receiverId
          );
      
          socket.emit('ChatLockOneToOne', user);  // Emit to sender
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('ChatLockOneToOne', user); // Emit to receiver
          }
      
        }
         catch(error){
          console.error("Error handling chat lock:", error.message);
          // res.status(500).json({ error: "INTERNAL SERVER ERROR" });
         }
    })
    socket.on('starMessageOneToOne', async (messageId, userId) => {
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
          socket.emit('messageStarredOneToOne', user);
        } else {
          // Step 4: If messageId exists in starredMessages, remove it
          user.starredMessages.splice(messageIndex, 1);
          socket.emit('messageStarredOneToOne', user);
        }
        // Save the updated user document
        await user.save();
      } catch (error) {
        console.error('Error updating starred messages:', error);
        socket.emit('error', 'An error occurred while updating starred messages');
      }
    })
    socket.on('editMessageGroup', async ({ messageId, groupId, newText }) => {
      try {
        const message = await GroupMessage.findById(messageId);
        if (!message) {
          return socket.emit('error', 'Message not found');
        }
        message.text = encryptMessage( newText,process.env.GROUP_CHAT_SECRET_KEY);
        message.editedAt = Date.now(); 
        await message.save();
        io.to(groupId).emit('messageEditedGroup', message);
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', 'Failed to edit message');
      }
    });
    socket.on('editMessageOneToOne', async ({ messageId, userId, newText }) => {
      try {
        const res = await fetch(`http://localhost:5000/message/edit/${messageId}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editedText: newText })
        })
        if (res.ok) {
          const data = await res.json();
          console.log(data,' from editOneToOne');
          const receiverSocketId = Object.keys(userSocketMap).find(
            (key) => userSocketMap[key] === userId
          );
          socket.emit('messageEditedOnetoOne', data);  // Emit to sender
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageEditedOnetoOne', data); // Emit to receiver
          }
        }
      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', 'Failed to edit message');
      }
    })
    socket.on('typingGroup', (data) => {
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
    socket.on('UpdateLastSeen',async({userId,lastSeen})=>{
      try{
        const user= await User.findById(userId);
        user.ShowLastSeen=lastSeen;
        await user.save();
        // console.log(user);
        io.emit('UpdatedLastSeen',user);
      }
      catch(err){ console.log(err); }
    })
    socket.on('UpdateOnlineStatus',async({userId,onlineStatus})=>{
      try{
        const user= await User.findById(userId);
        user.ShowOnline=onlineStatus; 
        await user.save();
        io.emit('UpdatedOnlineStatus',user);
      }
      catch(err){ console.log(err); }
    });
    socket.on('ReadMessageGroup',async({messageId,senderId,readingUserId})=>{
       try{
        const res= await fetch(`http://localhost:5000/group/MarkRead/${messageId}/${readingUserId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },});
          const data=await res.json();
        if(data.message!=='N/A'){  
         io.to(senderId).emit('MarkReadGroup',data.message);
        }
       }
       catch(error){
        console.log(error)
       } 
    })
    socket.on('ReadMessageOneToOne',async({messageId,senderId})=>{
      try{
         const res= await fetch(`http://localhost:5000/message/Message-read/${messageId}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },});
      const data=await res.json()
      if(data.message!='N/A'){
        const receiverSocket = Object.keys(userSocketMap).find(
          (key) => userSocketMap[key] === senderId
        );
        socket.emit('MarkReadOneToOne', data.message);  // Emit to sender
        if (receiverSocket) {
          io.to(receiverSocket).emit('MarkReadOneToOne', data.message);
        }
      }
      }
      catch(error){
        console.log(error)
      }
    })
    socket.on('UpdateReadReceipts',async({userId,readReceipts})=>{
      try{
        const user= await User.findById(userId);
        user.ReadReceipts=readReceipts;
        await user.save();
        io.emit('UpdatedReadReceipts',user);
      }
      catch(err){ console.log(err); }
    })
    socket.on('ProfilePhotoChanged',async({Authuser,downloadURL})=>{
      try{
        const user= await User.findById(Authuser._id);
         user.profilePic=downloadURL;
         await user.save();  
        io.emit('ChangedPhoto',{user,downloadURL})
      }
      catch(err){ }
    })
    if (Authuser) {
      onlineUsers[Authuser] = { socketId: socket.id, lastSeen: null };
      socket.broadcast.emit('user_online', { userId: Authuser, online: true, lastSeen: null });
      updateUserStatusInDatabase(Authuser, { online: true, lastSeen: null });
      updateMessageToDelivered(Authuser);
      socket.on('register', (userId) => {
        for (const [socketId, mappedUserId] of Object.entries(userSocketMap)) {
          if (mappedUserId === userId) {
            delete userSocketMap[socketId];
          }
        }
        userSocketMap[socket.id] = userId;
      })
      if (userId !== null) {
        socket.emit('current_online_users', Object.keys(onlineUsers));
        updateUserStatusInDatabase(Authuser, { online: true, lastSeen: null });
      }
    }
    const updatedMessages = await updateMessageToDeliveredGroup(Authuser);
    io.to(updatedMessages[0]?.group).emit('updateMessages', updatedMessages);
    socket.on('send_message', ({ receiverId, message }) => {
      const receiverSocket = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === receiverId
      );
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive_message', { message, senderId: userSocketMap[socket.id] });
      }
    });
    socket.on('typing', ({ receiverId }) => {
      const receiverSocket = Object.keys(userSocketMap).find(
        (key) => userSocketMap[key] === receiverId
      );
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
      if (userSocketMap[socket.id]) {
        const lastSeen = new Date().toLocaleTimeString();
        const userId = userSocketMap[socket.id];
        try {
          updateUserStatusInDatabase(userId, { online: false, lastSeen });
        }
        catch (err) {
          console.log(err);
        }
      }
      socket.broadcast.emit('user_offline', { Authuser, online: false, lastSeen: lastSeen });
      delete onlineUsers[userId];
      delete userSocketMap[socket.id];
  
    });
    socket.on('deleteStory', async (storyId) => {
      try {
        await Story.findByIdAndDelete(storyId); 
        io.emit('storyDeleted', storyId); 
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
        if (!alreadyViewed) {
          story.viewers.push({ userId, viewedAt: new Date() });
          await story.save();
          socket.broadcast.emit('updateViewers', { storyId, viewers: story.viewers });
        }
      } catch (error) {
        console.error('Error updating view count:', error);
      }
    });
    socket.on('createStory', async (storyData) => {
      try {
        const newStory = new Story(storyData);
  
        await newStory.save();
  
        // Emit the new story to all connected clients
        io.emit('storyCreated', newStory);
        socket.broadcast.emit('newStory', { message: 'New Story added', story: newStory });
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
        if (!alreadyLiked) {
          // Add the like to the story
          story.likes.push({ userId });
          await story.save();
          // Emit the updated likes to all clients
          io.emit('updateLikes', story);
        }
        else {
          // Remove the like from the story
          story.likes = story.likes.filter(like => like.userId.toString() !== userId);
          await story.save();
          // Emit the updated likes to all clients
          io.emit('updateLikes', story);
        }
      } catch (error) {
        console.error('Error liking story:', error);
      }
    });
  
  });

  export {app,server,io}