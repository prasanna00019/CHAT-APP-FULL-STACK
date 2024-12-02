import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import CloseIcon from '@mui/icons-material/Close';

const TrendingMessages = ({ selectedHashtag, messagesWithHashtag, onClose, clickedGroupId, setClickedGroupId }) => {
  const { userMap } = useAuthContext();
  const { GroupMap, setGroupMap } = useAuthContext();
  const { messages, setMessages } = useStatusContext();
  const { messageRefs } = useAuthContext();

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
  //   const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const handleMessageClick = async (groupId, msg) => {
    setClickedGroupId(groupId); // Set the clicked group first
    // await sleep(2000); // Wait for 200ms (0.2 seconds) 
    scrollToMessage(msg.messageId); // Scroll after the delay
  };
  return (

    <div className='bg-black border border-black overflow-y-auto ml-[270px] w-full h-fit mt-[-600px] '>
      <h3 className='text-white text-3xl'>Trending in your Groups</h3>
      <p className='text-white' onClick={onClose}>&times;</p>
      <ul>
        {messagesWithHashtag.map(({ groupId, messages }) => (
          <li key={groupId}>
            <ul>
              {messages.map((msg, index) => (
                <li key={index} className='bg-gray-900  p-1 mb-2'>
                  <button onClick={() => { handleMessageClick(groupId, msg) }}>
                    <div className='flex gap-1 flex-col'>
                      <span className='text-gray-500'>{GroupMap[groupId]} </span>
                      <span className='text-white'> {userMap[msg.sender]}:{msg.message} </span>   {/* Display the decrypted message */}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button className='text-white' onClick={onClose}>Close</button>
    </div>
  );
}

export default TrendingMessages;
