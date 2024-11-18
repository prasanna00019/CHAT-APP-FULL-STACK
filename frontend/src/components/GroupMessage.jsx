import React, { forwardRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SocketContext } from '../context/SocketContext';
import Button from '@mui/material/Button';
import dustbin from '../assets/dustbin.png';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Radio from '@mui/material/Radio';
import ban from '../assets/ban.png'
import bluetick from '../assets/blue-double.png'
import normaltick from '../assets/normal-double.png';
import forward from '../assets/forward1.png'
import info from '../assets/information.png'
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField'; // For editing message text
import reply from '../assets/reply.png'
import reaction from '../assets/reaction (1).png'
import { IconButton, Modal} from '@mui/material';
import { useAuthContext } from '../context/AuthContext';
import { decryptMessage, encryptMessage } from '../helper_functions';
import CloseIcon from '@mui/icons-material/Close';
import useLogout from '../hooks/useLogout';
import Poll from './Poll';
import ForwardMessageGroup from './ForwardMessageGroup';
import { toast } from 'react-toastify';
const GroupMessage =forwardRef((props,ref) => {
const  { message, messages, setMessages, userId,setReplyingTo,replyingTo,messageRefs,
  setShowMessageInfo,showMessageInfo, dataMessageId,
  dataMessageSender ,groups
}=props;
const {GROUP_CHAT_SECRET_KEY}=useLogout();
  const { socket } = useContext(SocketContext);
  const {userMap}=useAuthContext();
  const [showForwardModal, setShowForwardModal] = useState(false);
  const openForwardModal = () => setShowForwardModal(true);
  const closeForwardModal=() => setShowForwardModal(false);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pinDuration, setPinDuration] = useState(''); // e.g., "24 hours", "7 days"
  const [currentMessage, setCurrentMessage] = useState(message);
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal visibility
  const [editText, setEditText] = useState(''); // State for edited message text
  const [deleteOption, setDeleteOption] = useState('forMe'); // Track selected delete option
  const [currentUser, setCurrentUser] = useState(null);
  const [openReaction, setOpenReaction] = useState(false);
  // Open and close modals handlers
  const handlePinClick = () =>setIsPinDialogOpen(true);
  const handleCloseDialog = () => setIsPinDialogOpen(false);
  const handleDurationChange = (event) => setPinDuration(event.target.value);
  const openDeleteModal = () => setShowModal(true);
  const closeDeleteModal = () => setShowModal(false);

  const [open, setOpen] = useState(false);

  const handleClickOpenImage = () => {
    setOpen(true);
  };

  const handleCloseImage = () => {
    setOpen(false);
  };
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
        <blockquote>{sender === userId ? 'YOU':userMap[sender]}:{decryptMessage(originalMessage.text,GROUP_CHAT_SECRET_KEY)}</blockquote>
      </div>
    ) : (
      <div className="reply-content">
        <blockquote>This message was deleted or no longer available.</blockquote>
      </div>
    );
  };
  const openEditModal = () => {
    setEditText(decryptMessage(currentMessage.text,GROUP_CHAT_SECRET_KEY)); // Set the current message text in the input field
    setShowEditModal(true);
  };
  const closeEditModal = () => setShowEditModal(false);
  const handleClickOpen = () => {
    setOpenReaction(true);
  };

  const handleClose = () => {
    setOpenReaction(false);
  };
  // Handle the edit action
  const handleEdit = () => {
    socket.emit('editMessageGroup', { messageId: message._id, groupId: message.group, newText: editText });
    closeEditModal(); // Close the modal after editing
  };

  // Handle the delete action
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
        const index = messages.findIndex((msg) => msg._id === message._id);
        console.log(index)
        socket.emit('deleteForMe', message._id, message.group,index);
        // setMessages(prevMessages => prevMessages.filter(msg => msg._id !== message._id));
      } else if (deleteOption === 'forEveryone') {
        socket.emit('deleteForEveryone', message._id, message.group,message.text);
      }
      setShowModal(false); // Close the modal after deletion
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  const toggleMessageInfo=(messageId)=>{
    setShowMessageInfo(showMessageInfo === messageId ? null : messageId);
  }
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
  }, [message.text,socket,message.flaggedForDeletion]);
  useEffect(()=>{
   socket.on('MarkReadGroup',(data)=>{
    console.log(data,' from group UI read');
   if(data){ 
    setMessages((prevMessages) => 
      prevMessages.map((message) => 
        message._id === data._id ? data : message
      )
    );
  }
  }) 
   socket.on('messageStarredGroup',(user)=>{
    setCurrentUser(user);
  })  
return ()=>{
  socket.off('messageStarredGroup')
  socket.off('MarkReadGroup');
}
  },[socket])
  const handleEmojiSubmit=(emoji,messageId,userId,groupId)=>{
    socket.emit('AddReactionGroup',{emoji,messageId,userId,groupId});
  }
  const emojiList = ["😊", "😂", "😍", "❤", "✨", "😇", "👏", "💛", "🥹", "😞", "🫶", "💥", "👍"];
  return (
    <>
              <img src={forward} height={20} width={20} alt="" onClick={openForwardModal}/>
              { message.deletedFor.includes(userId) && (
  <button onClick={() => {
      socket.emit('deleteMessageForMeGroupUndo', message, userId,index);
      setMessages((prevMessages) => 
        prevMessages.map((msg) => 
          msg._id === message._id 
            ? { ...msg, deletedFor: msg.deletedFor.filter(id => id !== userId) }
            : msg
        )
      );
  }}>
    Revert
  </button>
)}
      {
        !message.deletedFor.includes(userId) &&
        <div ref={ref}
        data-message-id={dataMessageId}
        data-message-sender={dataMessageSender} 
        className={`${message.sender === userId ? 'ml-[270px]' : 'mr-[200px]'} mb-3 border border-black bg-zinc-200 w-[60%]` }
        >
                                                     {currentMessage.reply && renderReply(currentMessage.reply)}
          {currentMessage.media && <img src={currentMessage.media} width={200} height={50} onClick={handleClickOpenImage}/>} 
          {/* <Poll/> */}
          <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogActions>
          <IconButton onClick={handleCloseImage} style={{ marginLeft: 'auto' }}>
            <CloseIcon />
          </IconButton>
        </DialogActions>
        <DialogContent>

          <img
            src={currentMessage.media}
            alt="Large View"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>
          <p className={`${message.flaggedForDeletion?'italic':''} ${message.flaggedForDeletion && 'text-gray-600 text-2xl'}` }
          >{currentMessage.sender===userId?"YOU ": userMap[currentMessage.sender]}:{decryptMessage(currentMessage.text,GROUP_CHAT_SECRET_KEY)}</p>
       {/* {console.log(message.status)} */}
{     !message.flaggedForDeletion &&   
   <img src={reply} width={20} alt="" onClick={()=>{handleReplyClick(message._id)}}/>
}          {/* <span>{tickIcon}</span> */}
          {!message.flaggedForDeletion &&  message.sender === userId ? (
  (() => {
    // Check if all users have read the message
    const allRead = message.status.every(status => status.state === 'read');
    
    // Check if all users have at least delivered the message
    const allDelivered = message.status.every(status => status.state === 'delivered' || status.state === 'read');

    if (allRead) {
      // Show blue double tick if everyone has read
      return <span><img src={bluetick} width={30} height={10} alt="Read by all" /></span>;
    } else if (allDelivered) {
      // Show normal double tick if everyone has delivered, but not necessarily read
      return <span><img src={normaltick} width={30} height={10} alt="Delivered to all" /></span>;
    } else {
      // Show single tick if not everyone has delivered
      return <span>✔</span>;
    }
  })()
) : null}
<div className='flex gap-3 justify-between'>
{message.flaggedForDeletion && <img src={ban} className='ml-2 ' width={30} height={20} alt="" /> }
{message.flaggedForDeletion && <img className='hover:cursor-pointer'  onClick={() =>{socket.emit('deleteForEveryone', message._id, message.group,message.text);}} src={dustbin} width={30} height={5} alt="" />
}
</div>
          { (
            <>
             { !message.flaggedForDeletion && <Button variant="contained" color="secondary" onClick={openDeleteModal}>
                DELETE
              </Button>}
             
              {!message.flaggedForDeletion &&  message.sender ===userId && <Button onClick={openEditModal} variant="contained" color="primary">
                EDIT
              </Button>}
            </>
          )}
      { !message.flaggedForDeletion && <button className='mr-3' onClick={()=>{window.navigator.clipboard.writeText(decryptMessage(currentMessage.text,GROUP_CHAT_SECRET_KEY));}}>
          COPY
        </button>}
         { !message.flaggedForDeletion && <Button onClick={handlePinClick}>
            { message.pinned.isPinned ? 'UNPIN' : 'PIN'}
           </Button>}
        {!message.flaggedForDeletion &&  <button className="ml-5" onClick={() => socket.emit('starMessageGroup', message._id,userId)}>
            {currentUser?.starredMessages?.includes(message._id) ? 'UNSTAR' : 'STAR'}
          </button>}
{     !message.flaggedForDeletion &&
     <img className='ml-2' src={reaction} width={25} alt="" onClick={handleClickOpen} style={{ cursor: 'pointer' }} />
}          {
            message?.reactions?.map(reaction => (
           <span key={reaction.userId} className='ml-5 text-2xl'>{reaction.r}</span> // Render the reaction
                ))
           }
          
           <p>{new Date(currentMessage.sentAt).toLocaleString()}</p>
           {!message.flaggedForDeletion &&
            message.sender===userId && 
          <img className='hover:cursor-pointer' src={info} width={30} onClick={()=>{toggleMessageInfo(message._id);
            scrollToMessage(message._id)
          }} alt="" />
          
                        }              
           <Dialog open={openReaction} onClose={handleClose}>
      <DialogTitle>Select an Emoji Reaction</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
          {emojiList.map((emoji) => (
            <span className='w-5'
              key={emoji}
              onClick={() => {
                // console.log(emoji,message._id,userId,'clicked')
                 handleEmojiSubmit(emoji,message._id,userId,message.group);
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
      <ForwardMessageGroup open={showForwardModal} handleClose={closeForwardModal} groups={groups} message={message}/>
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