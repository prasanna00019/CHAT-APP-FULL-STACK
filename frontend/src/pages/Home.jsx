import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { AuthContextProvider, useAuthContext } from '../context/AuthContext';
// import { auth } from '../../backend/utils/FireBase';
import { io } from 'socket.io-client';
import { auth } from '../../../backend/utils/FireBase';
import a1 from '../assets/chat-status-2.webp'
import a2 from '../assets/status-update.webp'
import LeftUserDisplay from '../components/LeftUserDisplay';
import RightMessage from '../components/RightMessage';
import UserProfile from '../components/UserProfile';
import { Link } from 'react-router-dom';
import LeftStory from '../components/LeftStory';
import RightStory from '../components/RightStory';
import TestComp from '../components/TestComp';

// Initialize Socket.IO client
const socket = io('http://localhost:5000'); // Make sure this URL matches your backend server's URL

const Home = () => { 
const { Authuser,setAuthuser} = useAuthContext(); // Use authUser from context
const [chat,setChat]=useState(false);
const [stories,setStories]=useState(true);
useEffect(()=>{
  setAuthuser(Authuser);
},[Home,LeftUserDisplay,RightMessage])
const toggleLeftBar = (t) => {
  if(t){
    setChat(false);
    setStories(true);
  }else{
    setChat(true);
    setStories(false);
  }
} 
const authContext = useAuthContext();
  return (
   <div className='flex gap-10 justify-evenly w-full h-screen '>
    <div className=' h-screen bg-blue-400 p-1 w-[80px] flex flex-col gap-3  absolute ml-[-90%] border border-b mt-[-20px]
    shadow-xl rounded-lg shadow-zinc-500 '>
      <img onClick={()=>toggleLeftBar(false)} src={a1} width={70} height={40} alt="" />
      <img onClick={()=>toggleLeftBar(true)} src={a2} width={70} height={40} alt="" />
    </div>
   
    {chat && !stories ? (
        <>
          <LeftUserDisplay />
          <RightMessage />
        </>
      ) : <>
      <LeftStory/>
      <RightStory/> 
    </>}

   {/* <Link to='/user-profile'>
    <button>User Profile</button>
   </Link> */}
   {/* <TestComp/> */}
   {/* <ParentComponent/> */}
  </div>
  );
};

export default Home;
