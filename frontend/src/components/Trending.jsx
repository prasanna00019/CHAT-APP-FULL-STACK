import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../context/AuthContext';
import { decryptMessage } from '../helper_functions';
import useLogout from '../hooks/useLogout';
import { useStatusContext } from '../context/StatusContext';
import TrendingMessages from './TrendingMessages';

const Trending = ({ clickedGroupId, setClickedGroupId }) => {
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [groupMessages, setGroupMessages] = useState({});
  const { Authuser } = useAuthContext();
  const { messages, setMessages } = useStatusContext();
  const { GROUP_CHAT_SECRET_KEY } = useLogout();
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [messagesWithHashtag, setMessagesWithHashtag] = useState([]);

  const showMessagesWithHashtag2 = (hashtag) => {
    const filteredMessages = Object.entries(groupMessages)  // Convert object to an array of [groupId, messages]
      .map(([groupId, messages]) => ({
        groupId,
        messages: messages.filter((msg) => msg.message.includes(hashtag)),  // Filter messages by hashtag
      }))
      .filter(({ messages }) => messages.length > 0);  // Remove groups with no matching messages

    setSelectedHashtag(hashtag);
    setMessagesWithHashtag(filteredMessages);
  };

  const handleClose = () => {
    setSelectedHashtag(null);
    setMessagesWithHashtag([]);
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/group/trending-messages/${Authuser._id}`);
        // Process each group in response.data
        const decryptedGroupMessages = response.data.reduce((acc, groupObj) => {
          const [groupId, messages] = Object.entries(groupObj)[0]; // Extract groupId and messages
          const decryptedMessages = messages.map((msg) => ({
            messageId: msg.messageId,
            message: decryptMessage(msg.message, GROUP_CHAT_SECRET_KEY), // Decrypt message text
            sender: msg.sender,
            reactions: msg.reactions,
          }));
          acc[groupId] = decryptedMessages;
          return acc;
        }, {});

        setGroupMessages(decryptedGroupMessages);

        // Flatten decrypted messages for trending analysis
        const allMessages = Object.values(decryptedGroupMessages).flat();
        setTrendingHashtags(getTrendingHashtags(allMessages));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [Authuser._id, messages]);

  // Calculate trending hashtags
  const getTrendingHashtags = (messages) => {
    const hashtagCounts = {};
    messages.forEach((msg) => {
      const hashtags = msg.message.match(/#\w+/g) || [];
      hashtags.forEach((tag) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  };
  return (
    <div >
      <h2 className='font-bold text-2xl mt-3 bg-black text-white'>#TRENDING</h2>
      <ul>
        {trendingHashtags.map(([hashtag, count]) => (
          <li key={hashtag} className='bg-black text-white'>
            <button onClick={() => showMessagesWithHashtag2(hashtag)}>
              <div className='flex flex-col'>
                <span className=''>{hashtag.toUpperCase()}</span>
                <span className='text-gray-400'>
                  {count} messages
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {selectedHashtag && (
        <TrendingMessages messagesWithHashtag={messagesWithHashtag} onClose={handleClose}
          selectedHashtag={selectedHashtag} clickedGroupId={clickedGroupId} setClickedGroupId={setClickedGroupId}
        />
      )}
    </div>
  );
};

export default Trending;
