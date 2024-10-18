import express from "express"
import { changeMessageStatusToDelivered, deleteMessageForEveryone, deleteMessageForMe, editMessage, getLastMessage, getMessageDeliveryAndReadTime, getMessages, getSenderIdFromMessageId, markMessageAsRead, pinMessage, ReactMessage, sendMessage, starMessage } from "../controllers/MessageControllers.js";
const router=express.Router();
router.post('/send/:fromId/:toId',sendMessage);
router.get('/get/:fromId/:toId',getMessages);
router.get('/get-messageDeliveryAndReadTime/:messageId',getMessageDeliveryAndReadTime)
router.get('/get-senderId-from-messageId/:messageId',getSenderIdFromMessageId)
router.delete('/deleteForEveryone/:messageId',deleteMessageForEveryone);
router.delete('/deleteForMe/:messageId/:userId',deleteMessageForMe);
router.put('/edit/:messageId',editMessage);    
router.put('/starred/:messageId',starMessage);
router.put('/pinned/:messageId',pinMessage);
router.put('/reaction/:messageId/:userId/',ReactMessage);
router.get('/last-message/:userId1/:userId2', getLastMessage);
router.put('/Message-delivered/:userId',changeMessageStatusToDelivered)
router.put('/Message-read/:messageId',markMessageAsRead);
export default router;

