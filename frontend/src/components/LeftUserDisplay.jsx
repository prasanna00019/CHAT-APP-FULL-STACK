import React, { useEffect, useMemo, useContext, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import user_empty from '../assets/user_empty.png';
import { SocketContext } from '../context/SocketContext';
import { useStatusContext } from '../context/StatusContext';
import axios from 'axios';
import useLogout from '../hooks/useLogout';
import a3 from '../assets/a2.svg'
import RightMessage2 from './RightMessage2';
import { decryptMessage } from '../helper_functions';
import encryption from '../assets/encryption.png';
import bluetick from '../assets/blue-double.png'
import normaltick from '../assets/normal-double.png'
import search from '../assets/search.png';
const LeftUserDisplay = ({ userId }) => {
  const { logout, loading } = useLogout();
  const { Authuser} = useAuthContext();
  const {  setclickedId ,clickedId} = useAuthContext();
  const { users, setUsers } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
 const [readRoute, setreadRoute] = useState(true);
  const { socket } = useContext(SocketContext);
  const secretKey = '!@#$%^y7gH*3xs';
  const { messages2, setMessages2 } = useStatusContext();
  const [lastMessage, setlastMessage] = useState({})
  const {unreadCount, setUnreadCount}=useStatusContext();
  const [newMessage1, setNewMessage1]=useState(false);
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const handleToggle=(t)=> {
     if(t==1){
       setreadRoute(true);
     }
     else if(t==2){
       setreadRoute(false);
     }
  }
  const fetchLastMessagesOfAllConversations = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/message/last-message/${Authuser._id}`);
      console.log(res.data);
      const lastMessageMap = res.data.reduce((acc, conversation) => {
        acc[conversation.otherParticipant] = {
          text: conversation.lastMessage,
          status: conversation.lastMessageStatus,
          time: conversation.lastMessageTime,
          unreadCount: conversation.unreadCount,
        };
        return acc;
      }, {});
      console.log(lastMessageMap);
      setlastMessage(lastMessageMap);
    } catch (error) {
      console.error('Error fetching last messages for all conversations:', error);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      if (users.length === 0) {
        try {
          console.log('rendering ////')
          const response = await fetch('http://localhost:5000/users');
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          setUsers(data);
        } catch (error) {
          console.error('Error fetching users: ', error);
        }
      }
    };
    fetchUsers();
    fetchLastMessagesOfAllConversations();
  }, []);
  useEffect(()=>{
    fetchLastMessagesOfAllConversations();
  },[messages2,newMessage1]);
 
  const handleUserClick = (user) => {
    setclickedId(user.id);
    // setDynamicURL(user.id);
  };
  const handleLogout = async () => {
    await logout();
  };
  const highlightQuery = (name, query) => {
    if (!query) return name;
  
    const regex = new RegExp(`(${query})`, 'i'); // Case-insensitive match
    const parts = name.split(regex);
  
    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: 'green', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: 'black' }}>
              {part}
            </span>
          )
        )}
      </span>
    );
  };
  
  if (!Authuser._id) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="w-[300px] p-2 pl-1 mt-[-20px] bg-white rounded-lg border-blue-300 border shadow-xl shadow-blue-300">
        {/* <button
          onClick={handleLogout}
          disabled={loading}
          className="font-bold mt-4 px-4 py-2 bg-orange-400 mb-4 text-white rounded shadow-lg shadow-red-200"
        >
          LOGOUT
        </button> */}
        <div className='text-cyan-500 font-bold text-2xl mr-[80px] flex gap-2'>
          <img src={a3} width={40} height={40} alt="" />
          <span>
          WhatsApp
          </span> 
          </div>
        <div className="search-container flex flex-col gap-1 justify-around">
          {/* <img src={search} width={4  0} height={20} alt="" /> */}
          <div className='flex gap-2 justify-around'>
        <button className='bg-green-300 text-green-600 rounded-full p-1' onClick={()=>{handleToggle(1)}}>CHATS</button>
        <button className='bg-green-300 text-green-600 rounded-full p-1'onClick={()=>{handleToggle(2)}} >UNREAD</button>
       </div> 
  <input
   
    type="text"
    placeholder='Search...'
    value={searchQuery}
    onChange={(e) => handleSearch(e.target.value)}
    className="search-input border border-black rounded-full mb-1 p-2 w-full"
  />
</div>
        <div className="flex flex-col border border-black p-2 w-[290px] shadow-blue-100 shadow-lg">
          <ul>
            {users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase())&& (readRoute===true?(lastMessage[user._id]?.unreadCount==0||lastMessage[user._id]?.unreadCount===undefined || lastMessage[user._id]?.unreadCount>0):lastMessage[user._id]?.unreadCount>0)  )
              .sort((u1, u2) => {
                const time1 = new Date(lastMessage[u1._id]?.time || 0).getTime();
                const time2 = new Date(lastMessage[u2._id]?.time || 0).getTime();
                return time2 - time1; // Sort in descending order of time
              }).map((user,index) => (
              <li
                key={user._id} 
                // className=" "
                className={`${user.id===clickedId ? 'bg-yellow-200' : ''} ${user.id===Authuser._id ?'pointer-events-none':"" } hover:cursor-pointer  hover:bg-blue-200 text-2xl border-t-2
                 border-gray-500  border-r-2 border-l-2 shadow-sm 
                ${index===users.length-1 ? 'border-b-2 border-gray-500' : ''} p-1 m-2`}
                onClick={() => handleUserClick(user)}
              >
                <div className="flex gap-1">
                  <img
                    src={user.profilePic ? user.profilePic : user_empty}
                    width={50}
                    height={20} 
                    className="rounded-full"
                    alt=""
                  />
                  <div className="text-xl text-gray-800 flex  gap-1">
                    {user._id === Authuser._id ? `${user.username} (You)` : highlightQuery(user.username, searchQuery)}
                   <p className='text-[12px] ml-4'>
                   {lastMessage[user._id]?.time &&
  !isNaN(new Date(lastMessage[user._id]?.time)) && (
    new Date(lastMessage[user._id]?.time).toLocaleTimeString()
  )}
                   </p>
                   </div>
                
                </div>
                <div className='flex gap-2 justify-between'>
                <p className='text-[18px]'>
              
                  {/* {  lastMessage[user._id]?.text ? decryptMessage(lastMessage[user._id].text, secretKey) : <p className='italic text-gray-400'>CLICK TO START CHAT</p>
                  ||  decryptMessage(messages2?.[messages2.length - 1]?.text, secretKey) 
                } */}
              <div className='flex gap-2 justify-evenly'>
                <div>
                {lastMessage[user._id]?.status==='read' ? <img src={bluetick} className='mt-2' width={20} height={20} alt="" /> :lastMessage[user._id]?.status==='delivered' ? <img src={normaltick} className='mt-1' width={20} height={20} alt="" />:lastMessage[user.id]?.status==='sent'? <span>✔</span>:""}
                </div>
                <div>
                {
                  lastMessage[user._id]?.text 
                  ? decryptMessage(lastMessage[user._id].text, secretKey)?.length > 15
                  ? decryptMessage(lastMessage[user._id].text, secretKey).slice(0, 15) + "..."
                  : decryptMessage(lastMessage[user._id].text, secretKey)
                  :<p className='italic text-gray-400'>CLICK TO START CHAT</p>
}
                  </div>
                  </div>  

                </p>

                 { lastMessage[user._id]?.unreadCount>=0 && <p className='rounded-full h-[40px] w-[40px] bg-green-500'>{lastMessage[user._id]?.unreadCount}</p>}
                </div>
                </li>
            ))}
          </ul>
         <div className='flex gap-2'>
          <img src={encryption} height={40} width={80} alt="" />
          <p className="italic text-gray-700 font-extrabold   mt-5">YOUR MESSAGES ARE END TO END ENCRYPTED</p>
          </div> 
        </div>
      </div>
      <RightMessage2 newMessage1={newMessage1} setNewMessage1={newMessage1} />
    </>
  );
};

export default LeftUserDisplay;
