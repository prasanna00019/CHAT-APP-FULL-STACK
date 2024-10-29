import React, { useEffect, useMemo, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import user_empty from '../assets/user_empty.png';
import { SocketContext } from '../context/SocketContext';
import { useStatusContext } from '../context/StatusContext';
import CryptoJS from 'crypto-js';
import useLogout from '../hooks/useLogout';
import RightMessage2 from './RightMessage2';
const LeftUserDisplay = ({userId}) => {
  const {logout,loading}=useLogout();
  const { Authuser,setAuthuser } = useAuthContext();
  const secretKey = '!@#$%^y7gH*3xs'; 
  const { clickedId, setclickedId } = useAuthContext();
  const { users, setUsers } = useAuthContext();
  const {userInfo, setUserInfo} = useStatusContext();
  const { socket } = useContext(SocketContext);
  const { onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus } = useStatusContext();
  useEffect(() => {
    socket.on('current_online_users', (currentOnlineUsers) => {
      const newStatus = {};
      currentOnlineUsers.forEach((userId) => {
        newStatus[userId] = { online: true, lastSeen: null };
      });
      setOnlineStatus(newStatus);
    });
    socket.on('user_online', ({ userId, online, lastSeen }) => {
      if (userId !== null && userId !== undefined) {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: { online: true, lastSeen: null },
      }));
      }
      memoizedUsers.map((user) => {
        console.log(user, ' from left')
        if (user._id === userId) {
          console.log('inside if from left', ' from left')
          user.online = online;
          user.lastSeen = lastSeen;
        }
      })
    }
  ); 
    socket.on('user_offline', ({ Authuser,online,lastSeen}) => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: { online: false, lastSeen },
      }));
      memoizedUsers.map((user) => {
        // console.log(first)
        if (user._id === Authuser) {
          user.online = false;
          user.lastSeen = lastSeen;
        }
      })
    });
    socket.on('connect', () => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [Authuser._id]: { online: true, lastSeen: null },
      }));
    });

    socket.on('disconnect', () => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [Authuser._id]: { online: false, lastSeen: new Date().toISOString() },
      }));
    });
    return () => {
      socket.off('current_online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket]);
  function decryptMessage(encryptedMessage, secretKey) {
    try{
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);}
    catch(error){
      return encryptedMessage;
    }
  }
  useEffect(() => {
    // Fetch users if the users state is empty
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
  }, [users, setUsers,onlineStatus,setOnlineStatus,updatedStatus,setUpdatedStatus,socket]);
  const handleUserClick = (user) => {
    setclickedId(user.id);
  };
  const handleLogout = async () => {
    await logout();
  };
  const memoizedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      online: onlineStatus[user._id]?.online,
    }));
  }, [users, updatedStatus, onlineStatus,socket,Authuser,setOnlineStatus,setUpdatedStatus,userInfo,setUserInfo]);
  if (!Authuser._id) {
    return <p>Loading...</p>;
  }
  return (
      <>
    <div className="w-[300px] p-2 pl-1 mt-[-20px] bg-white rounded-lg border-blue-300 border shadow-xl shadow-blue-300  ">
      <button onClick={handleLogout} disabled={loading} className="font-bold mt-4 px-4 py-2 bg-orange-400 mb-4 text-white rounded shadow-lg shadow-red-200">
        LOGOUT
      </button>
      <div className="flex flex-col border border-black p-2 w-[290px] shadow-blue-100 shadow-lg">
        <h1 className='font-bold'>USERS</h1>
        <ul>
          {memoizedUsers.map((user) => (
            
            <li 
            key={user._id} 
            className="text-2xl border border-black rounded-lg p-2 m-2" 
            onClick={() => handleUserClick(user)}
            >
              <div className='flex gap-1'>
                <img src={user.profilePic ? user.profilePic : user_empty} width={50} height={20}
                  className='rounded-full' alt="" />
                <p className='text-xl font-bold'>{user.id === Authuser._id ? `${user.username} (You)` : user.username}</p>
                <span className={`ml-2 ${user.online ? 'text-green-500' : 'text-red-500'}`}>
                  {user.online ? 'Online' : 'Offline'}
                </span>
              </div>
              {/* <p className="text-sm text-gray-600">{user.lastMessage!=='Loading last message...' ? decryptMessage(user.lastMessage, secretKey):"Loading last message..."}</p> */}
            </li>
          ))}
        </ul>
        <p className='font-bold mt-5'>YOUR MESSAGES ARE END TO END ENCRYTPED</p>
      </div>
    </div>
      <RightMessage2 />
          </>
  );
};

