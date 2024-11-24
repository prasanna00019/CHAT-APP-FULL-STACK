import React, { forwardRef, useContext, useState,useEffect } from 'react'
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import info from '../assets/information.png'
import CryptoJS from 'crypto-js';
import reaction from '../assets/reaction (1).png';
import { Dialog, DialogTitle, DialogContent} from '@mui/material';
import reply from '../assets/reply.png';
import bluetick from '../assets/blue-double.png'
import ban from '../assets/ban.png'
import dustbin from '../assets/dustbin.png';
import CloseIcon from '@mui/icons-material/Close';  
import normaltick from '../assets/normal-double.png'
import forwardicon from '../assets/forward1.png'
import { Button, DialogActions, DialogContentText, FormControl, FormControlLabel, IconButton, Modal, Radio, RadioGroup, TextField } from '@mui/material';
import { useAuthContext } from '../context/AuthContext';
import ForwardMessageDialog from './ForwardMessageDialog';
import { toast } from 'react-toastify';
const Message = forwardRef((props,ref) => {
  const { setMessages2, messages2 ,userId,replyingTo, setReplyingTo, message2,
  messageRefs,setShowMessageInfo,showMessageInfo
 , dataMessageId, isSelected, onSelect, isSelectionMode,
  dataMessageSender}=props;
  const [showEditModal, setShowEditModal] = useState(false); 
  const [editText, setEditText] = useState(''); // State for edited message text
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const [showForwardModal, setShowForwardModal] = useState(false);
  const { socket } = useContext(SocketContext);
  const [pinDuration, setPinDuration] = useState(''); // e.g., "24 hours", "7 days"
  const {userMap,users}=useAuthContext()
  const {Authuser, setAuthuser,clickedId}=useAuthContext();
  const [currentMessage, setCurrentMessage] = useState(message2);
  const [deleteOption, setDeleteOption] = useState('forMe'); 
  const openDeleteModal = () => setShowModal(true);
  const openForwardModal = () => setShowForwardModal(true);
  const [currentUser, setCurrentUser] = useState(null);
  const closeDeleteModal = () => setShowModal(false);
  const closeForwardModal=() => setShowForwardModal(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const handlePinClick = () =>setIsPinDialogOpen(true);
  const secretKey = '!@#$%^y7gH*3xs'; // This key should be kept secret
  const [openReaction, setOpenReaction] = useState(false);
  const [open,setOpen]=useState(false);
  const handleClickOpenImage = () => {
    setOpen(true);
  };
  const handleCloseImage = () => {
    setOpen(false);
  };
  const ReadReceipts=users.find(user=>user._id===message2.receiver)?.ReadReceipts;   
  const ReadReciepts2=users.find(user=>user._id===message2.sender)?.ReadReceipts;
  // console.log(ReadReceipts)
  const handleClickOpen = () => {
    setOpenReaction(true);
  };

  const handleClose = () => {
    setOpenReaction(false);
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
   const handleForwardMessage = (userId) => {
    console.log("Message forwarded to:", userId);
    // Add any further logic to forward the message here
  };
  function decryptMessage(encryptedMessage, secretKey) {
    try{
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  catch{
    return encryptedMessage;
  }
} 
const showDeleteToast = (message, onUndo) => {
  toast.success(
    ({ closeToast }) => (
      <div>
        <p>{message}</p>
        <button onClick={() => { onUndo(); closeToast(); }} style={buttonStyle}>
          UNDO
        </button>
      </div>
    ),
    { autoClose: 10000, progress: undefined } // 10 seconds with progress bar
  );
};
const buttonStyle = {
  marginTop: '5px',
  padding: '5px 10px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
  const handleDelete = async () => {
    try {
      if (deleteOption === 'forMe') {
        showDeleteToast('MESSAGE DELETED FOR ME', () => {
          // Undo delete logic here
          console.log('Undo delete!');
        });
        const index = messages2.findIndex((msg) => msg._id === message2._id);
        // console.log(index," from message.jsx ... ")
        socket.emit('deleteForMeOnetoOne', message2._id,message2.sender,index);
        setMessages2(prevMessages => prevMessages.filter(msg => msg._id !== message2._id));
      } else if (deleteOption === 'forEveryone') {
        console.log(message2.receiver," from message.jsx ... ")
        socket.emit('deleteForEveryoneOnetoOne', message2._id, message2.receiver,message2.text);
      }
      setShowModal(false); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  useEffect(()=>{
    socket.on('messageStarredOneToOne',(user)=>{
    setAuthuser(user);
    // localStorage.setItem('chat-user', JSON.stringify(user));
   }) 
   socket.on('ChatLockOneToOne',(user)=>{
    // console.log('user', user,' from message.jsx line no 103');
    setAuthuser(user);
    // localStorage.setItem('chat-user', JSON.stringify(user));
   })
   socket.on('MarkReadOneToOne', (data) => {
    console.log(data, 'from here confirmed');
    setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === data._id ? data : msg));
});

 return ()=>{
   socket.off('messageStarredOneToOne')
   socket.off('MarkReadOneToOne');
   socket.off('ChatLockOneToOne');
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
  const toggleMessageInfo=(messageId)=>{
    setShowMessageInfo(showMessageInfo === messageId ? null : messageId);
  }
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
           console.log('rendering ... ',messageId, ' from message.jsx api');
        const response = await axios.get(`http://localhost:5000/message/getMessageById/${messageId}`);
        setCurrentMessage(response.data);
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };
    if (message2) {
      fetchMessage(message2._id);
    }
  }, [message2,socket]);
  return (
    <>
      {
        !message2?.deletedFor?.includes(Authuser._id) && (message2.sender === Authuser._id || message2.receiver === Authuser._id
          || message2.sender===clickedId || message2.receiver===clickedId
        ) &&
        <div ref={ref} data-message-id={dataMessageId} 
        data-message-sender={dataMessageSender} onClick={isSelectionMode ? onSelect : null} className={`${message2.sender === Authuser._id ? 'ml-[270px] bg-green-300' : 'mr-[200px] bg-cyan-200'}  message ${isSelected ? 'selected' : ''} mb-3 border border-gray
         rounded-lg shadow-2xl shadow-cyan-200  w-[60%]` } >
               {message2.type==='story' && message2.receiver===Authuser._id && <span className='italic text-gray-500'>REPLIED TO YOUR STORY</span> }   
               {message2.type==='automated'&& <span className='italic text-gray-500'>AUTOMATED MESSAGE</span>}       
              {currentMessage.reply && renderReply(currentMessage.reply)}
              {!message2.flaggedForDeletion && <img src={reply} width={20} alt="" onClick={()=>{handleReplyClick(message2._id)}}/>}
              <div className='flex gap-3 justify-between'>
{message2.flaggedForDeletion && <img src={ban} className='ml-2 ' width={30} height={20} alt="" /> }
{message2.flaggedForDeletion && <img className='hover:cursor-pointer'  onClick={() =>{socket.emit('deleteForEveryoneOnetoOne', message2._id, message2.receiver,message2.text);}} src={dustbin} width={30} height={5} alt="" />
}
</div>
              <p className={`${message2.flaggedForDeletion?'italic':''} ${message2.flaggedForDeletion && 'text-gray-600 text-2xl'}` }>
              {/* {message2.media && <img src={message2.media} width={200} height={50} onClick={handleClickOpenImage} />}  */}
              {message2.media && !message2.flaggedForDeletion && (
      <div onClick={handleClickOpenImage}>
      {currentMessage.media.includes('.pdf') ? <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>PDF</button> :
     currentMessage.media.includes('.mp4') ? <video src={currentMessage.media} width={400} controls></video> :  
     currentMessage.media.includes('.mp3') ? <audio src={currentMessage.media} controls></audio> :
     currentMessage.media.includes('png') || currentMessage.media.includes('jpg') || currentMessage.media.includes('jpeg') 
     || currentMessage.media.includes('gif') || currentMessage.media.includes('svg') || currentMessage.media.includes('webp') ? <img src={message2.media} width={200} height={50} onClick={handleClickOpenImage} />:
     ""}
    </div>
  )}

              <Dialog open={open} onClose={handleClose} maxWidth="lg">
  <DialogActions>
    <IconButton onClick={handleCloseImage} style={{ marginLeft: 'auto' }}>
      <CloseIcon />
    </IconButton>
  </DialogActions>
  <DialogContent>
    {currentMessage.media.includes('.pdf') ? (
      <iframe 
        src={currentMessage.media}
        title="PDF Viewer"
        style={{ width: '1000px', height: '500px', border: 'none' }}
      ></iframe>
    ) : (
      currentMessage.media.includes('.mp4') ? (
        <video controls>
          <source src={currentMessage.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ):
      currentMessage.media.includes('.mp3') ? (
        <audio controls>
          <source src={currentMessage.media} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
      ):
      <img
        src={currentMessage.media}
        alt="Large View"
        style={{ width: '100%', height: 'auto' }}
      />
    )}
  </DialogContent>
</Dialog>

                {currentMessage.sender===Authuser._id?"YOU ": userMap[currentMessage.sender]}:{decryptMessage(currentMessage.text,secretKey)}</p>
             {/* {console.log(users.find(user => user._id === message2.receiver))} */}
              {message2.sender === Authuser._id &&  !message2.flaggedForDeletion ? (
  message2.status.state === 'read' ? (
<span> <img src={(ReadReceipts && !ReadReciepts2) ||(ReadReciepts2 && !ReadReceipts) ||(!ReadReciepts2 && !ReadReceipts) ? normaltick:bluetick} width={30} height={10} alt="" /> </span> // Blue double tick
) : message2.status.state === 'delivered' ? (
<span> <img src={normaltick} width={30} height={10} alt="" /> </span> // Normal double tick
) : message2.status.state === 'sent' ? (
<span>✔</span> // Single tick
) : ( 
 '7'
)
) : null}
      
          { (
            <>
              {!message2.flaggedForDeletion && <Button variant="contained" color="secondary" onClick={openDeleteModal}>
              DELETE
            </Button>}
             { message2.sender ===userId && !message2.flaggedForDeletion &&
              <Button onClick={openEditModal} variant="contained" color="primary">
                EDIT
              </Button>
}
            </>
          )}
         {!message2.flaggedForDeletion && <button className='mr-3' onClick={()=>{window.navigator.clipboard.writeText(decryptMessage(currentMessage.text,secretKey));}}>
            COPY
          </button>}
          {!message2.flaggedForDeletion && <Button onClick={handlePinClick}>
            {message2.pinned.isPinned ? 'UNPIN' : 'PIN'}
           </Button>}
         {!message2.flaggedForDeletion && <button className="ml-5" onClick={() => socket.emit('starMessageOneToOne', message2._id,userId)}>
            {Authuser?.starredMessages?.includes(message2._id) ? 'UNSTAR' : 'STAR'}
          </button>}
       { !message2.flaggedForDeletion && <div className=' flex gap-3 mt-3 justify-between'>
          <img className='ml-2' src={reaction} width={25} alt="" onClick={handleClickOpen} style={{ cursor: 'pointer' }} />
          {
            message2?.reactions?.map(reaction => (
           <span key={reaction.userId} className='ml-5 text-2xl'>{reaction.r}</span> // Render the reaction
                ))
           }
             <button className='mr-3' onClick={openForwardModal}>
            <img src={forwardicon} height={20} width={20} alt="" />
          </button>
           {
            message2.sender===Authuser._id && 
          <img className='hover:cursor-pointer' src={info} width={30} onClick={()=>{toggleMessageInfo(message2._id);
            scrollToMessage(message2._id)
          }
          } height={10} alt="" />
                        }  
          </div> }
           <p>{new Date(currentMessage.sentAt).toLocaleString()}</p>
           <ForwardMessageDialog
        open={showForwardModal}
        handleClose={closeForwardModal}
        allUsers={users}
        onForward={handleForwardMessage}
        message={message2}
      />
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
                     {/* { currentMessage.sender===userId &&  */}
                     { message2.sender===userId && 
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
                onChange={(e) => {setEditText(e.target.value)}}
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
