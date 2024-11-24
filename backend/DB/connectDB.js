import mongoose from "mongoose";
import Message from "../models/MessageModel.js";
import Conversation from "../models/ConversationModel.js";
import Group from "../models/GroupModel.js";
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to mongo DB");
    } catch (error) {
        console.log("error conencting")
    }
}
export default connectDB;

// const result = await GroupMessage.updateMany(
//     {}, // Match all documents
//     { $set: { flaggedForDeletion: false } } // Add the new field
//   );

//   console.log(`Updated ${result.nModified} documents`);