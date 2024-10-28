import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const {clickedId}=useAuthContext();
  const {Authuser}=useAuthContext();
  // console.log(Authuser, "from socketcontext.jsx");
  const socket = io('http://localhost:5000',{
    query:{userId:clickedId,Authuser:Authuser?._id || null},
 
  });
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      setSocketId(socket.id);
      console.log('Connected with socket ID:', socket.id);
    });
    // socket.on('receive_message', (data) => {
    //   console.log('Received message:', data);
    // });
    socket.on('disconnect', () => {
      console.log('Disconnected from server');  
    });
    socket.on('receive_message', (data) => {
      console.log('Received message:', data);
      // Handle the received message, e.g., update state
    });
  
    socket.on('typing', (userId) => {
      console.log(`${userId} is typing...`);
      // Update the UI to show the typing status
    });
  
    socket.on('stop-typing', (userId) => {
      console.log(`${userId} stopped typing`);
      // Update the UI to remove the typing status
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive_message');
      socket.off('typing');
      socket.off('stop-typing');
    };
  }, []);

  const registerUser = (userId) => {
    socket.emit('register', userId);
    console.log(`Registered user with ID: ${userId}`);
  };

  const sendMessageSocket = (receiverId, message) => {
    socket.emit('send_message', { receiverId, message });
    console.log(`Message sent to ${receiverId}: ${message} from socketContext.jsx`);
  };

  const value = {
    socket,
    socketId,
    registerUser,
    sendMessageSocket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
