import React, { forwardRef, useContext, useState,useEffect } from 'react'
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import info from '../assets/information.png'
import CryptoJS from 'crypto-js';
import reaction from '../assets/reaction (1).png';
import { Dialog, DialogTitle, DialogContent} from '@mui/material';
import reply from '../assets/reply.png';
import { Button, DialogActions, DialogContentText, FormControl, FormControlLabel, IconButton, Modal, Radio, RadioGroup, TextField } from '@mui/material';
import { useAuthContext } from '../context/AuthContext';
const Message = forwardRef((props,ref) => {
  const { setMessages2, messages2 ,userId,replyingTo, setReplyingTo, message2,
  messageRefs}=props;
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editText, setEditText] = useState(''); // State for edited message text
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const { socket } = useContext(SocketContext);
  const [pinDuration, setPinDuration] = useState(''); // e.g., "24 hours", "7 days"
  const {userMap}=useAuthContext()
  const {Authuser,clickedId,setclickedId}=useAuthContext();
  const [currentMessage, setCurrentMessage] = useState(message2);
  const [deleteOption, setDeleteOption] = useState('forMe'); 
  const openDeleteModal = () => setShowModal(true);
  const [currentUser, setCurrentUser] = useState(null);
  const closeDeleteModal = () => setShowModal(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const handlePinClick = () =>setIsPinDialogOpen(true);
  const secretKey = '!@#$%^y7gH*3xs'; // This key should be kept secret
  const [openReaction, setOpenReaction] = useState(false);

  const handleClickOpen = () => {
    setOpenReaction(true);
  };

  const handleClose = () => {
    setOpenReaction(false);
  };
  const handleEmojiClick = (emoji) => {
    console.log(`Selected emoji: ${emoji}`);
    setOpenReaction(false); // Close the dialog after selecting an emoji
  };
  const handleCloseDialog = () => setIsPinDialogOpen(false);
  const handleDurationChange = (event) => setPinDuration(event.target.value);
  const handlePinMessage = async (status) => {
    if(!status){
     let expirationTime;
     const now = new Date();
    switch (pinDuration) {
       case '24 hours':
         expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
         break;
       case '7 days':
         expirationTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
         break;
       case '30 days':
         expirationTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
         break;
       default:
         return;
     }
     // Update pinned status in the database
     socket.emit('PinMessageOnetoOne', message2._id, {
       isPinned: true,
      expiration: expirationTime,
     },message2.receiver);
   }
   else{
     socket.emit('PinMessageOnetoOne', message2._id, {
       isPinned: false,
      expiration: null,
     },message2.receiver);
   }
     // Close the dialog after pinning
     setIsPinDialogOpen(false);
   };
  function decryptMessage(encryptedMessage, secretKey) {
    
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);} 
  const handleDelete = async () => {
    try {
      if (deleteOption === 'forMe') {
        socket.emit('deleteForMeOnetoOne', message2._id, message2.sender);
        setMessages2(prevMessages => prevMessages.filter(msg => msg._id !== message2._id));
      } else if (deleteOption === 'forEveryone') {
        console.log(message2.receiver," from message.jsx ... ")
        socket.emit('deleteForEveryoneOnetoOne', message2._id, message2.receiver);
      }
      setShowModal(false); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  useEffect(()=>{
    socket.on('messageStarredOneToOne',(user)=>{
     setCurrentUser(user);
   })  
 return ()=>{
   socket.off('messageStarredOneToOne')
 }
},[socket])
  const scrollToMessage = (messageId) => {
    // Find the index of the message with the given messageId
    const index = messages2.findIndex((msg) => msg._id === messageId);
    
    // If the index is found and a corresponding reference exists
    if (index !== -1 && messageRefs.current[index]) {
      messageRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
  
      // Optionally, add a visual highlight to indicate focus
      messageRefs.current[index].classList.add('highlight');
      setTimeout(() => {
        messageRefs.current[index].classList.remove('highlight');
      }, 2000); // Remove the highlight after 2 seconds
    }
  };  
  const renderReply = (replyId) => {
    const originalMessage = messages2.find((msg) => msg._id === replyId);
    const sender = originalMessage?.sender;
    return originalMessage ? (
      <div onClick={()=>scrollToMessage(replyId)} className="reply-content border border-black rounded-lg  border-x-green-600 border-x-8 bg-white">
        <blockquote>{sender === userId ? 'YOU':userMap[sender]}:{decryptMessage(originalMessage.text,secretKey)}</blockquote>
      </div>
    ) : (
      <div className="reply-content">
        <blockquote>This message was deleted or no longer available.</blockquote>
      </div>
    );
  };
  const openEditModal = () => {
    setEditText(decryptMessage(currentMessage.text,secretKey)); // Set the current message text in the input field
    setShowEditModal(true);
  };
  const closeEditModal = () => setShowEditModal(false);
  const handleEdit = () => {
    socket.emit('editMessageOneToOne', { messageId: message2._id, userId: message2.receiver, newText: editText });
    closeEditModal(); // Close the modal after editing
  };
  const handleEmojiSubmit=(emoji,messageId,userId,receiverId)=>{
     socket.emit('AddReactionOnetoOne',{emoji,messageId,userId,receiverId});
  }
  const emojiList = ["😊", "😂", "😍", "❤", "✨", "😇", "👏", "💛", "🥹", "😞", "🫶", "💥", "👍"];
  const handleReplyClick = (messageId) => {
    setReplyingTo(replyingTo === messageId ? null : messageId);
    console.log(replyingTo, " replying to");
  };
  useEffect(() => {
    const fetchMessage = async (messageId) => {
      try {
        // console.log('rendering ...')
        const response = await axios.get(`http://localhost:5000/message/getMessageById/${messageId}`);
        setCurrentMessage(response.data);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };
    if (message2) {
      fetchMessage(message2._id);
    }
  }, [message2, socket]);
  return (
    <>
      {
        !message2?.deletedFor?.includes(Authuser._id) &&
        <div ref={ref} onClick={()=>{console.log(message2._id)}} className={`${message2.sender === Authuser._id ? 'ml-[270px] bg-green-300' : 'mr-[200px] bg-cyan-200'}  mb-3 border border-gray
         rounded-lg shadow-2xl shadow-cyan-200  w-[60%]` }>
                                                     {currentMessage.reply && renderReply(currentMessage.reply)}
              {/* {console.log(typeof(currentMessage.sender), " from message.jsx ")} */}
              <img src={reply} width={20} alt="" onClick={()=>{handleReplyClick(message2._id)}}/>
              <p>{currentMessage.sender===Authuser._id?"YOU ": userMap[currentMessage.sender]}:{decryptMessage(currentMessage.text,secretKey)}</p>
          {/* <p>{currentMessage.sender===Authuser._id ? "YOU ": currentMessage.sender}:{currentMessage.text}</p> */}
          {/* <img src={reply} width={20} alt="" onClick={()=>{handleReplyClick(message2._id)}}/> */}
          {/* <span>{tickIcon}</span> */}
          { (
            <>
              <Button variant="contained" color="secondary" onClick={openDeleteModal}>
                DELETE
              </Button>
              <Button onClick={openEditModal} variant="contained" color="primary">
                EDIT
              </Button>
            
            </>
          )}
          <button className='mr-3' onClick={()=>{window.navigator.clipboard.writeText(decryptMessage(currentMessage.text,secretKey));}}>
            COPY
          </button>
           <Button onClick={handlePinClick}>
            {message2.pinned.isPinned ? 'UNPIN' : 'PIN'}
           </Button>
          <button className="ml-5" onClick={() => socket.emit('starMessageOneToOne', message2._id,userId)}>
            {currentUser?.starredMessages?.includes(message2._id) ? 'UNSTAR' : 'STAR'}
          </button>
         <div className=' flex gap-3 mt-3 justify-between'>
          <img className='ml-2' src={reaction} width={25} alt="" onClick={handleClickOpen} style={{ cursor: 'pointer' }} />
          {
            message2?.reactions?.map(reaction => (
           <span key={reaction.userId} className='ml-5 text-2xl'>{reaction.r}</span> // Render the reaction
                ))
           }
          <img className='mr-2' src={info} width={25} alt="" />
          </div> 
           <p>{new Date(currentMessage.sentAt).toLocaleString()}</p>
           <Dialog open={openReaction} onClose={handleClose}>
      <DialogTitle>Select an Emoji Reaction</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
          {emojiList.map((emoji) => (
            <span className='w-5'
              key={emoji}
              onClick={() => {
                console.log(emoji,message2._id,Authuser._id,'clcoked')
                 handleEmojiSubmit(emoji,message2._id,Authuser._id,Authuser._id===message2.receiver?message2.sender:message2.receiver);
                 handleClose()
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      </DialogContent>
    </Dialog>
          {/* Delete Modal */}
          <Dialog open={showModal} onClose={closeDeleteModal}>
            <DialogTitle>Delete message?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                You can delete this message for yourself or for everyone.
              </DialogContentText>
              <FormControl component="fieldset">
                <RadioGroup value={deleteOption} onChange={(e) => setDeleteOption(e.target.value)}>
                  <FormControlLabel value="forMe" control={<Radio />} label="Delete for me" />
                     { currentMessage.sender===userId && 
                  <FormControlLabel value="forEveryone" control={<Radio />} label="Delete for everyone" />}
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDelete} color="primary" variant="contained">
                Delete
              </Button>
              <Button onClick={closeDeleteModal} color="default">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Modal open={isPinDialogOpen} onClose={handleCloseDialog}>
        { !message2.pinned.isPinned ?
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '400px' }}>
          <h3>Choose how long your pin lasts</h3>
          <RadioGroup value={pinDuration} onChange={handleDurationChange}>
            <FormControlLabel value="24 hours" control={<Radio />} label="24 hours" />
            <FormControlLabel value="7 days" control={<Radio />} label="7 days" />
            <FormControlLabel value="30 days" control={<Radio />} label="30 days" />
          </RadioGroup>
          <Button onClick={()=>{handlePinMessage(message2.pinned.isPinned)}} color="primary">{message2.pinned.isPinned ? 'UNPIN' : 'PIN'}</Button>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
        </div>:
          <div className='flex flex-col items-center justify-center' style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '400px' }}>
          <Button onClick={()=>{handlePinMessage(message2.pinned.isPinned)}} color="primary">{message2.pinned.isPinned ? 'UNPIN' : 'PIN'}</Button>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          </div>
        }
      </Modal>
          {/* Edit Modal */}
          <Dialog open={showEditModal} onClose={closeEditModal}>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogContent>
              <TextField
                value={editText}
                onChange={(e) => {setEditText(e.target.value);console.log(e.target.value)}}
                fullWidth
                label="Edit Message"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEdit} color="primary" variant="contained">
                Save
              </Button>
              <Button onClick={closeEditModal} color="default">
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      }
    </>
  )
})


export default Message
