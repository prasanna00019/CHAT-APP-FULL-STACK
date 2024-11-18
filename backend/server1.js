import express from 'express'
import dotenv from "dotenv"
dotenv.config()
import authRoutes from "./routes/AuthRoutes.js";
import userRoutes from './routes/UserRoutes.js';
import messageRoutes from './routes/MessageRoutes.js';
import StoryRoutes from './routes/StoryRoutes.js'
import GroupRoutes from './routes/GroupRoutes.js'
import cors from 'cors'
import path from "path";
import connectDB from './DB/connectDB.js';
import { app, server } from './socket/socket.js';
const PORT = 5000;
app.use(express.json());
app.use(cors());
// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/message', messageRoutes);
app.use('/story', StoryRoutes);
app.use('/group', GroupRoutes);
// Test route
app.get('/', (req, res) => {
  res.send("Hello, chat app CN project!");
});
// Listen on the PORT using the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});