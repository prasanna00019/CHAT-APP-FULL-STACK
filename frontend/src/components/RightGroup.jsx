import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, RadioGroup, FormControlLabel, DialogActions, Radio, ListItem, ListItemIcon, Checkbox, ListItemText } from '@mui/material';
import { SocketContext } from '../context/SocketContext';
import GroupMessage from './GroupMessage';
import info from '../assets/information.png';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import wallpaper from '../assets/wallpaper2.jpeg'
import DotsMenu from './DotsMenu';
import MessageInfo from './MessageInfo';
import useLogout from '../hooks/useLogout';
import scrolldown from '../assets/Scroll-down.png'
import { decryptMessage, encryptMessage } from '../helper_functions';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ScheduleSend from './ScheduleSend';
import toast from 'react-hot-toast';
// import AutocompleteInput from './AutocompleteInput';
const RightGroup = ({ clickedGroupId, groups, userId, setlastMessage }) => {
  const { socket } = useContext(SocketContext) // Replace with your backend URL
  const storage = getStorage();
  const [isScrolledUp, setIsScrolledUp] = useState(false);
const [open, setopen] = useState(false);
  const [currentGroupInfo, setCurrentGroupInfo] = useState(null);
  const { messages, setMessages } = useStatusContext();
  const typingTimeout = useRef(null);
  const [image, setImage] = useState(null);
  const{GROUP_CHAT_SECRET_KEY}=useLogout();
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  // const messageRefs = useRef([]); // References to message elements
  const {messageRefs,users}=useAuthContext();
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const { userMap,Authuser } = useAuthContext();
  const [showMessageInfo, setShowMessageInfo] = useState(null);
  const [searchBar,setSearchBar]=useState(false)
  const [searchTerm, setSearchTerm] = useState("");
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const chatContainerRef = useRef(null); // Reference for the chat container
  const [replyingTo, setReplyingTo] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentTypingUser, setCurrentTypingUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const closeInfoModal = () => setShowModal(false);
  const openInfoModal = () => setShowModal(true);
  const [delay,setDelay]=useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const handleClickOpen = () => {
    setopen(true);
  }
  const handleClose = () => {
    setopen(false)
  };
  useEffect(() => {
    const count = messages.filter((message) => {
      const userStatus = message.status.find(
        (status) => status.userId === Authuser._id
      );
      return userStatus && userStatus.state !== 'read' && message.sender !== Authuser._id;
    }).length;
    setUnreadCount(count);
  }, [messages, Authuser._id]);
  const handleToggleParticipant = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
    console.log(selectedParticipants);
  };
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
  }, [clickedGroupId]);
  const scrollToBottom = () => {
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };
  const cancelReply = () => {
    setReplyingTo(null);
  };
  useEffect(() => {

  }, [])
  const pinnedResultsDiv=(
    <div className="pinned-results border border-gray-800 p-2">
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
 
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
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
  const handle1=async(data,index)=>{
    // console.log(index);
    socket.emit('deleteMessageForMeGroupUndo', data, userId,index);
  }
  const handle2=async(data,text)=>{
    socket.emit('DMEgroupUndo', data, userId,text);
  }
  // Listen for new messages from the server
  useEffect(() => {
    socket.on('receiveMessage', (messageData) => {
      // console.log('New message received:', messageData);
     if(clickedGroupId===messageData.group){ 
      setMessages((prevMessages) => [...prevMessages, messageData]);
     }
     setMessages((prevMessages) => prevMessages.map((msg) => msg._id === messageData._id ? messageData : msg));
    });
    socket.on('groupUpdated', (updatedGroup) => {
      console.log(updatedGroup);
      setCurrentGroupInfo(updatedGroup);
    })
    socket.on('typingGroup', (data) => {
      // console.log(data.sender,'from rightgroup.jsx typing .... ');
    // if(data.group===clickedGroupId){
      setCurrentTypingUser(data.sender);
      // update UI to show that someone is typing
      setIsTyping(true);
    // }
    });
    socket.on('stopTypingGroup', (data) => {
      // if(data.group===clickedGroupId){
      setCurrentTypingUser(null);
      setIsTyping(false);
    // }
    });
    socket.on('DMEGroupUpdated',(updatedMessage)=>{
      console.log(updatedMessage);
      setMessages((prevMessages) => prevMessages.map((msg) => msg._id === updatedMessage._id ? updatedMessage : msg));
    })
    socket.on('messageUpdatedUndo', (updatedMessage,index) => {
      // setMessages((prevMessages) => [...prevMessages, updatedMessage])
      console.log(index);
      setMessages((prevMessages) => {
        const updated = [...prevMessages];
        updated.splice(index, 0, updatedMessage); // Insert at the correct index
        return updated;
      });
    });
    socket.on('messageDeletedForMe', (data,index) => {
      // console.log(data);
      setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== data._id));
      toast.success(
        <div>
          <p>DELETED FOR ME</p>
          <button 
            onClick={() => {     handle1(data,index);       }}  
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            UNDO
          </button>
        </div>,
        {
          duration: 5000, // Optional: auto close after 5 seconds
        }
      );

    });
    // Handling here the 'messageDeletedForEveryone' event to update the UI for all users
    socket.on('messageDeletedForEveryone', (deletedMessage,text) => {
      if (deletedMessage.deletedForEveryone) {
        setMessages((prevMessages) => prevMessages.filter((msg, index) =>
          msg._id !== deletedMessage._id));
      }
      else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === deletedMessage._id ? { ...msg, text: 'DELETED FOR EVERYONE' ,flaggedForDeletion: true} : msg
          )
        );
        toast.success(
          <div>
            <p>DELETED FOR EVERYONE</p>
            <button 
              onClick={() => { handle2(deletedMessage,text) }}  
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              UNDO
            </button>
          </div>,
          {
            duration: 5000, // Optional: auto close after 5 seconds
          }
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
    if (newMessage.trim() === '' && !image)
      { 
      return 
      }
  var url='';
  if (image) {
    const imageRef = ref(storage, `GroupImages/${image.name}`);
    await uploadBytes(imageRef, image);
    url = await getDownloadURL(imageRef);
    console.log(url);
    
  }
    // console.log(currentGroupInfo)
    const messageData = {
      text: encryptMessage(newMessage, GROUP_CHAT_SECRET_KEY),
      conversationId: currentGroupInfo.conversationId,
      receivers: currentGroupInfo.participants.filter(
        (participant) => participant !== userId),
      group: clickedGroupId,
      replyTo: replyingTo || null,
      sender: userId,
      media:url ||"",
    };
    // Emitting the message to the server
    socket.emit('sendMessageGroup', messageData, delay);
    setNewMessage('');
    setImage(null);
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
    rounded-3xl  mr-[300px] ml-44  flex ' style={{backgroundImage: `url(${wallpaper})`}}>
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
      <div ref={chatContainerRef}  className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
        { loading  ? (
          <p>Loading messages...

          </p>
        ) : messages.length === 0 && clickedGroupId ? (
          <div>No messages found in this group.

          </div>
        ) : (
          messages.map((msg, index) => (
            <GroupMessage ref={(el) => (messageRefs.current[index] = el)} onClick={() => console.log(msg._id, " from rightour")} key={index} message={msg}
            setMessages={setMessages} messages={messages} userId={userId} replyingTo={replyingTo} setReplyingTo={setReplyingTo}
            messageRefs={messageRefs} setShowMessageInfo={setShowMessageInfo} showMessageInfo={showMessageInfo}
            dataMessageId={msg._id}  
            dataMessageSender={msg.group}
            groups={groups}
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
       {clickedGroupId ? (
  <>
    {currentGroupInfo?.participants?.includes(userId) ? ( 
      // Replace `authUserId` with the variable that holds the current authenticated user's ID
      <>
        <input type="file" onChange={handleImageChange} />
        <TextField
          label="Type your message..."
          fullWidth
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} variant="contained" color="primary">
          Send
        </Button>
        <ScheduleSend setDelay={setDelay} />
      </>
    ) : (
      <p>You are not a participant of this group.You cant send messages any longer. </p>
    )}
  </>
) : (
  "CLICK ON ANY GROUP TO START CHATTING"
)}

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
{          <button className='mr-2' onClick={handleClickOpen}>ADD MEMBERS</button>
}                {new Date(currentGroupInfo?.createdAt).toLocaleDateString()}
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
                    {participant!==userId && <button onClick={()=>{socket.emit('removeMembers',{groupId:currentGroupInfo._id,participants:participant,conversationId:currentGroupInfo.conversationId})}}>remove</button> }
                  {!currentGroupInfo.admins.includes(participant) && <button onClick={()=>{socket.emit('makeAdmin',{groupId:currentGroupInfo._id,participants:[participant]})}}>make admin</button> }
                 {participant!==userId &&  currentGroupInfo.admins.includes(participant) && <button onClick={()=>{socket.emit('removeAdmin',{groupId:currentGroupInfo._id,participants:participant});console.log(participant)}}>remove admin</button> }
                </p>
              </li>

            ))
            }
          </div>
          <DialogActions>
            <Button onClick={()=>{socket.emit('removeMembers',{groupId:currentGroupInfo._id,participants:userId,conversationId:currentGroupInfo.conversationId});closeInfoModal()}}  className='hover:cursor-pointer bg-red-500' variant="contained">
              LEAVE GROUP
            </Button>
            <Button onClick={closeInfoModal} color="default">
              Cancel
            </Button>
            {currentGroupInfo?.admins?.includes(userId) && <Button disabled onClick={()=>{socket.emit('deleteGroup',currentGroupInfo._id);closeInfoModal()}}>
             DELETE GROUP
            </Button>}
          </DialogActions>
        </Dialog> 

        <Dialog open={open} onClose={handleClose}>
          
            <h4>Select Participants:</h4>
            {
            //  console.log(allUsers.filter((user) => user._id !== userId))
            users.filter((user) => user._id !== userId && !currentGroupInfo?.participants?.includes(user._id)).map(user => (
              <ListItem key={user._id} button onClick={() => handleToggleParticipant(user._id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedParticipants.includes(user.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={user.username || user.email} />
              </ListItem>
            ))}
          <DialogActions>
            <Button onClick={()=>{socket.emit('addMembers', { groupId: clickedGroupId, participants: selectedParticipants,conversationId:currentGroupInfo.conversationId });handleClose()}} color="secondary">ADD MEMBER(S)</Button>
            {/* <Button onClick={handleCreateGroup} color="primary">Create Group</Button> */}
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

