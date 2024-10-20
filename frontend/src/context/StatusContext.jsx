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
  const [userInfo, setUserInfo] = useState(null);
  return (
    <StatusContext.Provider value={{ onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus ,userInfo, setUserInfo
      ,clickedStoryId,setClickedStoryId ,clickedUserId,setClickedUserId
    }}>
      {children}
    </StatusContext.Provider>
  );
};