export default LeftUserDisplay;




// import React, { useEffect, useMemo, useContext } from 'react';
// import { useAuthContext } from '../context/AuthContext';
// import user_empty from '../assets/user_empty.png';
// import { SocketContext } from '../context/SocketContext';
// import { useStatusContext } from '../context/StatusContext';
// import CryptoJS from 'crypto-js';
// import useLogout from '../hooks/useLogout';
// import RightMessage2 from './RightMessage2';

// const LeftUserDisplay = ({ userId }) => {
//   const { logout, loading } = useLogout();
//   const { Authuser, setAuthuser } = useAuthContext();
//   const { clickedId, setclickedId } = useAuthContext();
//   const { users, setUsers } = useAuthContext();
//   const { socket } = useContext(SocketContext);

//   useEffect(() => {
//     // Handle current online users list on initial connection
//     // socket.on('current_online_users', (currentOnlineUsers) => {
//     //   setUsers((prevUsers) =>
//     //     prevUsers.map((user) => ({
//     //       ...user,
//     //       online: currentOnlineUsers.includes(user._id),
//     //       lastSeen: currentOnlineUsers.includes(user._id) ? null : user.lastSeen,
//     //     }))
//     //   );
//     // });

//     // Update individual user's online status
//     socket.on('user_online', ({ userId, online, lastSeen }) => {
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user._id === userId
//             ? { ...user, online: true, lastSeen: null }
//             : user
//         )
//       );
//     });

//     socket.on('user_offline', ({ Authuser,online,lastSeen}) => {
//       setUsers((prevUsers) =>
//         prevUsers.map((user) =>
//           user._id === Authuser
//             ? { ...user, online: false, lastSeen }
//             : user
//         )
//       );
//     });

//     return () => {
//       // socket.off('current_online_users');
//       socket.off('user_online');
//       socket.off('user_offline');
//     };
//   }, [socket]);

//   const decryptMessage = (encryptedMessage, secretKey) => {
//     try {
//       const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
//       return bytes.toString(CryptoJS.enc.Utf8);
//     } catch (error) {
//       return encryptedMessage;
//     }
//   };

//   // Fetch users if the users state is empty
//   useEffect(() => {
//     const fetchUsers = async () => {
//       if (users.length === 0) {
//         try {
//           console.log('rendering ////')
//           const response = await fetch('http://localhost:5000/users');
//           if (!response.ok) {
//             throw new Error('Failed to fetch users');
//           }
//           const data = await response.json();
//           setUsers(data);
//         } catch (error) {
//           console.error('Error fetching users: ', error);
//         }
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleUserClick = (user) => {
//     setclickedId(user.id);
//   };

//   const handleLogout = async () => {
//     await logout();
//   };

//   if (!Authuser._id) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <>
//       <div className="w-[300px] p-2 pl-1 mt-[-20px] bg-white rounded-lg border-blue-300 border shadow-xl shadow-blue-300">
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className="font-bold mt-4 px-4 py-2 bg-orange-400 mb-4 text-white rounded shadow-lg shadow-red-200"
//         >
//           LOGOUT
//         </button>
//         <div className="flex flex-col border border-black p-2 w-[290px] shadow-blue-100 shadow-lg">
//           <h1 className="font-bold">USERS</h1>
//           <ul>
//             {users.map((user) => (
//               <li
//                 key={user._id}
//                 className="text-2xl border border-black rounded-lg p-2 m-2"
//                 onClick={() => handleUserClick(user)}
//               >
//                 <div className="flex gap-1">
//                   <img
//                     src={user.profilePic ? user.profilePic : user_empty}
//                     width={50}
//                     height={20}
//                     className="rounded-full"
//                     alt=""
//                   />
//                   <p className="text-xl font-bold">
//                     {user.id === Authuser._id ? `${user.username} (You)` : user.username}
//                   </p>
//                   <span className={`ml-2 ${user.online ? 'text-green-500' : 'text-red-500'}`}>
//                     {user.online ? 'Online' : 'Offline'}
//                   </span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//           <p className="font-bold mt-5">YOUR MESSAGES ARE END TO END ENCRYPTED</p>
//         </div>
//       </div>
//       <RightMessage2 />
//     </>
//   );
// };

// export default LeftUserDisplay;
