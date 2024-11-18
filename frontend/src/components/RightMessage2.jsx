import React, { useContext, useEffect, useRef, useState } from 'react'
import { SocketContext } from '../context/SocketContext'
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import toast, { Toaster } from 'react-hot-toast';
import { Button, TextField } from '@mui/material';
import Message from './Message';
import DotsMenu from './DotsMenu';
import CryptoJS from 'crypto-js';
import wallpaper from '../assets/wallpaper2.jpeg'
import PinEntry from './PinEntry';
import scrolldown from '../assets/Scroll-down.png'
import starred from '../assets/starred.png'
import MessageInfo from './MessageInfo';
import pin12 from '../assets/pin.png'
import a2 from '../assets/a2.svg'
const RightMessage2 = ({newMessage1, setNewMessage1}) => {
  const { socket, registerUser } = useContext(SocketContext);
  const { users, clickedId, setclickedId, Authuser, setAuthuser , } = useAuthContext();
  const [replyingTo, setReplyingTo] = useState(null);
  const chatContainerRef = useRef(null); // Reference for the chat container
  const [showMessageInfo, setShowMessageInfo] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const secretKey = '!@#$%^y7gH*3xs';
  const [selectedMessages, setSelectedMessages] = useState([]);
const [isSelectionMode, setIsSelectionMode] = useState(true);
  // const [isLocked, setIsLocked] = useState(Authuser.LockedChats?.some(
  //   (lock) => lock.userId === receiverId));
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchBar, setSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [userId, setUserId] = useState('');

  const [isTyping, setIsTyping] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const { userInfo, setUserInfo } = useStatusContext();
  const typingTimeout = useRef(null);
  const { userMap } = useAuthContext();
  const messageRefs = useRef([]); 
  const [searchResults, setSearchResults] = useState([]);
  const { messages2, setMessages2 } = useStatusContext();
  const {unreadCount, setUnreadCount} = useStatusContext()
  useEffect(() => {
    const count = messages2.filter((message) => message.status.state !== 'read' && message.sender!==Authuser._id).length;
    setUnreadCount(count);
  }, [messages2]);
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
    if (chatContainer){
       chatContainer.addEventListener('scroll', handleScroll);
    }  
    // Cleanup the event listener on component unmount
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
    }
        };
  }, [clickedId]);
  const scrollToBottom = () => {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };
  // useEffect(() => {
  //   const isChatLocked = Authuser?.LockedChats?.some(
  //     (lock) => lock.userId === receiverId
  //   );
  //   setIsLocked(isChatLocked);
  // }, [receiverId, Authuser]);
  const handleSelectMessage = (messageId) => {
    if (selectedMessages.includes(messageId)) {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    } else {
      setSelectedMessages([...selectedMessages, messageId]);
    }
    console.log(selectedMessages);
  };
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) setSelectedMessages([]); // Clear selection when exiting
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            // console.log(messageId)
            try {
              // const ReadReceipts=users.find(user=>user._id===Authuser._id).ReadReceipts;
              const senderId = entry.target.getAttribute('data-message-sender');
              // console.log(senderId)
              if (senderId !== Authuser._id) {
                // console.log('Reading message:', messageId);
                socket.emit('ReadMessageOneToOne', { messageId, senderId });
              }
            } catch (err) {
              console.error('Error processing message read:', err);
            }
          }
        });
      },
      { threshold: 1.0 } // The threshold can be adjusted based on when you consider a message as "read"
    );
    messageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    // Cleanup the observer on component unmount
    return () => {
      observer.disconnect(); // Disconnect the observer to avoid memory leaks
    };
  }, [messages2, socket, Authuser._id]);
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
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return <p>No results found</p>;
    }
    return searchResults?.map((result) => (
     <div className='bg-white p-1 '>
  <div key={result._id} className="w-[240px]  search-result hover:cursor-pointer bg-zinc-200" onClick={() => scrollToMessage(result._id)} >
        <p>
          <strong>Sender:</strong> {userMap[result.sender]} <br />
          <strong>Text:</strong> {highlightText(result.text, searchTerm)} <br />
          <strong></strong> {new Date(result.sentAt).toLocaleString()} <br />
        </p>
      </div>
     </div> 
    ));
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
  const searchResultsDiv = (
    <div className="search-results">
      {searchTerm &&
        renderSearchResults()}
    </div>
  );
  useEffect(() => {
    if (clickedId) {
      setMessages2([]);
      console.log('rendering ... ');
      fetch(`http://localhost:5000/message/get/${Authuser._id}/${clickedId}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages2(data);
          console.log(data);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [clickedId]);
  useEffect(() => {
    if (clickedId) {
      // console.log('rendering /// ')
      fetch(`http://localhost:5000/users/${clickedId}`)
        .then((res) => res.json()).then((data) => {
          setUserInfo(data);
        }).catch((error) => console.error("Error fetching userInfo:", error));
    }
  }, [clickedId]);
  useEffect(() => {
    setReceiverId(clickedId);
    setUserId(Authuser._id);
    if (clickedId) {
      registerUser(userId);
      console.log(clickedId, Authuser._id, " RIGHT MESSAGE 2 .JSX")
    }
  }, [clickedId, Authuser])
  function encryptMessage(message, secretKey) {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  }
  function decryptMessage(encryptedMessage, secretKey) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  const pinnedResultsDiv = (
    <div className="pinned-results border border-gray-900 w-[240px] p-2 bg-white">
      <h1 className='font-bold mb-3'>PINNED MESSAGES</h1>
      <div className='flex gap-2'>
        <img src={pin12} width={30} height={60} className='mb-3' alt="" />
      </div>
      {
        messages2?.filter((msg) => msg?.pinned?.isPinned).map((msg) => (
          <div key={msg._id} onClick={() => scrollToMessage(msg._id)} className="pinned-message bg-zinc-300 mb-4 p-2">
            <p>
              <strong>Sender:</strong> {userMap[msg.sender]} <br />
              <strong>Text:</strong> {decryptMessage(msg.text, secretKey)} <br />
              {/* <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br /> */}
            </p>
          </div>
        ))
      }
    </div>
  );
  const handleSearch = async (input) => {
    const conversationId = '671000e4fd882638d545ef7e';

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
  const starredResultsDiv = (
    <div className="starred-results w-[240px] bg-white border border-gray-800 p-2 rounded-2xl">
      <h1 className='font-bold mb-3'>STARRED MESSAGES</h1>
      <div className='flex gap-1 justify-between mb-4'>
       <img src={starred} width={20} height={20} className='m-auto' alt="" />
       <img src={starred} width={20} height={20} className='m-auto' alt="" />
       <img src={starred} width={20} height={20} className='m-auto' alt="" />
       <img src={starred} width={20} height={20} className='m-auto' alt="" />
      </div>
      {messages2
        ?.filter(msg =>
          Authuser?.starredMessages?.includes(msg._id) // Check if the message is starred and exists in starredMessages
        )
        .map(msg => (
          <div key={msg._id} onClick={() => scrollToMessage(msg._id)} className="starred-message  bg-zinc-200 p-2 mb-2 rounded">
            <p>
              <strong>Sender:</strong> {userMap[msg.sender]} <br />
              <strong>Text:</strong> {decryptMessage(msg.text, secretKey)} <br />
              {/* <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br /> */}
            </p>
          </div>
        ))
      }
    </div>
  );
  // console.log();
  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      console.log('right message received componnt:', data);
      if(data.sender===clickedId || data.sender===Authuser._id){
      setMessages2((prevMessages) => [...prevMessages, data]);
    }
    setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === data._id ? data : msg));
    // setNewMessage1(!newMessage1);  
    })
    socket.on('user_online', ({ userId, online, lastSeen }) => {
      console.log(`User ${userId} is online , status is ${lastSeen} online is ${online}`);
      setUserInfo((prevUserInfo) =>
        prevUserInfo?._id === userId
          ? { ...prevUserInfo, online, lastSeen }
          : prevUserInfo
      );
    });
    socket.on('user_offline', ({ Authuser, online, lastSeen }) => {
      console.log(`User ${Authuser} is offline, last seen: ${lastSeen} online: ${online}`);
      setUserInfo((prevUserInfo) =>
        prevUserInfo?._id === Authuser
          ? { ...prevUserInfo, online, lastSeen }
          : prevUserInfo
      );
    });
    socket.on('updateMessagesZEN', (data) => {
      // console.log(data);
      setMessages2((prevMessages) => {
        return prevMessages.map((message) => {
          // Find the matching message by ID
          const updatedMessage = data.find((newMessage) => newMessage._id === message._id);
    
          // If a match is found, return the updated message, else return the existing one
          if (updatedMessage) {
            return { ...message, ...updatedMessage }; // Merge old message with updated data
          }
          return message; // Return the original message if no match
        });
      });
    });
    
    socket.on('typing', (userId) => {
      if(userId===clickedId){
        setIsTyping(true);
      }
    });
    socket.on('stop-typing', () => {
      setIsTyping(false);
    });
    socket.on('messageDeletedForMeOnetoOne', (data) => {
      console.log(data);
      setMessages2((prevMessages) => prevMessages.filter((msg) => msg._id !== data._id));
    });
    socket.on('messageDeletedForEveryoneOnetoOne', (deletedMessage) => {
      // console.log(deletedMessage, 'message deleted for everyone onetoone');
      if (deletedMessage.deletedForEveryone) {
        setMessages2((prevMessages) => prevMessages.filter((msg, index) =>
          msg._id !== deletedMessage._id));
      }
      else {
        // setMessages2((prevMessages) =>
        //   prevMessages.map((msg) =>
        //     msg._id === deletedMessage._id ? { ...msg, text: encryptMessage('DELETED FOR EVERYONE', secretKey) } : msg
        //   )
        // );
        setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === deletedMessage._id ? deletedMessage : msg));
      }
    });
    socket.on('messageEditedOnetoOne', (data) => {
      setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === data._id ? data : msg));
    });
    socket.on('messagePinnedOnetoOne', (pinnedMessage) => {
      setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === pinnedMessage._id ? pinnedMessage : msg));
    });
    socket.on('messageReactedOneToOne', (data) => {
      console.log(data, " recieved");
      setMessages2((prevMessages) => prevMessages.map((msg) => msg._id === data._id ? data : msg));
    });
    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stop-typing');
      socket.off('messagePinnedOnetoOne')
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('messageEditedOnetoOne');
      socket.off('messageDeletedForMeOnetoOne');
      socket.off('messageReactedOneToOne');
      socket.off('messageDeletedForEveryoneOnetoOne');

    };
  }, [socket,Authuser._id]);
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const encyptmsg = encryptMessage(newMessage, secretKey);
    const messageData = {
      sender: Authuser._id,
      receiver: receiverId,
      message: encyptmsg,
      reply: replyingTo || null,
      type:"text",
    }
    socket.emit('sendMessageOneToOne', messageData);
    // setMessages2((prevMessages) => [...prevMessages, messageData]);
    setNewMessage('');
  }
  const handleTyping = () => {
    socket.emit('typing', { receiverId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { receiverId });
    }, 1000);
  };
  const customTheme = {
    fontSize: '18px', // font size
    fontWeight: 'bold', // font weight
    padding: '16px', // padding
    borderRadius: '10px', // border radius
    backgroundColor: 'blue', // background color
    color: '#fff', // text color
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
  }
  const customErrorTheme = {
    fontSize: '18px', // font size
    fontWeight: 'bold', // font weight
    padding: '16px', // padding
    borderRadius: '10px', // border radius
    backgroundColor: 'red', // background color
    color: '#fff', // text color
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
  }
  const cancelReply = () => {
    setReplyingTo(null);
  };
  return (
    <div className='flex gap-4'>
      <div>
        <Toaster />
        {/* <h2>{isLocked ? 'Chat Locked' : <div>Chat Unlocked
          <button className='ml-3' onClick={() => { setIsLocked(true) }}>LOCK</button>
        </div>}</h2> */}
        {!isLocked ? (<div>
          {userInfo && clickedId ? (
            <div className='border border-gray-300 p-2 w-[100%] mt-[-20px]  h-[80px] rounded-2xl bg-orange-400 flex gap-5 justify-between'>
              <div className='flex flex-col gap-1'>
                <p className='font-bold text-3xl'>{userInfo.username.toUpperCase()}  {isTyping && <div>is typing...</div>}</p>
                <p className='flex gap-3'>
                  {userInfo.online ? `Online` : userInfo.ShowLastSeen ? `Last seen ${userInfo.lastSeen}` : ``}
                  {/* {unreadCount} */}
                </p>
                {/* {isSelectionMode && <button onClick={()=>{toggleSelectionMode(); console.log(selectedMessages)}}>Cancel</button>}
                {!isSelectionMode && <button onClick={toggleSelectionMode}>Select</button>} */}
              </div>
              {searchBar &&
                <div className="search-bar flex flex-col">
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearch(e.target.value);
                    }}
                  />
                  <button onClick={() => { handleSearch(searchTerm) }}>Search</button>
                </div>}
              <DotsMenu receiverId={receiverId} setShowStarredMessages={setShowStarredMessages} setShowPinnedMessages={setShowPinnedMessages
              } showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} searchBar={searchBar} setSearchBar={setSearchBar}
              IsGroupInfo={false} />

            </div>
          ) : (
            // <p className='font-bold '>WELCOME TO CHAT APP, CLICK HERE ON ANY USER TO BEGIN CHATTING</p>
            ""
          )}
          <div ref={chatContainerRef}  className="p-4 flex-1 overflow-y-auto bg-white h-[480px] min-w-[740px] " style={{ backgroundImage: `url(${wallpaper})` }}>
            {!clickedId && <img src={a2} className='m-auto mt-[50px]' alt="" />  }
            {!clickedId && <div className='text-3xl text-gray-500'>CLICK TO BEGIN CHATTING</div> }
            {messages2?.length === 0 && clickedId ? (
              <div>No messages found in this conversation.
              </div>
            ) :
            clickedId &&
              messages2.map((message2, index) => (
                <Message ref={(el) => (messageRefs.current[index] = el)} 
                  dataMessageId={message2._id}
                  isSelected={selectedMessages.includes(message2._id)}
          onSelect={() => handleSelectMessage(message2._id)}
          isSelectionMode={isSelectionMode}
                  dataMessageSender={message2.sender}
                  key={message2._id} message2={message2}
                  setMessages2={setMessages2} messages2={messages2} userId={Authuser._id} replyingTo={replyingTo} setReplyingTo={setReplyingTo}
                  messageRefs={messageRefs} showMessageInfo={showMessageInfo} setShowMessageInfo={setShowMessageInfo}
                />
              ))
            }
          </div>
          <div className="p-4 border-t flex flex-col bg-white">
            {replyingTo && (
              <div className="reply-preview h-[20%] w-[100%]  bg-green-500 border border-black border-y-8 font-bold ">
                <p>Replying to: {decryptMessage(messages2.find((msg) => msg._id === replyingTo)?.text, secretKey)}</p>
                <button className='hover:cursor-pointer' onClick={cancelReply}>Cancel</button>
              </div>
            )}
            {isScrolledUp && (
             <>
            <span className='scroll-to-bottom-button1'>{unreadCount}</span> 
        <button
        className="scroll-to-bottom-button"
        onClick={scrollToBottom}
        >
        <img src={scrolldown} height={20} width={20} alt="" />
      </button>
        </> 
    )}
        {clickedId && <>
            <TextField
              label="Enter your message..."
              fullWidth
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              />
            <Button variant="contained" color="primary" onClick={handleSendMessage}>
              Send
            </Button>
            
              </>
              
            }
          </div>
        </div>
        ) :
          <PinEntry inputPin={inputPin} setInputPin={setInputPin}
            pin={pin} setPin={setPin} isLocked={isLocked} setIsLocked={setIsLocked}
            receiverId={receiverId} />
        }
      </div>

      {
        (showPinnedMessages || showStarredMessages || showMessageInfo !== null || searchTerm !== '') &&
        <MessageInfo showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} showMessageInfo={showMessageInfo} searchTerm={searchTerm}
          setShowPinnedMessages={setShowPinnedMessages} setShowStarredMessages={setShowStarredMessages} setShowMessageInfo={setShowMessageInfo} setSearchTerm={setSearchTerm}
          IsGroupInfo={false}
          searchResultsDiv={searchResultsDiv} pinnedResultsDiv={pinnedResultsDiv} starredResultsDiv={starredResultsDiv} messages2={messages2}
        />
      }
        
    </div>

  )
}

export default RightMessage2
