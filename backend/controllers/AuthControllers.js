import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import generateTokenAndSetCookie from "../utils/generateTokens.js";
import { auth } from "../utils/FireBase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
export const SignUp = async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
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
      profilePic: '', 
      lastSeen: '', 
      ReadReceipts: false, 
      ShowLastSeen: false,
      ShowOnline: false, 
      online: false, 
      theme: 'light', 
      chatWallpaper: 'light', 
    });
    newUser.save();
    createUserWithEmailAndPassword(auth, email, password);
    generateTokenAndSetCookie(newUser._id, res);
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
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "INVALID EMAIL OR PASSWORD !!!" });
    }
    generateTokenAndSetCookie(user._id, res);
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
export const logout = (req, res) => {
  try {
    res.cookie('jwt', '', { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" })
  } catch (error) {
    console.log("error in logout controller")
    res.status(500).json({ error: "internal server error" })
  }
}