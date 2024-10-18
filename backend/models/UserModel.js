import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password:{
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      default: '',  // URL to the user's profile picture
    },
    lastSeen: {
      type: String,
      default: '',
    },
    online:{
      type:Boolean,
      default:false
    },
    ReadReceipts:{
        type:Boolean,
        default:false,
    },
    ShowLastSeen:{
        type:Boolean,
        default:false,
    },
    ShowOnline:{
        type:Boolean,
        default:false
    }   ,
    theme:{
        type:String,
        default:'light'
    },
    chatWallpaper:{
        type:String,
        default:'light'
    }
  },{timestamps: true});
  
  const User = mongoose.model('User', userSchema);
  
  export default User;

  