import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogContentText, FormControl, RadioGroup, FormControlLabel, DialogActions, Radio } from '@mui/material';
import { SocketContext } from '../context/SocketContext';
import GroupMessage from './GroupMessage';
import info from '../assets/information.png';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';

const RightGroup = ({ clickedGroupId, setClickedGroupId, groups, userId, lastMessage, setlastMessage }) => {
  const { socket } = useContext(SocketContext) // Replace with your backend URL
  const [currentGroupInfo, setCurrentGroupInfo] = useState(null);
  const { messages, setMessages } = useStatusContext();
  const typingTimeout = useRef(null);
  const [showModal, setShowModal] = useState(false); // State for delete modal visibility
  const messageRefs = useRef([]); // References to message elements
  const { userMap } = useAuthContext();
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
      text: newMessage,
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
  return (
    <div className='bg-white h-fit min-w-[740px] shadow-xl shadow-green-300
    rounded-lg  mr-[300px] border border-black flex flex-col'>
      {/* Group Info */}
      {currentGroupInfo ? (
        <div className="p-4 border border-blue-500 bg-yellow-200">
          <h2>{currentGroupInfo.name}</h2>
          <p>
            {currentGroupInfo.participants.map((participant, index) => (
              <span className="bg-zinc-200 p-2 " key={index}>
                {participant === userId ? `You(${userMap[participant]})` : userMap[participant]}
                {index < currentGroupInfo.participants.length - 1 ? ', ' : ''}
              </span>

            ))
            }
            <img src={info} width={20} alt="" className='float-right' onClick={openInfoModal} />
            {isTyping && <p className=' mt-2 text-green-800'>{userMap[currentTypingUser]} is typing...</p>}
          </p>
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
              messageRefs={messageRefs}
            />
          ))
        )}
      </div>
      <div className="p-4 border-t flex flex-col">
        {replyingTo && (
          <div className="reply-preview h-[20%] w-[100%]  bg-green-500 border border-black border-y-8 font-bold ">
            <p>Replying to: {messages.find((msg) => msg._id === replyingTo)?.text}</p>
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
  );
};

export default RightGroup;

