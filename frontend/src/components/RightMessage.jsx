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
import reply from '../assets/reply.png'
import wallpaper from '../assets/wallpaper2.jpeg'
import info from '../assets/information.png';
import CryptoJS from 'crypto-js'
import red from '../assets/red.png'
import { useStatusContext } from '../context/StatusContext';
import MessageInfo from './MessageInfo';
import DotsMenu from './DotsMenu';
import TestComp from './TestComp';
const RightMessage = () => {
  const { users, clickedId,setclickedId, Authuser } = useAuthContext();
  const [message, setMessage] = useState("");
  const [searchBar,setSearchBar]=useState(false)
  const { sendMessage, loading } = useSendMessage();
  const [receiverId, setReceiverId] = useState('');
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]); // State to store messages
  const [showDeleteOptions, setShowDeleteOptions] = useState(null); // State to track which message has delete options open
  const [showMessageInfo, setShowMessageInfo] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null); // State to track the message being edited
  const [editedText, setEditedText] = useState(''); // State to store edited text
  // const [editClick,setEditClick] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [reactionOptions,setReactionOptions]=useState(null);
  const [messageInfo, setMessageInfo] = useState({ deliveredTime: null, readTime: null });
  const {userInfo, setUserInfo} = useStatusContext();
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const chatContainerRef = useRef(null); // Reference for the chat container
  const [readStatus, setReadStatus] = useState({}); // Track read status
  const messageRefs = useRef([]); // References to message elements
  const [pinned,setPinned]=useState(false);
  const [starred, setStarred]=useState(false)
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const secretKey = '!@#$%^y7gH*3xs'; // This key should be kept secret
const [searchResults, setSearchResults] = useState([]);
  const typingTimeout = useRef(null);
  const { onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus}=useStatusContext()
  const{ socket,sendMessageSocket ,socketId,registerUser}= useContext(SocketContext);
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
  
      // If the user is not at the bottom, show the button
      if (scrollHeight - scrollTop > clientHeight + 100) {
        setIsScrolledUp(true);
      } else {
        setIsScrolledUp(false);
      }
    };
  
    const chatContainer = chatContainerRef.current;
    chatContainer.addEventListener('scroll', handleScroll);
  
    // Cleanup the event listener on component unmount
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
    };
  }, [clickedId]);
  const scrollToBottom = () => {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };
  useEffect(()=>{
    if(searchTerm===""){
      setSearchResults([]);
    }
  },[searchTerm])
  // const handleStarred=async(pinned)=>{
  //   try{
  //     const response=await fetch(`http://localhost:5000/message/starredMessages/${receiverId}/${Authuser._id}`,{
  //       method:"GET",
  //       headers:{
  //         "Content-Type":"application/json"
  //       }
  //     })
  //     if(!response.ok){
  //       throw new Error("Failed to retrieve pinned messages");
  //     }
  //     const data=await response.json();
  //     setPinnedMessages(data);
  //   }catch(error){
  //     console.error("Error retrieving pinned messages:", error);
  //   }
  // }
  const handleSearch = async (input) => {
    const conversationId='671000e4fd882638d545ef7e';

    try {
      const response = await fetch("http://localhost:5000/message/search/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       
        body: JSON.stringify({ conversationId, searchTerm: input }),
      });
      
      const data = await response.json();
      setSearchResults(data);
      // console.log(searchResults,"search results");
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  };
  const highlightText = (text, term) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={index} className="highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };
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
     }
    });
    socket.on('user_offline', ({ userId,lastSeen}) => {
      console.log(`User ${userId} is offline, last seen: ${lastSeen}`);
    });
    socket.on('typing', () => {
      // console.log('User is typing...');
      setIsTyping(true);
    });
    socket.on('stop-typing', () => {
      // console.log('User stopped typing...');
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
               
              // const res = await fetch(`http://localhost:5000/message/get-senderId-from-messageId/${messageId}`, {
              //   method: 'GET',
              //   headers: {
              //     'Content-Type': 'application/json',
              //   },
              // });
  
              // if (!res.ok) {
              //   throw new Error('Failed to retrieve senderId');
              // }
  
              // const data = await res.json();
              const senderId = entry.target.getAttribute('data-message-sender');
            //  console.log('senderId:', senderId);
              // Only update if not already marked as read and sender is not the authenticated user
              if (!readStatus[messageId] && senderId !== Authuser._id) {
                // console.log('right message received componnt:');
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
  }, [readStatus, messages]);
  
  useEffect(()=>{
    setReceiverId(clickedId);
    setUserId(Authuser._id);
    // if(userId && receiverId){
    if(userId){
    registerUser(userId);
    console.log(clickedId,Authuser._id," RIGHT MESSAGE.JSX")
  }
  },[clickedId,Authuser])
  const renderSearchResults = () => { 
    if (searchResults.length === 0) {
      return <p>No results found</p>;
    }
    return searchResults.map((result) => (
      <div key={result._id} className="search-result hover:cursor-pointer"  onClick={()=>scrollToMessage(result._id)} >
        <p>
          <strong>Sender:</strong> {result.sender} <br />
          <strong>Text:</strong> {highlightText(result.text, searchTerm)} <br />
          <strong>Sent At:</strong> {new Date(result.sentAt).toLocaleString()} <br />
          {/* <strong>Status:</strong> {result.status.state} <br /> */}
        </p>
      </div>
    ));
  };
  // console.log('he')
  const renderReply = (replyId) => {
    const originalMessage = messages.find((msg) => msg._id === replyId);
    const sender = originalMessage?.sender;
    return originalMessage ? (
      <div onClick={()=>scrollToMessage(replyId)} className="reply-content border border-black rounded-lg  border-x-green-600 border-x-8 bg-white">
        <blockquote>{sender === Authuser._id ? 'YOU':userInfo.username}:{decryptMessage(originalMessage.text,secretKey)}</blockquote>
      </div>
    ) : (
      <div className="reply-content">
        <blockquote>This message was deleted or no longer available.</blockquote>
      </div>
    );
  };
  const handleReplyClick = (messageId) => {
    setReplyingTo(replyingTo === messageId ? null : messageId);
    console.log(replyingTo, " replying to");
  };
  // Function to cancel the reply
  const cancelReply = () => {
    setReplyingTo(null);
  };
  // Function to encrypt a message
function encryptMessage(message, secretKey) {
  return CryptoJS.AES.encrypt(message, secretKey).toString();
}

// Function to decrypt a message
function decryptMessage(encryptedMessage, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
} 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;
    try {
      const encyptmsg=encryptMessage(message,secretKey);
      sendMessageSocket(receiverId, encyptmsg);  // Send message over socket
      setMessages((prev) => [...prev, { sender: Authuser._id,sentAt: new Date(), text: message}]); // Update UI with the new message
      sendMessage(encyptmsg,replyingTo);                      // Save message in the backend
      setMessage(""); // Clear the input field only after sending
      setReplyingTo(null);
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
  // Get starred messages

// console.log("pinnedMessages",pinnedMessages)
// console.log(starredMessages)
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
  function makeLinksClickable(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    // const urlRegex = /https?:\/\/(?:www\.)?[a-z0-9-]+(?:\.[a-z]{2,})+(?:\/[^\s]*)?/gi;
    
    // If there are no matches, return the original text
    if (!urlRegex.test(text)) {
      return text;
    }
  
    // Split the text by the regex pattern and wrap URLs with <a> tags
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a className='text-blue-500' key={index} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      ) : (
        part
      )
    );
  }
    
  const handleEditMessage = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditedText(currentText);

  };
  // Function to submit edited message
  const handleSubmitEdit = async (messageId) => {
    const res = await fetch(`http://localhost:5000/message/edit/${messageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({editedText: editedText}),
    });

    if (res.ok) {
      const updatedMessage = await res.json();
      // console.log(updatedMessage);
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? updatedMessage : msg))
      );
      setEditingMessageId(null);
      setEditedText('');
      toast.success(`MESSAGE EDITED`,{
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
    const toggleReactions =(messageId)=>{
      setReactionOptions(reactionOptions === messageId ? null : messageId);
    }
    const CopyMessage=(text)=>{
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard", {
        className:customTheme
      });    
    }
    const searchResultsDiv=(
      <div className="search-results">
      {searchTerm && 
      renderSearchResults()}
    </div>
    );
    const pinnedResultsDiv=(
      <div className="pinned-results border border-gray-900 p-2">
                <h1 className='font-bold mb-3'>PINNED MESSAGES</h1>

      {
        messages.filter((msg) => msg.pinned).map((msg) => (
          <div key={msg._id} onClick={()=>scrollToMessage(msg._id)} className="pinned-message bg-zinc-100">
            <p>
              <strong>Sender:</strong> {msg.sender} <br />
              <strong>Text:</strong> {decryptMessage(msg.text,secretKey)} <br />
              <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
              {/* <strong>Status:</strong> {msg.status.state} <br /> */}
            </p>
          </div>
        ))
      }
    </div>
    );
    const starredResultsDiv=(
      <div className="starred-results border border-gray-800 p-2">
        <h1 className='font-bold mb-3'>STARRED MESSAGES</h1>
      {messages.filter((msg) => msg.starred).map((msg) => (
      <div key={msg._id} onClick={()=>scrollToMessage(msg._id)} className="starred-message bg-zinc-100">
        <p>
          <strong>Sender:</strong> {msg.sender} <br />
          <strong>Text:</strong> {decryptMessage(msg.text,secretKey)} <br />
          <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
          {/* <strong>Status:</strong> {msg.status.state} <br /> */}
        </p>
      </div>
    ))}
    </div>
    );
  return (
    <div className='flex gap-2'>
    <Toaster />
      <div className='w-full p-3 m-auto h-screen border border-b mt-[-20px] rounded-xl bg-white shadow-xl
      shadow-blue-400 '  >
        {userInfo ? (
          <div   className='border border-gray-300 p-2 w-[100%] h-[80px] rounded-2xl bg-green-300 flex gap-5 justify-between'>
            <div className='flex flex-col gap-1'>
            <p className='font-bold text-3xl'>{userInfo.username.toUpperCase()}  {isTyping && <div>is typing...</div>}</p>
            <p>
               {userInfo.online?`Online`:userInfo.ShowLastSeen?`Last seen ${userInfo.lastSeen}`:``}
              </p>
            {/* {console.log(userInfo.ShowLastSeen, userInfo.lastSeen)} */}
            </div>
       { searchBar &&  
            <div className="search-bar flex flex-col">
  <input
    type="text"
    placeholder="Search messages..."
    value={searchTerm}
    onChange={(e) =>{ setSearchTerm(e.target.value); 
      handleSearch(e.target.value);
     }}
  />
  <button onClick={() => {handleSearch(searchTerm)}}>Search</button>
  {/* <p onClick={()=>setShowPinnedMessages(!showPinnedMessages)} >showPinned </p> */}
  {/* <p onClick={()=>setShowStarredMessages(!showStarredMessages) */}
  {/* // }>showStarred</p> */}
</div>}
            {/* <img src={dots} alt="" height={20} width={50} /> */}
            <DotsMenu setShowStarredMessages={setShowStarredMessages} setShowPinnedMessages={setShowPinnedMessages
            } showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} searchBar={searchBar} setSearchBar={setSearchBar}/>
          
          </div>
        ) : (
          <p className='font-bold '>WELCOME TO CHAT APP, CLICK HERE ON ANY USER TO BEGIN CHATTING</p>
        )}
        <div className='h-[85%] mt-3 w-full border border-gray-300 overflow-y-scroll' ref={chatContainerRef} >
          <div className="messages-container" style={{backgroundImage:`url(${wallpaper})`,
            backgroundSize:'cover',width:`100%`,height:'fit%',backgroundPositionY:'center',backgroundscroll:'yes'}}>
          {isScrolledUp && (
      <button
        className="scroll-to-bottom-button"
        onClick={scrollToBottom}
      >
        Scroll to Bottom
      </button>
    )}
            {messages?.map((message,index) => (
              <div 
                key={message._id} // Assuming message.id is available
                ref={(el)=>(messageRefs.current[index] = el)}
                data-message-id={message._id} data-message-sender={message.sender}
                className={`message-item ${message.sender === Authuser._id ? 'ml-[300px]' : 'mr-[600px]'} ${message.sender === Authuser._id ? 'bg-zinc-100' : 'bg-blue-200'} rounded-md mb-2 w-[60%]`}
              >
                                            {message.reply && renderReply(message.reply)}
                <div className="message-content shadow-xl rounded-md mb-3 ">
                  {/* Check if the message was deleted for everyone */}
             {  !message?.deletedFor?.includes(Authuser._id) ? (
               
             
              <div className="message-time text-gray-500 flex gap-2 justify-evenly text-sm mt-1">
                    <img className='hover:cursor-pointer' src={reply} width={30} height={20} onClick={()=>{handleReplyClick(message._id)}} alt="" />
                          {<span className='font-bold text-black'>  SENT AT:{formatDate(message.sentAt)}</span>}
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
          <img className='hover:cursor-pointer' src={info} width={30} onClick={()=>{toggleMessageInfo(message._id);
            getMessageDeliveryAndReadTime(message._id);
            scrollToMessage(message._id)
          }
          } height={10} alt="" />
                        }             </div>):""}
                  {message.deletedForEveryone && !message.deletedFor.includes(Authuser._id) ? (
                    <div className="deleted-message flex gap-5 italic text-gray-500 h-[50px]">
                      <span className='mt-3 ml-5 text-3xl'>DELETED FOR EVERYONE</span>
                      <img className='hover:cursor-pointer'  onClick={() => handleDeleteForEveryone(message._id)} src={dustbin} width={40} height={10} alt="" />
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
                              className="text-blue-500 ml-2 hover:cursor-pointer"
                              onClick={() => handleSubmitEdit(message._id)}
                            >
                              Save
                            </button>
                            <button 
                              className="text-red-500 ml-2 hover:cursor-pointer"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className='flex gap-2 justify-between'>
                             <p className='ml-5 mt-2'> {message?.sender === Authuser._id ? 'You' : userInfo?.username}: {makeLinksClickable(decryptMessage(message?.text,secretKey))}</p>
                             <div className='mt-2 mr-4'> 
                              {message.sender === Authuser._id && (
                                <img
                                  src={pencil}
                                  width={20}
                                  height={10}
                                  className='ml-2 cursor-pointer'
                                  alt="Edit"
                                  onClick={() => handleEditMessage(message._id, decryptMessage(message.text,secretKey))}
                                />
                              )}
                              </div>
                            </div>
                          

                            {/* Show delete options */}
                           <div className='flex gap-5 justify-around mt-2'> 
                            { message.starred ?
                            <img className='hover:cursor-pointer' onClick={() => updateStarredStatus(message._id)} src={star_filled} width={20} height={20}  alt="" />:
                            <img className='hover:cursor-pointer' onClick={()=> updateStarredStatus(message._id)} src={star_empty} width={20} height={20}  alt="" />}
                            {
                              message.pinned ?
                              <img className='hover:cursor-pointer'  onClick={() => updatePinnedStatus(message._id)} src={pin} width={20} height={20} alt="" />:
                              <img className='hover:cursor-pointer'  onClick={() => updatePinnedStatus(message._id)} src={unpin} width={20} height={20} alt="" />
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
                              className="delete-button text-red-500 ml-2 hover:cursor-pointer"
                              onClick={() => toggleDeleteOptions(message._id)}
                              >
                              <img src={red} height={30} width={40} alt="" />
                            </button>
                            <span>
                              <img className='hover:cursor-pointer'  src={reaction} onClick={()=>toggleReactions(message._id)} width={25} height={25} alt="" />
                            </span>
                              </div>  
                           <span className='ml-10'>{message.editedAt!=null?`Edited at ${formatDate(message.editedAt)}`:''}</span>
                           <img  src={copyIcon} width={20} height={20} onClick={()=>{CopyMessage(message.text)}} className='hover:cursor-pointer mt-[-15px]' alt="" />
                            {showDeleteOptions === message._id && (
                              <div className="delete-options mt-2 mb-5 flex flex-col bg-gray-100 p-2 border border-gray-300 rounded-lg">
                                <button
                                  className="text-blue-500 mb-2 hover:cursor-pointer"
                                  onClick={() => handleDeleteForMe(message._id)}
                                >
                                  Delete for me
                                </button>
                                {message.sender === Authuser._id && (
                                  <button
                                    className="text-red-500 hover:cursor-pointer"
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
         <button className='hover:cursor-pointer' onClick={() => AddReactions(message._id,Authuser._id,'👍')}>👍</button>
        <button className='hover:cursor-pointer'  onClick={() => AddReactions(message._id,Authuser._id,'❤️')}>❤️</button>
        <button className='hover:cursor-pointer'  onClick={() => AddReactions(message._id,Authuser._id,'😂')}>😂</button></div>)
        }
                          </>
                        )}
                        
                           
                        
                      </>
                    )
                  )}
                   
                </div>
                
              </div>
            ))
            
          }

 
          </div>
           
          <form className='h-[100px] px-4 my-3 fixed bottom-[32px] mr-[100px]' onSubmit={handleSubmit}>
     
     <div className='w-full relative'>
    {replyingTo && (
  <div className="reply-preview h-[20%] w-[100%]  bg-green-500 border border-black border-y-8 font-bold ">
    <p>Replying to: {messages.find((msg) => msg._id === replyingTo)?.text}</p>
    <button className='hover:cursor-pointer'  onClick={cancelReply}>Cancel</button>
  </div>
)} 
   <div className='flex flex-col gap-5'>
           <input
        className='border text-xl rounded-lg block w-[600px] mt-10 p-1 bg-gray-100 border-black border-r-4  text-black'
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
      <button type='submit' className='absolute end-0 bottom-2 right-2'>
        {loading ? "Sending..." : "Send"}
      </button>
        </div> 
    </div> 
  </form>
        </div>
        
      </div>
    
    {
      (showPinnedMessages || showStarredMessages || showMessageInfo!==null || searchTerm!=='') && 
      <MessageInfo showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} showMessageInfo={showMessageInfo} searchTerm={searchTerm} 
      setShowPinnedMessages={setShowPinnedMessages} setShowStarredMessages={setShowStarredMessages} setShowMessageInfo={setShowMessageInfo} setSearchTerm={setSearchTerm}
      searchResultsDiv={searchResultsDiv} pinnedResultsDiv={pinnedResultsDiv} starredResultsDiv={starredResultsDiv} messages={messages}
      />
}
{/* <TestComp/> */}
      </div>
  );
};

export default RightMessage;



//TESTING 2 BELOW 
//TESTING 2 IS DEPRECEATED AND NO LONGER SUPPORTED 