// StatusContext.js
import React, { createContext, useState, useContext } from 'react';

// Create the StatusContext
const StatusContext = createContext();

// Custom hook to use the StatusContext
export const useStatusContext = () => useContext(StatusContext);

// Provider component
export const StatusProvider = ({ children }) => {
  const [onlineStatus, setOnlineStatus] = useState({});
  const [updatedStatus, setUpdatedStatus] = useState({});
  const [ clickedUserId, setClickedUserId ] = useState(null); // Updated to handle clickedUserId
  const [clickedStoryId,setClickedStoryId]=useState('')
  const [messages, setMessages]=useState([]); // GROUP MESSAGES
  const [messages2,setMessages2]=useState([]); //ONE-TO-ONE MESSAGES // /
  const [userInfo, setUserInfo] = useState(null);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0); // State for unread count in One To One Messages

  return (
    <StatusContext.Provider value={{ onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus ,userInfo, setUserInfo
      ,clickedStoryId,setClickedStoryId ,clickedUserId,setClickedUserId ,messages, setMessages,messages2,setMessages2
      ,lastMessages, setLastMessages ,unreadCount, setUnreadCount
    }}>
      {children}
    </StatusContext.Provider>
  );
};
