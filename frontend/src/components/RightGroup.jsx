import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, RadioGroup, FormControlLabel, DialogActions, Radio } from '@mui/material';
import { SocketContext } from '../context/SocketContext';
import GroupMessage from './GroupMessage';
import info from '../assets/information.png';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import wallpaper from '../assets/wallpaper2.jpeg'
import DotsMenu from './DotsMenu';
import MessageInfo from './MessageInfo';
import useLogout from '../hooks/useLogout';
import { decryptMessage, encryptMessage } from '../helper_functions';
const RightGroup = ({ clickedGroupId, setClickedGroupId, groups, userId, lastMessage, setlastMessage }) => {
  const { socket } = useContext(SocketContext) // Replace with your backend URL
  const [currentGroupInfo, setCurrentGroupInfo] = useState(null);
  const { messages, setMessages } = useStatusContext();
  const typingTimeout = useRef(null);
  const{GROUP_CHAT_SECRET_KEY}=useLogout();
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const messageRefs = useRef([]); // References to message elements
  const { userMap,Authuser } = useAuthContext();
  const [showMessageInfo, setShowMessageInfo] = useState(null);
  const [searchBar,setSearchBar]=useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  // console.log(userMap)
  const [replyingTo, setReplyingTo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentTypingUser, setCurrentTypingUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const closeInfoModal = () => setShowModal(false);
  const openInfoModal = () => setShowModal(true);
  const cancelReply = () => {
    setReplyingTo(null);
  };
  useEffect(() => {

  }, [])
  const pinnedResultsDiv=(
    <div className="pinned-results border border-gray-900 p-2">
              <h1 className='font-bold mb-3'>PINNED MESSAGES</h1>

    {
      messages?.filter((msg) => msg.pinned.isPinned).map((msg) => (
        <div key={msg._id} onClick={()=>scrollToMessage(msg._id)} className="pinned-message bg-zinc-100 mb-2">
          <p>
            <strong>Sender:</strong> {userMap[msg.sender]} <br />
            <strong>Text:</strong> {decryptMessage(msg.text, GROUP_CHAT_SECRET_KEY)} <br />
            <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
          </p>
        </div>
      ))
    }
  </div>
  );
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
  const renderSearchResults = () => { 
    if (searchResults.length === 0) {
      return <p>No results found</p>;
    }
    return searchResults?.map((result) => (
      <div key={result._id} className="search-result hover:cursor-pointer bg-zinc-200"  onClick={()=>scrollToMessage(result._id)} >
        <p>
          <strong>Sender:</strong> {userMap[result.sender]} <br />
          {console.log(result.text)}
          <strong>Text:</strong> {highlightText(result.text, searchTerm)} <br />
          <strong>Sent At:</strong> {new Date(result.sentAt).toLocaleString()} <br />
        </p>
      </div>
    ));
  };
  const searchResultsDiv=(
    <div className="search-results">
    {searchTerm && 
    renderSearchResults()}
  </div>
  );
  // Establish socket connection and join the group when clickedGroupId changes
  useEffect(() => {
    if (clickedGroupId) {
      // console.log(clickedGroupId, "clocledGroupID")
      // Join the group (room) on the server
      socket.emit('joinGroup', clickedGroupId);

      // Fetch messages when group changes
      const fetchMessages = async () => {
        setLoading(true);  // Show loading indicator while fetching messages
        try {
          const res = await axios.get(`http://localhost:5000/group/messages/${clickedGroupId}`);
          setMessages(res.data);
          // console.log(messages);
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // console.log(lastMsg) // Get the last message in the array
            setlastMessage(lastMsg);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
        setLoading(false);  // Done fetching messages
      };
      const fetchGroupInfoById = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/group/get-group-byId/${clickedGroupId}`);
          setCurrentGroupInfo(res.data);
        } catch (error) {
          console.error('Error fetching group info:', error);
        }
      };
      fetchGroupInfoById();
      fetchMessages();
    }
  }, [clickedGroupId]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // console.log(entries)
        entries.forEach(async (entry) => {
          // console.log(entry)
          if (entry.isIntersecting) {
            console.log(entry.isIntersecting);
            const messageId = entry.target.getAttribute('data-message-id');
             console.log(messageId)
            try {
              const senderId = entry.target.getAttribute('data-message-sender');
              console.log(senderId)
              if ( senderId !== Authuser._id) {
                 console.log('Reading message:', messageId);
                 socket.emit('ReadMessageGroup', {messageId,senderId,readingUserId:userId});
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
  }, [messages]);
  // Listen for new messages from the server
  useEffect(() => {
    socket.on('receiveMessage', (messageData) => {
      console.log('New message received:', messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });
    socket.on('typingGroup', (data) => {
      // console.log(data.sender,'from rightgroup.jsx typing .... ');
      setCurrentTypingUser(data.sender);
      // update UI to show that someone is typing
      setIsTyping(true);
    });

    socket.on('stopTypingGroup', (data) => {
      // console.log(data,'from rightgroup.jsx stop typing .... ');
      // update UI to show that someone has stopped typing
      setIsTyping(false);
    });
    socket.on('messageDeletedForMe', (data) => {
      console.log(data);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== data._id));
    });
    // Handling here the 'messageDeletedForEveryone' event to update the UI for all users
    socket.on('messageDeletedForEveryone', (deletedMessage) => {
      if (deletedMessage.deletedForEveryone) {
        setMessages((prevMessages) => prevMessages.filter((msg, index) =>
          msg._id !== deletedMessage._id));
      }
      else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === deletedMessage._id ? { ...msg, text: 'DELETED FOR EVERYONE' } : msg
          )
        );
      }
    });
    socket.on('messageReactedGroup', (data) => {
      setMessages((prevMessages) => prevMessages.map((msg) => msg._id === data._id ? data : msg));
    });
    socket.on('messagePinnedGroup', (pinnedMessage) => {
      setMessages((prevMessages) => prevMessages.map((msg) => msg._id === pinnedMessage._id ? pinnedMessage : msg));
    });
    socket.on('messageEditedGroup', (updatedMessage) => {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });
    socket.on('updateMessages', (updatedMessages) => {
      console.log(' form here ', updatedMessages);
      setMessages((msg, index) => updatedMessages.filter(
        (msg) => msg.groupId === updatedMessages[index]?.group)
      );
    })
    return () => {
      socket.off('updateMessages');
      socket.off('receiveMessage');
      socket.off('messagePinnedGroup');
      socket.off('messageStarredGroup');
      socket.off('messageDeletedForMe');
      socket.off('messageDeletedForEveryone');
      socket.off('typingGroup');
      socket.off('stopTypingGroup');
      socket.off('messageEditedGroup');
      socket.off('messagePinnedGroup');
    };
  }, [socket]);
  // Handle sending new message
  const starredResultsDiv = (
    <div className="starred-results border border-gray-800 p-2">
      <h1 className='font-bold mb-3'>STARRED MESSAGES</h1>
      {messages
        ?.filter(msg => 
          Authuser?.starredMessages?.includes(msg._id) // Check if the message is starred and exists in starredMessages
        )
        .map(msg => (
          <div key={msg._id} onClick={() => scrollToMessage(msg._id)} className="starred-message bg-zinc-100 p-2 mb-2 rounded">
            <p>
              <strong>Sender:</strong> {userMap[ msg.sender]} <br />
              <strong>Text:</strong> {decryptMessage(msg.text, GROUP_CHAT_SECRET_KEY)} <br />
              <strong>Sent At:</strong> {new Date(msg.sentAt).toLocaleString()} <br />
            </p>
          </div>
        ))
      }
    </div>
  );
  const handleTyping = () => {
    if (!currentGroupInfo) return;
    // Emit 'typingGroup' event when typing starts
    socket.emit('typingGroup', {
      conversationId: currentGroupInfo.conversationId,
      group: clickedGroupId,  // Send the group ID where the user is typing
      sender: userId          // Sender should be the current user ID
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTypingGroup', {
        conversationId: currentGroupInfo.conversationId,
        group: clickedGroupId,  // Same group ID
        sender: userId          // Sender should be the current user ID
      });
    }, 1000); // Stop typing after 1 second of inactivity
  };
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    console.log(currentGroupInfo)
    const messageData = {
      text: encryptMessage(newMessage, GROUP_CHAT_SECRET_KEY),
      conversationId: currentGroupInfo.conversationId,
      receivers: currentGroupInfo.participants.filter(
        (participant) => participant !== userId),
      group: clickedGroupId,
      replyTo: replyingTo || null,
      sender: userId,
    };
    // Emitting the message to the server
    socket.emit('sendMessageGroup', messageData);
    setNewMessage('');
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
 
  const handleSearch = async (input) => {
    const conversationId='671a2875ad18f8647ebc541b';

    try {
      const response = await fetch("http://localhost:5000/group/search/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId, searchTerm: input }),
      });
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching messages:", error);
    }
  };  
  return (
  //  <div className='flex gap-3 min-w-[780px]'>
    <div className='bg-white h-full min-w-[760px] shadow-xl shadow-green-300
    rounded-3xl  mr-[300px]  flex ' style={{backgroundImage: `url(${wallpaper})`}}>
      <div className='min-w-[760px]'>
      {/* Group Info */}
      {currentGroupInfo ? (
        <div className="p-4 border border-blue-500 rounded-br-3xl rounded-tr-3xl  bg-yellow-400">
          <h2>{currentGroupInfo.name}</h2>
         <div className='flex gap-3 justify-evenly mt-3'>
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
            } showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} searchBar={searchBar} setSearchBar={setSearchBar}
            IsGroupInfo={true} groupId= {currentGroupInfo._id} />
          <div>
            {currentGroupInfo.participants.map((participant, index) => (
              <span className="bg-zinc-200 p-2 " key={index}>
                {participant === userId ? `You(${userMap[participant]})` : userMap[participant]}
                {index < currentGroupInfo.participants.length - 1 ? ', ' : ''}
              </span>

               ))
              }
              { <img src={info} width={30} onClick={()=>{openInfoModal()}} alt="" /> }
            {isTyping && <p className=' mt-2 text-green-800'>{userMap[currentTypingUser]} is typing...</p>}
          </div>
</div> 
        </div>
      ) : (
        "No Group Selected"
      )}

      {/* Message Container */}
      <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
        {loading ? (
          <p>Loading messages...

          </p>
        ) : messages.length === 0 ? (
          <div>No messages found in this group.

          </div>
        ) : (
          messages.map((msg, index) => (
            <GroupMessage ref={(el) => (messageRefs.current[index] = el)} onClick={() => console.log(msg._id, " from rightour")} key={index} message={msg}
            setMessages={setMessages} messages={messages} userId={userId} replyingTo={replyingTo} setReplyingTo={setReplyingTo}
            messageRefs={messageRefs} setShowMessageInfo={setShowMessageInfo} showMessageInfo={showMessageInfo}
            dataMessageId={msg._id}  
            dataMessageSender={msg.group}
            />
          ))
        )}
      </div>
      <div className="p-4 border-t flex flex-col mt-10">
        {replyingTo && (
          <div className="reply-preview h-[20%] w-[100%]  bg-green-500 border border-black border-y-8 font-bold ">
            <p>Replying to: {decryptMessage(messages.find((msg) => msg._id === replyingTo)?.text,GROUP_CHAT_SECRET_KEY)}</p>
            <button className='hover:cursor-pointer' onClick={cancelReply}>Cancel</button>
          </div>
        )}
        <TextField 
          label="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          />
        <Button onClick={handleSendMessage} variant="contained" color="primary">
          Send
        </Button>
        <Dialog open={showModal} onClose={closeInfoModal}>
          <DialogTitle>GROUP INFO</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {currentGroupInfo ? currentGroupInfo.name : "No Group Selected"}
            </DialogContentText>
            {currentGroupInfo?.description ? `Description: ${currentGroupInfo.description}` :
              <>
                NO DESCRIPTION
                <button className='hover:cursor-pointer bg-green-500 ml-2'>ADD + </button>
              </>
            }
            {
              <div>
                <button className='mr-2'>ADD MEMBERS</button>
                {new Date(currentGroupInfo?.createdAt).toLocaleDateString()}
                {/* {console.log(currentGroupInfo)} */}
              </div>
            }
          </DialogContent>
          <div>
            {currentGroupInfo?.participants?.map((participant, index) => (
              <li className="bg-zinc-200 p-2 flex flex-col gap-3 " key={index}>
                <p className='flex gap-2'>
                  {participant === userId ? `You(${userMap[participant]})` : userMap[participant]}
                  {currentGroupInfo.admins.includes(participant) ? <><span className='text-green-800'>Admin</span></> : <><span className='text-red-800'>Member</span></>}
                </p>
              </li>

            ))
            }
          </div>
          <DialogActions>
            <Button className='hover:cursor-pointer bg-red-500' variant="contained">
              LEAVE GROUP
            </Button>
            <Button onClick={closeInfoModal} color="default">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      </div>
      {
        (showPinnedMessages || showStarredMessages || showMessageInfo!==null || searchTerm!=='') && 
        <MessageInfo showPinnedMessages={showPinnedMessages} showStarredMessages={showStarredMessages} showMessageInfo={showMessageInfo} searchTerm={searchTerm} 
        setShowPinnedMessages={setShowPinnedMessages} setShowStarredMessages={setShowStarredMessages} setShowMessageInfo={setShowMessageInfo} setSearchTerm={setSearchTerm}
        IsGroupInfo={true} 
        searchResultsDiv={searchResultsDiv} pinnedResultsDiv={pinnedResultsDiv} starredResultsDiv={starredResultsDiv} messages2={messages}
        />
      }
    </div>
      // </div> 
  );
};

export default RightGroup;

