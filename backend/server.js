// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import http from "http";
// import { Server } from 'socket.io';
// import authRoutes from "./routes/AuthRoutes.js";
// import userRoutes from './routes/UserRoutes.js';
// import messageRoutes from './routes/MessageRoutes.js';
// import path from "path";
// import connectDB from "./DB/connectDB.js";
// import initializeFirebaseAdmin from "./utils/FirebaseAdmin.js";
// dotenv.config();
// const PORT = 5000;
// const app = express();
// let admin;
// initializeFirebaseAdmin().then((firebaseAdmin) => {
//   admin = firebaseAdmin;
//   console.log("Firebase Admin is ready.");
// }).catch((err) => {
//   console.error("Error initializing Firebase Admin:", err);
// });
// // Create HTTP server for Express and Socket.IO
// const server = http.createServer(app);

// // Initialize Socket.IO with CORS support
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173', // Adjust this to your React frontend's URL
//     methods: ['GET', 'POST']
//   }
// });
// const onlineUsers = {}; // Store online users
// export let userSocketMap = {}; // To map socket IDs to user IDs
// // Handle Socket.IO connections
// io.on('connection', (socket) => {
//   console.log('New user connected:', socket.id);
//   const userId = socket.handshake.query.userId;

//   if (userId) {
//     // Register user
//     onlineUsers[userId] = { socketId: socket.id, lastSeen: null };
//     userSocketMap[socket.id] = userId;
//      admin.firestore().collection('users').doc(userId).update({online:true});
     
//      // Notify other clients that a new user is online
//     socket.broadcast.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//     console.log(`User ${userId} registered with socket ID ${socket.id}`);
//      socket.on('register', (userId) => {
//        userSocketMap[socket.id] = userId;
//        console.log(`User ${userId} registered with socket ID ${socket.id}`);
//      })
//     // Send the current online users list to the newly connected user
//     socket.emit('current_online_users', Object.keys(onlineUsers));

//     // Also send the online status for the new user
//     socket.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//   }

//   // Handle message sending
//   socket.on('send_message', ({ receiverId, message }) => {
//     const receiverSocket = Object.keys(userSocketMap).find(
//       (key) => userSocketMap[key] === receiverId
//     );
//     if (receiverSocket) {
//       io.to(receiverSocket).emit('receive_message', { message });
//       console.log(`Message sent from ${userSocketMap[socket.id]} to ${receiverId}`);
//     }
//   });

//   socket.on('typing', ({ receiverId }) => {
//     const receiverSocket = Object.keys(userSocketMap).find(
//       (key) => userSocketMap[key] === receiverId
//     );
//     if (receiverSocket) {
//       io.to(receiverSocket).emit('typing', userSocketMap[socket.id]);
//     }
//   });

