import express from "express";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore functions
import { db } from "../utils/FireBase.js";
import { getUserInfoByID, updateLastSeen, updateOnlineStatus, updateStatus } from "../controllers/UserControllers.js";
import User from "../models/UserModel.js";
const router = express.Router();
router.get('/:userId', getUserInfoByID);
router.get('/', async (req, res) => {
    try {
        // Fetch all users from the MongoDB collection
        const users = await User.find(); // Retrieves all documents from the 'users' collection

        // Map through documents to structure the response
        const formattedUsers = users.map(user => ({
            id: user._id, // Use _id as the user ID
            ...user.toObject(), // Convert Mongoose document to plain JavaScript object
        }));

        res.json(formattedUsers); // Send the users data as response
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
router.put('/showOnline/:userId', updateOnlineStatus);
//Toggle last seen status from user Profile. 
router.put('/showLastSeen/:userId', updateLastSeen);
router.put('/updateStatus/:userId', updateStatus);
export default router;
