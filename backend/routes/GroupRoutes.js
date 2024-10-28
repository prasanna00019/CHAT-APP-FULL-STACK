import express from 'express'
import { createGroup, deleteGroup, getGroupById, getGroups, getLastMessageOfAllGroups, getMessagesByGroupId } from '../controllers/GroupControllers.js';
import { changeGroupMessageStatusToDelivered, deleteMessageById, deleteMessageForMe, getMessageById, sendMessageGroup } from '../controllers/GroupMessageControllers.js';
const router = express.Router();
router.post('/create-group/',createGroup);
router.delete('/delete-group/:groupId',deleteGroup)
router.get('/get-groups/:userId',getGroups)
router.get('/get-group-byId/:groupId',getGroupById)
router.get('/messages/:groupId',getMessagesByGroupId);
router.get('/getLastMessage/',getLastMessageOfAllGroups);
router.post('/sendMessageGroup/:fromId/:groupId',sendMessageGroup);
router.put('/changeDeliveryStatus/:userId',changeGroupMessageStatusToDelivered);
router.get('/getMessageById/:messageId',getMessageById);
router.delete('/deleteMessageById/:messageId',deleteMessageById);  ///deletes for everyone
router.patch('/deleteMessageForMe/:messageId/:userId',deleteMessageForMe);
export default router;
