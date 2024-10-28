import React, { forwardRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import info from '../assets/information.png'
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField'; // For editing message text
import reply from '../assets/reply.png'
import { Modal} from '@mui/material';
import { useAuthContext } from '../context/AuthContext';
const GroupMessage =forwardRef((props,ref) => {
const  { message, messages, setMessages, userId,setReplyingTo,replyingTo,messageRefs}=props;
  const { socket } = useContext(SocketContext);
  const {userMap}=useAuthContext();
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinDuration, setPinDuration] = useState(''); // e.g., "24 hours", "7 days"
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [editText, setEditText] = useState(''); // State for edited message text
  const [deleteOption, setDeleteOption] = useState('forMe'); // Track selected delete option
  const [currentUser, setCurrentUser] = useState(null);
  // Open and close modals handlers
  const handlePinClick = () =>setIsPinDialogOpen(true);
  
  const handleCloseDialog = () => setIsPinDialogOpen(false);
  const handleDurationChange = (event) => setPinDuration(event.target.value);
  const openDeleteModal = () => setShowModal(true);
  const closeDeleteModal = () => setShowModal(false);
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
    socket.emit('pinMessageGroup', message._id, {
      isPinned: true,
     expiration: expirationTime,
    },message.group);
  }
  else{
    socket.emit('pinMessageGroup', message._id, {
      isPinned: false,
     expiration: null,
    },message.group);
  }
    // Close the dialog after pinning
    setIsPinDialogOpen(false);
  };
  const handleReplyClick = (messageId) => {
    setReplyingTo(replyingTo === messageId ? null : messageId);
    console.log(replyingTo, " replying to");
  };
  const scrollToMessage = (messageId) => {
    // Find the index of the message with the given messageId
    const index = messages.findIndex((msg) => msg._id === messageId);
    
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
    const originalMessage = messages.find((msg) => msg._id === replyId);
    const sender = originalMessage?.sender;
    return originalMessage ? (
      <div onClick={()=>scrollToMessage(replyId)} className="reply-content border border-black rounded-lg  border-x-green-600 border-x-8 bg-white">
        <blockquote>{sender === userId ? 'YOU':userMap[sender]}:{originalMessage.text}</blockquote>
      </div>
    ) : (
      <div className="reply-content">
        <blockquote>This message was deleted or no longer available.</blockquote>
      </div>
    );
  };
  const openEditModal = () => {
    setEditText(currentMessage.text); // Set the current message text in the input field
    setShowEditModal(true);
  };
  const closeEditModal = () => setShowEditModal(false);

  // Handle the edit action
  const handleEdit = () => {
    socket.emit('editMessageGroup', { messageId: message._id, groupId: message.group, newText: editText });
    closeEditModal(); // Close the modal after editing
  };

  // Handle the delete action
  const handleDelete = async () => {
    try {
      if (deleteOption === 'forMe') {
        socket.emit('deleteForMe', message._id, message.group);
        setMessages(prevMessages => prevMessages.filter(msg => msg._id !== message._id));
      } else if (deleteOption === 'forEveryone') {
        socket.emit('deleteForEveryone', message._id, message.group);
      }
      setShowModal(false); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    const fetchMessage = async (messageId) => {
      try {
        const response = await axios.get(`http://localhost:5000/group/getMessageById/${messageId}`);
        setCurrentMessage(response.data);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };

    if (message) {
      fetchMessage(message._id);
    }
  }, [message, socket]);
  useEffect(()=>{
   socket.on('messageStarredGroup',(user)=>{
    setCurrentUser(user);
  })  
return ()=>{
  socket.off('messageStarredGroup')
}
  },[socket])
  const allDelivered = currentMessage?.status?.every(status => status.state === 'delivered');
  const tickIcon = allDelivered ? '✅' : '✖️';

  return (
    <>
      {
        !message.deletedFor.includes(userId) &&
        <div ref={ref} className={`${message.sender === userId ? 'ml-[270px]' : 'mr-[200px]'} mb-3 border border-black bg-zinc-200 w-[60%]` }>
                                                     {currentMessage.reply && renderReply(currentMessage.reply)}

          <p>{currentMessage.sender===userId?"YOU ": userMap[currentMessage.sender]}:{currentMessage.text}</p>
       
          <img src={reply} width={20} alt="" onClick={()=>{handleReplyClick(message._id)}}/>
          <span>{tickIcon}</span>
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
          <button className='mr-3' onClick={()=>{window.navigator.clipboard.writeText(currentMessage.text);}}>
            COPY
          </button>
           <Button onClick={handlePinClick}>
            {message.pinned.isPinned ? 'UNPIN' : 'PIN'}
           </Button>
          <button className="ml-5" onClick={() => socket.emit('starMessageGroup', message._id,userId)}>
            {currentUser?.starredMessages?.includes(message._id) ? 'UNSTAR' : 'STAR'}
          </button>
          <img src={info} width={20} alt="" />
           <p>{new Date(currentMessage.sentAt).toLocaleString()}</p>
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
        { !message.pinned.isPinned ?
        <div style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '400px' }}>
          <h3>Choose how long your pin lasts</h3>
          <RadioGroup value={pinDuration} onChange={handleDurationChange}>
            <FormControlLabel value="24 hours" control={<Radio />} label="24 hours" />
            <FormControlLabel value="7 days" control={<Radio />} label="7 days" />
            <FormControlLabel value="30 days" control={<Radio />} label="30 days" />
          </RadioGroup>
          <Button onClick={()=>{handlePinMessage(message.pinned.isPinned)}} color="primary">{message.pinned.isPinned ? 'UNPIN' : 'PIN'}</Button>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
        </div>:
          <div className='flex flex-col items-center justify-center' style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '400px' }}>
          <Button onClick={()=>{handlePinMessage(message.pinned.isPinned)}} color="primary">{message.pinned.isPinned ? 'UNPIN' : 'PIN'}</Button>
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
                onChange={(e) => setEditText(e.target.value)}
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
  );
});

