import React, { useState, useEffect, useContext, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import './Toast.css'
import dots from '../assets/dots.png';
import dustbin from '../assets/dustbin.png';
import pencil from '../assets/pencil.png';
import copyIcon from '../assets/copy.png'
import unpin from '../assets/push-pin.png';
import pin from '../assets/pin.png';
import reaction from '../assets/reaction (1).png'
import MessageInput from './MessageInput';
import { SocketContext } from '../context/SocketContext';
import bluetick from '../assets/blue-double.png'
import normaltick from '../assets/normal-double.png'
import star_filled from '../assets/starred.png';
import star_empty from '../assets/star_empty.png';
import toast, { Toaster } from 'react-hot-toast';
import useSendMessage from '../hooks/useSendMessage';
import tickdelivered from '../assets/tick-delivered.png';
import tickread from '../assets/tick-read.png';
import info from '../assets/information.png';
import { useStatusContext } from '../context/StatusContext';
const RightMessage = () => {
  const { users, clickedId,setclickedId, Authuser } = useAuthContext();
  const [message, setMessage] = useState("");
  const { sendMessage, loading } = useSendMessage();
  const [receiverId, setReceiverId] = useState('');
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]); // State to store messages
  const [showDeleteOptions, setShowDeleteOptions] = useState(null); // State to track which message has delete options open
  const [showMessageInfo, setShowMessageInfo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null); // State to track the message being edited
  const [editedText, setEditedText] = useState(''); // State to store edited text
  const [editClick,setEditClick] = useState(false);
  const [reactionOptions,setReactionOptions]=useState(null);
  const [messageInfo, setMessageInfo] = useState({ deliveredTime: null, readTime: null });
  const {userInfo, setUserInfo} = useStatusContext();
  const [readStatus, setReadStatus] = useState({}); // Track read status
  const messageRefs = useRef([]); // References to message elements
  const [pinned,setPinned]=useState(false);
  const [starred, setStarred]=useState(false)
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);
  const { onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus}=useStatusContext()
  const{ socket,sendMessageSocket ,socketId,registerUser}= useContext(SocketContext);
  useEffect(() => {
    socket.on('receive_message', ({ message ,senderId}) => {
      console.log('right message received componnt:');
      setMessages((prev) => [...prev, { sender: senderId,sentAt: Date.now(), text: message }]);
      console.log('Message received:', message);
    });
    socket.on('user_online', ({ userId, joinedTime }) => {
      // Update the UI to show the user as online
     if(userId){
       
     
      console.log(`User ${userId} is online , joined at ${joinedTime}`);
      // updateUserOnlineStatus(userId, true);
      // updateUserStatusInDatabase(userId,{online:true,lastSeen:null});
     }
    });
    socket.on('user_offline', ({ userId,lastSeen}) => {
      // Update the UI to show the user as offline with last seen time
      console.log(`User ${userId} is offline, last seen: ${lastSeen}`);
      // updateUserOnlineStatus(userId, false, lastSeen);
      // updateUserStatusInDatabase(userId,{online:false,lastSeen});
    });
    socket.on('typing', () => {
      console.log('User is typing...');
      setIsTyping(true);
    });
    socket.on('stop-typing', () => {
      console.log('User stopped typing...');
      setIsTyping(false);
    });
    return () => {
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('user_online');
      socket.off('user_offline');
    };
  }, [socket,Authuser._id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            try {
              // Fetch the senderId from the original API endpoint
              const res = await fetch(`http://localhost:5000/message/get-senderId-from-messageId/${messageId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });
  
              if (!res.ok) {
                throw new Error('Failed to retrieve senderId');
              }
  
              const data = await res.json();
              const senderId = data.sender;
  
              // Only update if not already marked as read and sender is not the authenticated user
              if (!readStatus[messageId] && senderId !== Authuser._id) {
                // Make the API call to mark the message as read
                await fetch(`http://localhost:5000/message/Message-read/${messageId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
  
                // Update the readStatus state to reflect that the message has been marked as read
                setReadStatus((prevStatus) => ({
                  ...prevStatus,
                  [messageId]: true,
                }));
              }
            } catch (err) {
              console.error('Error processing message read:', err);
            }
          }
        });
      },
      { threshold: 1.0 } // The threshold can be adjusted based on when you consider a message as "read"
    );
  
    // Observe each message
    messageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
  
    // Cleanup the observer on component unmount
    return () => {
      observer.disconnect(); // Disconnect the observer to avoid memory leaks
    };
  }, [readStatus, messages, Authuser]);
  
  useEffect(()=>{
    setReceiverId(clickedId);
    setUserId(Authuser._id);
    // if(userId && receiverId){
    if(userId){
    registerUser(userId);
    console.log(clickedId,Authuser._id," RIGHT MESSAGE.JSX")
  }
  },[clickedId,Authuser]) 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      sendMessageSocket(receiverId, message);  // Send message over socket
      setMessages((prev) => [...prev, { sender: Authuser._id,sentAt: new Date(), text: message }]); // Update UI with the new message
      sendMessage(message);                      // Save message in the backend
      setMessage(""); // Clear the input field only after sending
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message to the user
    }
  };
  const handleTyping = () => {
    socket.emit('typing', { receiverId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { receiverId });
    }, 1000);
  };
  // Function to fetch the userInfo based on clickedId  
  useEffect(()=>{
   if(clickedId){ 
      fetch(`http://localhost:5000/users/${clickedId}`)
      .then((res) => res.json()).then((data) => {
        setUserInfo(data);
      }).catch((error) => console.error("Error fetching userInfo:", error));
    }   
  },[socket,Authuser,clickedId,userInfo,onlineStatus,updatedStatus]);