//   socket.on('stop-typing', ({ receiverId }) => {
//     const receiverSocket = Object.keys(userSocketMap).find(
//       (key) => userSocketMap[key] === receiverId
//     );
//     if (receiverSocket) {
//       io.to(receiverSocket).emit('stop-typing', userSocketMap[socket.id]);
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     if (userSocketMap[socket.id]) {
//       // const lastSeen = new Date().toISOString();
//       const lastSeen = new Date().toLocaleTimeString();
//       const userId = userSocketMap[socket.id];
//       try{
//         admin.firestore().collection('users').doc(userId).update({lastSeen:lastSeen,online:false});
//         console.log(`Updated last seen for user ${userId} to ${lastSeen} online to false`);
//       console.log("ee")
//       }
//       catch(err){
//         console.log(err);
//       }
//       // Notify other clients that the user is offline
//       socket.broadcast.emit('user_offline', { userId, lastSeen });
//       console.log('User disconnected:', socket.id);
      
//       // Remove user from onlineUsers and userSocketMap
//       delete onlineUsers[userId];
//       delete userSocketMap[socket.id];
//     }
//   });
// });

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use('/auth', authRoutes);
// app.use('/users', userRoutes);
// app.use('/message',messageRoutes);
// // Test route
// app.get('/', (req, res) => {
//   res.send("Hello, chat app CN project!");
// });

// // Listen on the PORT using the HTTP server
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// //   connectDB(); // Connect to the database
// });
// export {io}


// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import http from "http";
// import { Server } from 'socket.io';
// import authRoutes from "./routes/AuthRoutes.js";
// import userRoutes from './routes/UserRoutes.js';
// import messageRoutes from './routes/MessageRoutes.js';
// import path from "path";
// import connectDB from "./DB/connectDB.js";
// dotenv.config();
// const PORT = 5000;
// const app = express();

// // Create HTTP server for Express and Socket.IO
// const server = http.createServer(app);

// // Initialize Firebase Admin

// // Initialize Socket.IO with CORS support
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173', // Adjust this to your React frontend's URL
//     methods: ['GET', 'POST']
//   }
// });
// const onlineUsers = {}; // Store online users
// export let userSocketMap = {}; // To map socket IDs to user IDs

//  io.on('connection', (socket) => {
//     console.log('New user connected:', socket.id);
//     const userId = socket.handshake.query.userId;
  
//     if (userId) {
//       // Register user
//       onlineUsers[userId] = { socketId: socket.id, lastSeen: null };
//       userSocketMap[socket.id] = userId;
//       socket.broadcast.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//       console.log(`User ${userId} registered with socket ID ${socket.id}`);
//        socket.on('register', (userId) => {
//          userSocketMap[socket.id] = userId;
//          console.log(`User ${userId} registered with socket ID ${socket.id}`);
//        })
//       // Send the current online users list to the newly connected user
//       socket.emit('current_online_users', Object.keys(onlineUsers));
  
//       // Also send the online status for the new user
//       socket.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//     }
  
//     // Handle message sending
//     socket.on('send_message', ({ receiverId, message }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       if (receiverSocket) {
//         io.to(receiverSocket).emit('receive_message', { message });
//         console.log(`Message sent from ${userSocketMap[socket.id]} to ${receiverId}`);
//       }
//     });
  
//     socket.on('typing', ({ receiverId }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       if (receiverSocket) {
//         io.to(receiverSocket).emit('typing', userSocketMap[socket.id]);
//       }
//     });
  
//     socket.on('stop-typing', ({ receiverId }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       if (receiverSocket) {
//         io.to(receiverSocket).emit('stop-typing', userSocketMap[socket.id]);
//       }
//     });
  
//     // Handle disconnection
//     socket.on('disconnect', () => {
//       if (userSocketMap[socket.id]) {
//         const lastSeen = new Date().toLocaleTimeString();
//         const userId = userSocketMap[socket.id];
//         try{
//           console.log(`Updated last seen for user ${userId} to ${lastSeen} online to false`);
//         console.log("ee")
//         }
//         catch(err){
//           console.log(err);
//         }
//         // Notify other clients that the user is offline
//         socket.broadcast.emit('user_offline', { userId, lastSeen });
//         console.log('User disconnected:', socket.id);
        
//         // Remove user from onlineUsers and userSocketMap
//         delete onlineUsers[userId];
//         delete userSocketMap[socket.id];
//       }
//     });
//   });
// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use('/auth', authRoutes);
// app.use('/users', userRoutes);
// app.use('/message', messageRoutes);

// // Test route
// app.get('/', (req, res) => {
//   res.send("Hello, chat app CN project!");
// });

// // Listen on the PORT using the HTTP server
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   connectDB();
// });
// export { io };



// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import http from "http";
// import { Server } from 'socket.io';
// import authRoutes from "./routes/AuthRoutes.js";
// import userRoutes from './routes/UserRoutes.js';
// import messageRoutes from './routes/MessageRoutes.js';
// import path from "path";
// import connectDB from "./DB/connectDB.js";

// dotenv.config();
// const PORT = process.env.PORT || 5000; // Use environment variable for the port
// const app = express();

// // Middleware
// app.use(express.json());
// app.use(cors());

// // Routes
// app.use('/auth', authRoutes);
// app.use('/users', userRoutes);
// app.use('/message', messageRoutes);

// // Test route
// app.get('/', (req, res) => {
//   res.send("Hello, chat app CN project!");
// });

// // Create HTTP server for Express and Socket.IO
// const server = http.createServer(app);

// // Initialize Socket.IO with CORS support
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173', // Adjust this to your React frontend's URL
//     methods: ['GET', 'POST']
//   }
// });

// let onlineUsers = {}; // Store online users
// export let userSocketMap = {}; // To map socket IDs to user IDs

// // Socket.io logic
// io.on('connection', (socket) => {
//     console.log('New user connected:', socket.id);
//     const userId = socket.handshake.query.userId;
//     console.log(`User ${userId} connected with socket ID ${socket.id}`);
//     if (userId) {
//       // Register user
//       onlineUsers[userId] = { socketId: socket.id, lastSeen: null };
//       userSocketMap[socket.id] = userId;
//       socket.broadcast.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//       console.log(`User ${userId} registered with socket ID ${socket.id}`);

//       // Send the current online users list to the newly connected user
//       socket.emit('current_online_users', Object.keys(onlineUsers));
//       // Also send the online status for the new user
//       socket.emit('user_online', { userId, joinedTime: new Date().toLocaleTimeString() });
//     }
  
//     // Handle message sending
//     socket.on('send_message', ({ receiverId, message }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       // console.log(receiverSocket,"from server,js");
//       if (receiverSocket) {
//         // console.log(typeof(receiverSocket),"from server,js");
//         io.to(receiverSocket).emit('receive_message', { message,senderId:userSocketMap[socket.id] });
//         console.log(`Message sent from ${userSocketMap[socket.id]} to ${receiverId} server.js`);
//       }
//     });
  
//     socket.on('typing', ({ receiverId }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       if (receiverSocket) {
//         io.to(receiverSocket).emit('typing', userSocketMap[socket.id]);
//       }
//     });
  
//     socket.on('stop-typing', ({ receiverId }) => {
//       const receiverSocket = Object.keys(userSocketMap).find(
//         (key) => userSocketMap[key] === receiverId
//       );
//       if (receiverSocket) {
//         io.to(receiverSocket).emit('stop-typing', userSocketMap[socket.id]);
//       }
//     });
  
//     // Handle disconnection
//     socket.on('disconnect', () => {
//       if (userSocketMap[socket.id]) {
//         const lastSeen = new Date().toLocaleTimeString();
//         const userId = userSocketMap[socket.id];
//         console.log(`User ${userId} disconnected, last seen at ${lastSeen}`);
        
//         // Notify other clients that the user is offline
//         socket.broadcast.emit('user_offline', { userId, lastSeen });
        
//         // Remove user from onlineUsers and userSocketMap
//         delete onlineUsers[userId];
//         delete userSocketMap[socket.id];
//       }
//     });
// });

// // Listen on the PORT using the HTTP server
// const startServer = async () => {
//   try {
//     await connectDB(); // Connect to the database before starting the server
//     server.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to connect to the database:", error);
//   }
// };

// startServer();

// export { io }; 


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from 'socket.io';
import authRoutes from "./routes/AuthRoutes.js";
import userRoutes from './routes/UserRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import path from "path";
import connectDB from "./DB/connectDB.js";
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
 io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);
    const userId = socket.handshake.query.userId;
    const Authuser=socket.handshake.query.Authuser;
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
  });
// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/message', messageRoutes);

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