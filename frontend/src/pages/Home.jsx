import React, { useState, useEffect, useContext } from 'react';
import a1 from '../assets/chat-status-2.webp'
import a2 from '../assets/status-update.webp'
import a3 from '../assets/group.png'
import LeftUserDisplay from '../components/LeftUserDisplay';
import LeftStory from '../components/LeftStory';
import RightStory from '../components/RightStory';
import { useAuthContext } from '../context/AuthContext';
import LeftGroup from '../components/LeftGroup';
import ChatLock from '../components/ChatLock';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
const Home = () => {
  const { Authuser, setAuthuser } = useAuthContext();
  const [chat, setChat] = useState(true);
  const [group, setgroup] = useState(false);
  const [stories, setStories] = useState(false);
  const {  setclickedId ,clickedId} = useAuthContext();
  const {socket}=useContext(SocketContext);
  useEffect(()=>{
    socket.emit('TEST',Authuser._id,socket.id);
  },[socket]);
  const toggleLeftBar = (t) => {
    if (t == '1') {
      setChat(true);
      setgroup(false);
      setStories(false);
    } else if (t == '2') {
      setChat(false);
      setStories(true);
      setgroup(false);
      // console.log(clickedId)
      setclickedId(null);
      // socket.emit('register', Authuser._id);
    }
    else if (t == '3') {
      setChat(false);
      setgroup(true);
      setStories(false);
      setclickedId(null)
      // console.log(clickedId)
      // socket.emit('register', Authuser._id);
    }
  }
  const authContext = useAuthContext();
  return (
    <div className='flex gap-10 justify-evenly  w-full h-screen '>
      <div className=' h-screen bg-blue-400 p-1 w-[90px] pl-2 flex flex-col gap-3  absolute ml-[-90%] border border-b mt-[-20px]
    shadow-xl rounded-lg shadow-zinc-500 '>
        <img onClick={() => toggleLeftBar('1')} src={a1} width={70} height={40} alt="" />
        <img onClick={() => toggleLeftBar('2')} src={a2} width={70} height={40} alt="" />
        <img onClick={() => toggleLeftBar('3')} src={a3} width={70} height={40} className='mt-2' alt="" />
      </div>

      {chat && !stories && !group ? (
        <>
          <LeftUserDisplay userId={Authuser._id} />
        </>
      ) : stories && !chat && !group ? (
        <>
          <LeftStory  userId={Authuser._id}/>
          <RightStory />
        </>
      ) : group && !chat && !stories ? (
        <>
          <LeftGroup userId={Authuser._id} />
        </>
      ) : <ChatLock/>}
    </div>
  );
};

export default Home;
