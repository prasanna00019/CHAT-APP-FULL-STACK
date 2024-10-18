import React, { useState, useContext, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import useSendMessage from "../hooks/useSendMessage";
import { useAuthContext } from "../context/AuthContext";

const MessageInput = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, loading } = useSendMessage();
  const [receiverId, setReceiverId] = useState('');
  const {clickedId,Authuser}=useAuthContext()
  const [userId, setUserId] = useState('');
  const{ socket,sendMessageSocket ,socketId,registerUser}= useContext(SocketContext);
  useEffect(() => {
    socket.on('receive_message', ({ message }) => {
      setMessages((prev) => [...prev, { sender: 'Other', text: message }]);
      console.log('Message received:', message);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [socket]);
  useEffect(()=>{
    setReceiverId(clickedId);
    setUserId(Authuser);
  },[clickedId,Authuser]) 
  const handleRegister = () => {
    registerUser(userId);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return;

    try {
      
        sendMessageSocket(receiverId, message);  
        setMessages((prev) => [...prev, { sender: 'You', text: message }]);
        await sendMessage(message);
        setMessage(""); // Clear the input field only after sending
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <form className='px-4 my-3 fixed bottom-[25px]' onSubmit={handleSubmit}>
      <div className='w-full relative'>
        <input
          type='text'
          className='border text-xl rounded-lg block w-[750px] p-2.5 bg-blue-200 border-gray-600 text-black'
          placeholder='Send a message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type='submit' className='absolute inset-y-0 end-0 flex items-center pe-3'>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