// const  userInfo = getUserInfoById(clickedId); 

  // Fetch messages between the current user and the selected user when the component mounts or clickedId changes
  useEffect(() => {
    if (clickedId) {
      fetch(`http://localhost:5000/message/get/${Authuser._id}/${clickedId}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [Authuser,socket,clickedId,messages]);
  const customTheme={
    fontSize: '18px', // font size
fontWeight: 'bold', // font weight
padding: '16px', // padding
borderRadius: '10px', // border radius
backgroundColor: 'blue', // background color
color: '#fff', // text color
boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
}
const customErrorTheme={
  fontSize: '18px', // font size
fontWeight: 'bold', // font weight
padding: '16px', // padding
borderRadius: '10px', // border radius
backgroundColor: 'red', // background color
color: '#fff', // text color
boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
}
  // Function to format timestamp
  function formatDate(isoString) {
    const date = new Date(isoString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Set to true for 12-hour format
    };
    return date.toLocaleString('en-US', options);
  }
  
  const getMessageDeliveryAndReadTime = async (messageId) => {
    try {
       const res= await fetch(`http://localhost:5000/message/get-messageDeliveryAndReadTime/${messageId}`,{
         method: 'GET',
         headers: {
           'Content-Type': 'application/json',
         },
       })
       if (!res.ok) {
        throw new Error('Failed to retrieve delivery and read time');
      }
  
      const data = await res.json();
      // const { deliveredTime, readTime } = data;
      setMessageInfo({ deliveredTime: data.deliveredTime, readTime: data.readTime });
      // console.log("deliveredTime and readTime: ", deliveredTime, readTime);
      return { deliveredTime, readTime };
     }
     catch( error) {  
      console.error("Error retrieving deliveredTime and readTime:", error.message);
     }
    }
    
  // Function to toggle delete options visibility for a message
  const toggleDeleteOptions = (messageId) => {
    setShowDeleteOptions(showDeleteOptions === messageId ? null : messageId);
  };
  const toggleMessageInfo=(messageId)=>{
    setShowMessageInfo(showMessageInfo === messageId ? null : messageId);
  }
  // Function to handle message deletion for me
  const handleDeleteForMe = async (messageId) => {
    const res = await fetch(`http://localhost:5000/message/deleteForMe/${messageId}/${Authuser._id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
      toast.success(  `MESSAGE DELETED FOR ME`,{
        style:customTheme
       });   
    } else {
      console.error("Error deleting message");
      toast.error('CANNOT DELETE MESSAGE', {
        style:customErrorTheme
      })
    }
    setShowDeleteOptions(null); // Hide options after selection
  };

  const handleDeleteForEveryone = async (messageId) => {
    // console.log("message id from func: ",messageId);
    const res = await fetch(`http://localhost:5000/message/deleteForEveryone/${messageId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, message: "DELETED FOR EVERYONE", isDeleted: true } : msg
        )
      );
      toast.success(`MESSAGE DELETED FOR EVERYONE`,{
        style:customTheme
       });   
    } else {
      // console.error("Error deleting message");
      toast.error('CANNOT DELETE MESSAGE', {
        style:customErrorTheme
      })
    }

    setShowDeleteOptions(null); // Hide options after selection
  };

  // Function to handle editing message
  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditedText(currentText);
  };
  // Function to submit edited message
  const handleSubmitEdit = async (messageId) => {
    setEditClick(true);
    const res = await fetch(`http://localhost:5000/message/edit/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({editedText}),
    });

    if (res.ok) {
      const updatedMessage = await res.json();
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? updatedMessage : msg))
      );
      setEditingMessageId(null);
      setEditedText('');
      toast.success(  `MESSAGE EDITED`,{
        style:customTheme
       });   
    } else {
      // console.error("Error editing message");
      toast.error('CANNOT EDIT MESSAGE', {
        style:customErrorTheme
      })
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedText('');
  };
  // useEffect(() => {
    const updateStarredStatus = async (id) => {
      // console.log("message with id: ",id);
    setStarred(!starred);
        const res = await fetch(`http://localhost:5000/message/starred/${id}`, {
          method: 'PUT', // Use PATCH to update a resource
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ starred }),
        });
        if (!res.ok) {
          toast.error('Failed to update starred status', {
           style:customErrorTheme
          })
        }  
        
        else{
          toast.success(`${starred ? 'MESSAGE UNSTARRED' : 'MESSAGE STARRED'}`, {
           style:customTheme,
          });    
        }
    };
    
    const updatePinnedStatus = async (id) => {
      console.log("message with id in pinned : ",id);
    setPinned(!pinned);
        const res = await fetch(`http://localhost:5000/message/pinned/${id}`, {
          method: 'PUT', // Use PATCH to update a resource
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pinned }),
        });
        if (!res.ok) {
          // console.error("Failed to update pinned status");
          console.log(res);
          toast.error('CANNOT PIN MORE THAN 3 MESSAGES', {
           style:customErrorTheme
          })
        } 
        else {
          toast.success(  `${pinned ? 'MESSAGE UNPINNED' : 'MESSAGE PINNED'}`,{
           style:customTheme
          });    
        }
    };
    const AddReactions =async(messageId,userId,r)=>{
      const res = await fetch(`http://localhost:5000/message/reaction/${messageId}/${userId}`, {
        method: 'PUT', // Use PATCH to update a resource
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ r }),
      });
      if (!res.ok) {
        toast.error('CANNOT ADD REACTION', {
         style:customErrorTheme
        })
      }
      else{
        toast.success(  `${r} REACTION ADDED`,{
          style:customTheme
         });   
      }
    }
    const formatText = (tag) => {
      const startTag = tag === 'bold' ? '**' : tag === 'italic' ? '*' : '~~';
      const endTag = startTag;
    
      if (window.getSelection) {
        const selectedText = window.getSelection().toString();
        if (selectedText) {
          const formattedText = `${startTag}${selectedText}${endTag}`;
          setMessage(message.replace(selectedText, formattedText));
        }
      }
    };
    const toggleReactions =(messageId)=>{
      setReactionOptions(reactionOptions === messageId ? null : messageId);
    }
    const CopyMessage=(text)=>{
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        className:customTheme
      });    
    }
  return (
    <>
    <Toaster />
      <div className='w-full p-3 m-auto h-screen border border-b mt-[-20px] rounded-xl bg-white shadow-xl
      shadow-blue-400 '>
        {userInfo ? (
          <div className='border border-gray-300 p-2 w-[100%] h-[80px] rounded-2xl bg-green-300 flex gap-5 justify-between'>
            <div className='flex flex-col gap-1'>
            <p className='font-bold text-3xl'>{userInfo.username.toUpperCase()}  {isTyping && <div>is typing...</div>}</p>
            <p>
               {userInfo.online?`Online`:userInfo.ShowLastSeen?`Last seen ${userInfo.lastSeen}`:``}
              </p>
            {/* {console.log(userInfo.ShowLastSeen, userInfo.lastSeen)} */}
            </div>
            <img src={dots} alt="" height={20} width={50} />
          </div>
        ) : (
          <p className='font-bold '>WELCOME TO CHAT APP, CLICK HERE ON ANY USER TO BEGIN CHATTING</p>
        )}
        <div className='h-[85%] mt-3 w-full border border-gray-300 overflow-y-scroll'>
          <div className="messages-container">
            {messages.map((message,index) => (
              <div
                key={message._id} // Assuming message.id is available
                ref={(el)=>(messageRefs.current[index] = el)}
                data-message-id={message._id}
                className={`message-item ${message.sender === Authuser._id ? 'ml-[300px]' : 'mr-[600px]'} ${message.sender === Authuser._id ? 'bg-zinc-100' : 'bg-blue-200'} rounded-md mb-2 w-[60%]`}
              >
                <div className="message-content">
                  {/* Check if the message was deleted for everyone */}
                  <div className="message-time text-gray-500 flex gap-2 justify-evenly text-sm mt-1">
                    {/* {console.log(typeof(message.sentAt)," from here")} */}
                              { `SENT AT:${formatDate(message.sentAt)}`}
                              <span className='ml-2'>
                              {message.sender === Authuser._id ? (
  message.status?.state === 'read' ? (
    <span> <img src={bluetick} width={30} height={10} alt="" /> </span> // Blue double tick
  ) : message.status?.state === 'delivered' ? (
    <span> <img src={normaltick} width={30} height={10} alt="" /> </span> // Normal double tick
  ) : message.status?.state === 'sent' ? (
    <span>✔</span> // Single tick
  ) : (
    '' // Fallback if no valid state
  )
) : null}
              </span>
              {
               message.sender===Authuser._id && 
              <img src={info} width={30} onClick={()=>{toggleMessageInfo(message._id);
                getMessageDeliveryAndReadTime(message._id);}
              } height={10} alt="" />
                           }             </div>
                  {message.deletedForEveryone && !message.deletedFor.includes(Authuser._id) ? (
                    <div className="deleted-message flex gap-5 italic text-gray-500 h-[50px]">
                      <span className='mt-3 ml-5 text-3xl'>DELETED FOR EVERYONE</span>
                      <img onClick={() => handleDeleteForEveryone(message._id)} src={dustbin} width={40} height={10} alt="" />
                    </div>
                  ) : (
                    !message.deletedFor?.includes(Authuser._id) && (
                      <>
                        {editingMessageId === message._id ? (
                          <div>
                            <input
                              type="text"
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                              className="w-full border p-1"
                            />
                            <button
                              className="text-blue-500 ml-2"
                              onClick={() => handleSubmitEdit(message._id)}
                            >
                              Save
                            </button>
                            <button
                              className="text-red-500 ml-2"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className='flex gap-2 justify-between'>
                             <p className='ml-5 mt-2'> {message.sender === Authuser._id ? 'You' : userInfo?.username}: {message.text}</p>
                             <div className='mt-2 mr-4'> 
                              {message.sender === Authuser._id && (
                                <img
                                  src={pencil}
                                  width={20}
                                  height={10}
                                  className='ml-2 cursor-pointer'
                                  alt="Edit"
                                  onClick={() => handleEditMessage(message._id, message.text)}
                                />
                              )}
                              </div>
                            </div>
                          

                            {/* Show delete options */}
                           <div className='flex gap-5 justify-around mt-2'> 
                            { message.starred ?
                            <img onClick={() => updateStarredStatus(message._id)} src={star_filled} width={20} height={20}  alt="" />:
                            <img onClick={()=> updateStarredStatus(message._id)} src={star_empty} width={20} height={20}  alt="" />}
                            {
                              message.pinned ?
                              <img onClick={() => updatePinnedStatus(message._id)} src={pin} width={20} height={20} alt="" />:
                              <img onClick={() => updatePinnedStatus(message._id)} src={unpin} width={20} height={20} alt="" />
                            }
                             {
                              message?.reactions?.map(reaction => (
                                 <span key={reaction.userId} className='ml-5 text-2xl'>{reaction.r}</span> // Render the reaction
                               ))
                              }
                            </div>
                            <div className="reaction-buttons">
                          </div>               
                         <div className='flex gap-2 mt-2 justify-center'>
                            <button
                              className="delete-button text-red-500 ml-2"
                              onClick={() => toggleDeleteOptions(message._id)}
                              >
                              Delete
                            </button>
                            <span>
                              <img src={reaction} onClick={()=>toggleReactions(message._id)} width={25} height={25} alt="" />
                            </span>
                              </div>  
                           <span className='ml-10'>{message.editedAt!=null?`Edited at ${formatDate(message.editedAt)}`:''}</span>
                           <img src={copyIcon} width={20} height={20} onClick={()=>{CopyMessage(message.text)}} className='mt-[-15px]' alt="" />
                           {
                            showMessageInfo===message._id && (
                              // getMessageDeliveryAndReadTime(message._id)
                              <div className="message-info mt-2 bg-gray-100 p-2 border border-gray-300 rounded-lg">
                              <p className="text-gray-500">Delivered Time: {messageInfo.deliveredTime || 'Not delivered'}</p>
                              <p className="text-gray-500">Read Time: {messageInfo.readTime || 'Not read'}</p>
                            </div>
                            )
                           }
                            {showDeleteOptions === message._id && (
                              <div className="delete-options mt-2 flex flex-col bg-gray-100 p-2 border border-gray-300 rounded-lg">
                                <button
                                  className="text-blue-500 mb-2"
                                  onClick={() => handleDeleteForMe(message._id)}
                                >
                                  Delete for me
                                </button>
                                {message.sender === Authuser._id && (
                                  <button
                                    className="text-red-500"
                                    onClick={() => handleDeleteForEveryone(message._id)}
                                  >
                                    Delete for everyone
                                  </button>
                                )}
                              </div>
                            )}
                            {/* Reaction buttons/icons */}
        { reactionOptions === message._id && (
       <div className="delete-options mt-2 flex  bg-gray-100 p-2 border border-gray-300 rounded-lg">   
         <button onClick={() => AddReactions(message._id,Authuser._id,'👍')}>👍</button>
        <button onClick={() => AddReactions(message._id,Authuser._id,'❤️')}>❤️</button>
        <button onClick={() => AddReactions(message._id,Authuser._id,'😂')}>😂</button></div>)
        }
                          </>
                        )}
                        
                           
                        
                      </>
                    )
                  )}
                   
                </div>
              </div>
            ))}
          </div>
          <form className='h-[100px] px-4 my-3 fixed bottom-[10px] mr-[100px]' onSubmit={handleSubmit}>
    <div className='toolbar'>
      <button type='button' onClick={() => formatText('bold')}><b>B</b></button>
      <button type='button' onClick={() => formatText('italic')}><i>I</i></button>
      <button type='button' onClick={() => formatText('strikethrough')}><s>S</s></button>
    </div>
    <div className='w-full relative'>
      <input
        className='border text-xl rounded-lg block w-[750px]  p-1 bg-gray-100 border-gray-600 text-black'
        placeholder='Send a message'
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default behavior of Enter key (submitting form)
            handleSubmit(); // Submit the form
          }
        }}
        rows={3}
      />
      <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3'>
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  </form>
        </div>
        
      </div>
    </>
  );
};

export default RightMessage;



//TESTING 2 BELOW 
//TESTING 2 IS DEPRECEATED AND NO LONGER SUPPORTED 