export default GroupMessage;

// import React, { useState } from 'react';
// // import { updateGroupMessagePin } from './api'; // function to update pin in DB
// import { Modal ,Button,Radio,RadioGroup,FormControlLabel} from '@mui/material';
// const GroupMessage = ({ message }) => {
//   const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
//   const [pinDuration, setPinDuration] = useState(''); // e.g., "24 hours", "7 days"

//   // Open or close the dialog
//   const handlePinClick = () => setIsPinDialogOpen(true);
//   const handleCloseDialog = () => setIsPinDialogOpen(false);

//   // Set the selected pin duration
//   const handleDurationChange = (event) => setPinDuration(event.target.value);

//   // Function to handle pinning the message
//   const handlePinMessage = async () => {
//     let expirationTime;
//     const now = new Date();

//     // Calculate expiration time based on selected duration
//     switch (pinDuration) {
//       case '24 hours':
//         expirationTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
//         break;
//       case '7 days':
//         expirationTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
//         break;
//       case '30 days':
//         expirationTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
//         break;
//       default:
//         return;
//     }

//     // Update pinned status in the database
//     await updateGroupMessagePin(message._id, {
//       pinned: true,
//       expiration: expirationTime
//     });

//     // Close the dialog after pinning
//     setIsPinDialogOpen(false);
//   };

//   return (
//     <div>
//       {/* Display the message content */}
//       <p>{message.content}</p>

//       {/* Pin button */}
//       <Button onClick={handlePinClick}>Pin Message</Button>

//       {/* Pin Duration Selection Dialog */}
//       <Modal open={isPinDialogOpen} onClose={handleCloseDialog}>
//         <div style={{ padding: '20px', backgroundColor: 'white', margin: '100px auto', maxWidth: '400px' }}>
//           <h3>Choose how long your pin lasts</h3>
//           <RadioGroup value={pinDuration} onChange={handleDurationChange}>
//             <FormControlLabel value="24 hours" control={<Radio />} label="24 hours" />
//             <FormControlLabel value="7 days" control={<Radio />} label="7 days" />
//             <FormControlLabel value="30 days" control={<Radio />} label="30 days" />
//           </RadioGroup>
//           <Button onClick={handlePinMessage} color="primary">Pin</Button>
//           <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default GroupMessage;
