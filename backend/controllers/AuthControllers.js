import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from "../utils/generateTokens.js";
import { auth } from "../utils/FireBase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../utils/FireBase.js";
// import { auth } from "firebase-admin";

export const SignUp = async (req, res) => { 
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Validate passwords
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user object
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      profilePic: '', // Default to an empty string
      lastSeen: '', // Default to empty string
      ReadReceipts: false, // Default value
      ShowLastSeen: false, // Default value
      ShowOnline: false, // Default value
      online: false, // Default value
      theme: 'light', // Default theme
      chatWallpaper: 'light', // Default wallpaper
    });

    // Save the new user in the database
    newUser.save();

    createUserWithEmailAndPassword(auth, email, password);

    // Generate token and set cookie after user creation
    generateTokenAndSetCookie(newUser._id, res);

    // Respond with user details (excluding password)
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      profilePic: newUser.profilePic,
      lastSeen: newUser.lastSeen,
      ReadReceipts: newUser.ReadReceipts,
      ShowLastSeen: newUser.ShowLastSeen,
      password: hashedPassword,
      ShowOnline: newUser.ShowOnline,
      theme: newUser.theme,
      chatWallpaper: newUser.chatWallpaper,
    });

  } catch (error) {
    console.error("Error during sign up:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "INVALID EMAIL OR PASSWORD !!!" });
    }

    // Generate token and set cookie after successful login
    generateTokenAndSetCookie(user._id, res);

    // Respond with user details (excluding password)
    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

  // User Logout
  export const logout=(req,res)=>{
    try {
      res.cookie('jwt','',{maxAge:0});
      res.status(200).json({message:"logged out successfully"})
    } catch (error) {
      console.log("error in logout controller")
      res.status(500).json({error:"internal server error"})
    }
  }