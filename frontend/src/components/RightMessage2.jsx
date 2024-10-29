import React, { useContext, useEffect, useRef, useState } from 'react'
import { SocketContext } from '../context/SocketContext'
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import { Toaster } from 'react-hot-toast';
import { Button, TextField } from '@mui/material';
import Message from './Message';
import DotsMenu from './DotsMenu';
import CryptoJS from 'crypto-js';
import wallpaper from '../assets/wallpaper2.jpeg'
import MessageInfo from './MessageInfo';
const RightMessage2 = () => {
    const {socket,registerUser}=useContext(SocketContext);
    const { users, clickedId,setclickedId, Authuser } = useAuthContext();
    const [replyingTo, setReplyingTo] = useState(null);
    const [showMessageInfo, setShowMessageInfo] = useState(null);
    const [receiverId, setReceiverId] = useState('');
    const secretKey = '!@#$%^y7gH*3xs';
    // const { sendMessage, loading } = useSendMessage();
    const [newMessage, setNewMessage] = useState('');
    const [searchBar,setSearchBar]=useState(false)
    const [searchTerm, setSearchTerm] = useState("");
    const [showPinnedMessages, setShowPinnedMessages] = useState(false);
    const [showStarredMessages, setShowStarredMessages] = useState(false);
    const [userId, setUserId] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const {userInfo, setUserInfo,onlineStatus, setOnlineStatus, updatedStatus} = useStatusContext();
    const typingTimeout = useRef(null);
    const {userMap}=useAuthContext();
    const messageRefs = useRef([]); // References to message elements
    const [searchResults, setSearchResults] = useState([]);
    const {messages2,setMessages2}=useStatusContext();
    const toggleMessageInfo=(messageId)=>{
      setShowMessageInfo(showMessageInfo === messageId ? null : messageId);
    }
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
        <div key={result._id} className="search-result hover:cursor-pointer"  onClick={()=>scrollToMessage(result._id)} >
          <p>
            <strong>Sender:</strong> {result.sender} <br />
            <strong>Text:</strong> {highlightText(result.text, searchTerm)} <br />
            <strong>Sent At:</strong> {new Date(result.sentAt).toLocaleString()} <br />
          </p>
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
    const searchResultsDiv=(
      <div className="search-results">
      {searchTerm && 
      renderSearchResults()}
    </div>
    );
    useEffect(() => {
        if (clickedId) {
            console.log('rendering ... ');
          fetch(`http://localhost:5000/message/get/${Authuser._id}/${clickedId}`)
            .then((res) => res.json())
            .then((data) => {
              setMessages2(data);
              // console.log(data);
            })
            .catch((error) => console.error("Error fetching messages:", error));
        }
      }, [clickedId]);
      useEffect(()=>{
        if(clickedId){ 
          console.log('rendering /// ')
           fetch(`http://localhost:5000/users/${clickedId}`)
           .then((res) => res.json()).then((data) => {
             setUserInfo(data);
           }).catch((error) => console.error("Error fetching userInfo:", error));
         }   
       },[socket,clickedId]);
      useEffect(()=>{
        setReceiverId(clickedId);
        setUserId(Authuser._id);
        if(userId){
        registerUser(userId);
        console.log(clickedId,Authuser._id," RIGHT MESSAGE 2 .JSX")
      }
      },[clickedId,Authuser])
      function encryptMessage(message, secretKey) {
        return CryptoJS.AES.encrypt(message, secretKey).toString();
      }
      function decryptMessage(encryptedMessage, secretKey) {
        const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      } 
      const pinnedResultsDiv=(
        <div className="pinned-results border border-gray-900 p-2">
                  <h1 className='font-bold mb-3'>PINNED MESSAGES</h1>

        {
          messages2?.filter((msg) => msg.pinned.isPinned).map((msg) => (
            <div key={msg._id} onClick={()=>scrollToMessage(msg._id)} className="pinned-message bg-zinc-100">
              <p>
                <strong>Sender:</strong> {msg.sender} <br />
                <strong>Text:</strong> {decryptMessage(msg.text,secretKey)} <br />
                <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
              </p>
            </div>
          ))
        }
      </div>
      );
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
      const currentUserInfo= users.find(user => user._id === clickedId);
      const starredResultsDiv = (
        <div className="starred-results border border-gray-800 p-2">
          <h1 className='font-bold mb-3'>STARRED MESSAGES</h1>
          {messages2
            ?.filter(msg => 
              msg.starred && 
              currentUserInfo?.starredMessages?.includes(msg._id) // Check if the message is starred and exists in starredMessages
            )
            .map(msg => (
              <div key={msg._id} onClick={() => scrollToMessage(msg._id)} className="starred-message bg-zinc-100 p-2 mb-2 rounded">
                <p>
                  <strong>Sender:</strong> {msg.sender} <br />
                  <strong>Text:</strong> {decryptMessage(msg.text, secretKey)} <br />
                  <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
                </p>
              </div>
            ))
          }
        </div>
      );
      // console.log();
      useEffect(() => {
         socket.on('receiveMessage',(data)=>{
           console.log('right message received componnt:',data);
           setMessages2((prevMessages) => [...prevMessages, data]);
         })
        socket.on('user_online', ({ userId, online, lastSeen }) => {
          // Update the UI to show the user as online
          console.log(`User ${userId} is online , status is ${lastSeen} online is ${online}`);
          setUserInfo((prevUserInfo) => 
            prevUserInfo?._id === userId 
                ? { ...prevUserInfo, online, lastSeen }
                : prevUserInfo // No change if userId doesn't match
        );
        });
        socket.on('user_offline', ({ Authuser,online,lastSeen}) => {
          console.log(`User ${Authuser} is offline, last seen: ${lastSeen} online: ${online}`);
          setUserInfo((prevUserInfo) => 
            prevUserInfo?._id === Authuser 
                ? { ...prevUserInfo, online, lastSeen }
                : prevUserInfo // No change if userId doesn't match
        );});
        socket.on('typing', () => {
          setIsTyping(true);
        });
        socket.on('stop-typing', () => {
          setIsTyping(false);
        });
        socket.on('messageDeletedForMeOnetoOne', (data) => {
          console.log(data);
          setMessages2((prevMessages) => prevMessages.filter((msg) => msg._id !== data._id));
        });
        socket.on('messageDeletedForEveryoneOnetoOne', (deletedMessage) => {
          console.log(deletedMessage, 'message deleted for everyone onetoone');
          if(deletedMessage.deletedForEveryone){
            setMessages2((prevMessages) => prevMessages.filter((msg,index) => 
              msg._id !== deletedMessage._id));
             }       
          else{
          setMessages2((prevMessages) =>
            prevMessages.map((msg) =>
              msg._id === deletedMessage._id ? { ...msg, text: 'DELETED FOR EVERYONE' } : msg
            )
      );
    }
    });
        socket.on('messageEditedOnetoOne',(data)=>{
          console.log(data, ' from server.js .... ')
           setMessages2(prevMessages=>
            prevMessages.map(msg=>
              msg._id===data._id ? data: msg
            )
           );
        });
        socket.on('messagePinnedOnetoOne', (pinnedMessage) => {
          setMessages2((prevMessages)=>prevMessages.map((msg) => msg._id === pinnedMessage._id ? pinnedMessage : msg)); 
        });
        socket.on('messageReactedOneToOne',(data)=>{
          console.log(data ," recieved");
          setMessages2((prevMessages)=>prevMessages.map((msg) => msg._id === data._id ? data : msg));
        });
        return () => {
          socket.off('receive_message');
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
      const handleSendMessage=()=>{
        if (newMessage.trim() === '') return;
        const encyptmsg=encryptMessage(newMessage,secretKey);
        const messageData = {
          sender: Authuser._id,
          receiver: receiverId,
          message: encyptmsg,
          reply: replyingTo || null,
        }
        socket.emit('sendMessageOneToOne', messageData);
        setNewMessage(''); 
      }
      const handleTyping = () => {
        socket.emit('typing', { receiverId });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
          socket.emit('stop-typing', { receiverId });
        }, 1000);
      };
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
    const cancelReply = () => {
      setReplyingTo(null);
    };
  return (
    <div>
        <Toaster/>
        {userInfo ? (
          <div   className='border border-gray-300 p-2 w-[100%] h-[80px] rounded-2xl bg-orange-400 flex gap-5 justify-between'>
            <div className='flex flex-col gap-1'>
            <p className='font-bold text-3xl'>{userInfo.username.toUpperCase()}  {isTyping && <div>is typing...</div>}</p>
            <p>
               {userInfo.online?`Online`:userInfo.ShowLastSeen?`Last seen ${userInfo.lastSeen}`:``}
              </p>
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
</div>}
            <DotsMenu setShowStarredMessages={setShowStarredMessages} setShowPinnedMessages={setShowPinnedMessages
            } showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} searchBar={searchBar} setSearchBar={setSearchBar}/>
          
          </div>
        ) : (
          <p className='font-bold '>WELCOME TO CHAT APP, CLICK HERE ON ANY USER TO BEGIN CHATTING</p>
        )}
        <div  className="p-4 flex-1 overflow-y-auto bg-white h-fit min-w-[740px]" style={{ maxHeight: '400px' ,backgroundImage:`url(${wallpaper})` }}>
        { messages2?.length === 0 ? (
          <div>No messages found in this conversation.
            
          </div>
        ) : (
          messages2.map((message2, index) => (
            <Message ref={(el) => (messageRefs.current[index] = el)}  onClick={() => console.log(message2._id," from rightour")} key={index} message2={message2}
             setMessages2={setMessages2} messages2={messages2} userId={Authuser._id} replyingTo={replyingTo} setReplyingTo={setReplyingTo}
             messageRefs={messageRefs} 
             />
          ))
        )}
      </div>    
        <div className="p-4 border-t flex flex-col bg-white">
     {replyingTo && (
  <div className="reply-preview h-[20%] w-[100%]  bg-green-500 border border-black border-y-8 font-bold ">
    <p>Replying to: {decryptMessage(messages2.find((msg) => msg._id === replyingTo)?.text,secretKey)}</p>
    <button className='hover:cursor-pointer'  onClick={cancelReply}>Cancel</button>
  </div>
)} 
        <TextField
            label="Enter your message..."
            fullWidth
            value={newMessage}
            onChange={(e) => {setNewMessage(e.target.value);handleTyping();}}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
            <Button  variant="contained" color="primary" onClick={handleSendMessage}>
            Send
          </Button>
          {
      (showPinnedMessages || showStarredMessages || showMessageInfo!==null || searchTerm!=='') && 
      <MessageInfo showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} showMessageInfo={showMessageInfo} searchTerm={searchTerm} 
      setShowPinnedMessages={setShowPinnedMessages} setShowStarredMessages={setShowStarredMessages} setShowMessageInfo={setShowMessageInfo} setSearchTerm={setSearchTerm}
      searchResultsDiv={searchResultsDiv} pinnedResultsDiv={pinnedResultsDiv} starredResultsDiv={starredResultsDiv} messages2={messages2}
      />
}
          </div>
    </div>
  )
}

export default RightMessage2
