// import React, { useState, useEffect, useMemo, useContext } from 'react';
// import { signOut } from 'firebase/auth';
// import { auth } from '../../backend/utils/FireBase';
// import { useAuthContext } from '../context/AuthContext';
// import user_empty from '../assets/user_empty.png';
// import { SocketContext } from '../context/SocketContext';

// const LeftUserDisplay = () => {
//   const { authUser, setAuthUser } = useAuthContext();
//   const [messages, setMessages] = useState({});
//   const { clickedId, setclickedId } = useAuthContext();
//   const { users, setUsers } = useAuthContext();
//   const { socket } = useContext(SocketContext);
//   const [onlineStatus, setOnlineStatus] = useState({}); // Track online status

//   // Listen for socket events to update the online status
//   useEffect(() => {
//     // Fetch the current online users when the component mounts
//     socket.on('current_online_users', (currentOnlineUsers) => {
//       const updatedStatus = {};
//       currentOnlineUsers.forEach((userId) => {
//         updatedStatus[userId] = { online: true, lastSeen: null };
//       });
//       setOnlineStatus(updatedStatus);
//     });

//     socket.on('user_online', ({ userId }) => {
//       setOnlineStatus((prevStatus) => ({
//         ...prevStatus,
//         [userId]: { online: true, lastSeen: null },
//       }));
//     });

//     socket.on('user_offline', ({ userId, lastSeen }) => {
//       setOnlineStatus((prevStatus) => ({
//         ...prevStatus,
//         [userId]: { online: false, lastSeen },
//       }));
//     });

//     // Handle connection status for the authUser
//     socket.on('connect', () => {
//       setOnlineStatus((prevStatus) => ({
//         ...prevStatus,
//         [authUser]: { online: true, lastSeen: null },
//       }));
//     });

//     socket.on('disconnect', () => {
//       setOnlineStatus((prevStatus) => ({
//         ...prevStatus,
//         [authUser]: { online: false, lastSeen: null },
//       }));
//     });

//     // Cleanup socket listeners when component unmounts
//     return () => {
//       socket.off('current_online_users');
//       socket.off('user_online');
//       socket.off('user_offline');
//       socket.off('connect');
//       socket.off('disconnect');
//     };
//   }, [socket, authUser]);

//   useEffect(() => {
//     // Fetch users if the users state is empty
//     const fetchUsers = async () => {
//       if (users.length === 0) {
//         try {
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
//   }, [users.length, setUsers]);

//   useEffect(() => {
//     // Fetch the last message for each user after users are fetched
//     const fetchLastMessages = async () => {
//       let messagesMap = {};
//       for (const user of users) {
//         if (user.id !== authUser) {
//           try {
//             const response = await fetch(`http://localhost:5000/message/last-message/${authUser}/${user.id}`);
//             if (!response.ok) {
//               throw new Error('Failed to fetch last message');
//             }
//             const data = await response.json();
//             messagesMap[user.id] = data.lastMessage?.text || 'No messages yet';
//           } catch (error) {
//             console.error('Error fetching last message: ', error);
//             messagesMap[user.id] = 'Error loading message';
//           }
//         }
//       }
//       setMessages(messagesMap); // Update all messages at once
//     };

//     if (users.length > 0) {
//       fetchLastMessages();
//     }
//   }, [authUser, users]); // Dependency on `users` to trigger after users are loaded

//   const handleUserClick = (user) => {
//     setclickedId(user.id);
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       setAuthUser(null);
//     } catch (error) {
//       console.error('Failed to log out:', error);
//     }
//   };

//   // Memoize the filtered list of users to avoid recomputation on each render
//   const memoizedUsers = useMemo(() => {
//     return users.map((user) => ({
//       ...user,
//       lastMessage: messages[user.id] || 'Loading last message...',
//       online: onlineStatus[user.id]?.online, // Get online status
//     }));
//   }, [users, messages, onlineStatus]);

//   if (!authUser) {
//     return <p>Loading...</p>;
//   }

//   return (
//     <div className="w-[300px] p-2 pl-1 mt-[-20px] bg-white rounded-lg border-blue-300 border shadow-xl shadow-blue-300 ">
//       <button onClick={handleLogout} className=" font-bold mt-4 px-4 py-2 bg-orange-400 mb-4 text-white rounded shadow-lg shadow-red-200">
//         LOGOUT
//       </button>
//       <div className="flex flex-col border border-black p-2 w-[290px]  shadow-blue-100 shadow-lg">
//         <h1 className='font-bold'>USERS</h1>
//         <ul>
//           {memoizedUsers.map((user) => (
//             <li 
//               key={user.id} 
//               className="text-2xl border border-black rounded-lg p-2 m-2" 
//               onClick={() => handleUserClick(user)}
//             >
//               <div className='flex gap-1'>
//                 <img src={user.profilePic ? user.profilePic : user_empty} width={50} height={20}
//                   className='rounded-full' alt="" />
//                 <p className='text-xl font-bold'>{user.id === authUser ? `${user.username} (You)` : user.username}</p>
//                 {/* Display online status */}
//                 <span className={`ml-2 ${user.online ? 'text-green-500' : 'text-red-500'}`}>
//                   {user.online ? 'Online' : 'Offline'}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-600">{user.lastMessage}</p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default LeftUserDisplay;
import React, { useEffect, useMemo, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import user_empty from '../assets/user_empty.png';
import { SocketContext } from '../context/SocketContext';
import { useStatusContext } from '../context/StatusContext';
import useLogout from '../hooks/useLogout';
const LeftUserDisplay = () => {
  const {logout,loading}=useLogout();
  const { Authuser,setAuthuser } = useAuthContext();
  // console.log(Authuser," from leftuSER");
  const { clickedId, setclickedId } = useAuthContext();
  const { users, setUsers } = useAuthContext();
  const {userInfo, setUserInfo} = useStatusContext();
  const { socket } = useContext(SocketContext);
  const { onlineStatus, setOnlineStatus, updatedStatus, setUpdatedStatus } = useStatusContext();

  // Function to update user's online status in Firestore
  // Listen for socket events to update the online status
  useEffect(() => {
    // Fetch the current online users when the component mounts
    socket.on('current_online_users', (currentOnlineUsers) => {
      const newStatus = {};
      currentOnlineUsers.forEach((userId) => {
        // console.log(userId," from socket ssss");
        newStatus[userId] = { online: true, lastSeen: null };
        // updateUserStatusInDatabase(userId, { online: true, lastSeen: null });
      });
      setOnlineStatus(newStatus);
    });

    socket.on('user_online', ({ userId}) => {
      // console.log(typeof(userId),userId," from left user ");
      if (userId !== null && userId !== undefined) {
        // console.log(userId," from socket uuuuu");
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: { online: true, lastSeen: null },
      }));
      // updateUserStatusInDatabase(userId, { online: true, lastSeen: null });
    }
    }
  );
     
    socket.on('user_offline', ({ userId, lastSeen }) => {
      
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: { online: false, lastSeen },
      }));
      // updateUserStatusInDatabase(userId , { online: false, lastSeen });
    });

    // Handle connection status for the authUser
    socket.on('connect', () => {
      // const userId=socket.handshake.query.userId
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [Authuser._id]: { online: true, lastSeen: null },
      }));
      // updateUserStatusInDatabase(Authuser._id, { online: true, lastSeen: null });
    });

    socket.on('disconnect', () => {
      setOnlineStatus((prevStatus) => ({
        ...prevStatus,
        [Authuser._id]: { online: false, lastSeen: new Date().toISOString() },
      }));
      // updateUserStatusInDatabase(Authuser._id, { online: false, lastSeen: new Date().toISOString() });
    });

    // Cleanup socket listeners when component unmounts
    return () => {
      socket.off('current_online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, Authuser, setOnlineStatus,onlineStatus,updatedStatus,setUpdatedStatus,userInfo,setUserInfo]);

  useEffect(() => {
    // Fetch users if the users state is empty
    const fetchUsers = async () => {
      if (users.length === 0) {
        try {
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

  useEffect(() => {
    // Fetch the last message for each user after users are fetched
    const fetchLastMessages = async () => {
      let messagesMap = {};
      for (const user of users) {
        if (user._id !== Authuser._id) {
          try {
            console.log('User ID:', user._id);
            console.log('Authuser ID:', Authuser._id);
            const response = await fetch(`http://localhost:5000/message/last-message/${Authuser._id}/${user._id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch last message');
            }
            const data = await response.json();
            messagesMap[user.id] = data.lastMessage?.text || 'No messages yet';
          } catch (error) {
            console.error('Error fetching last message: ', error);
            messagesMap[user.id] = 'Error loading message';
          }
        }
      }
      setUpdatedStatus(messagesMap);
    };

    if (users.length > 0) {
      fetchLastMessages();
    }
  }, [Authuser, users, setUpdatedStatus,socket]);

  const handleUserClick = (user) => {
    console.log(user," from handle click");
    setclickedId(user.id);
  };

  const handleLogout = async () => {
    await logout();
  };

  const memoizedUsers = useMemo(() => {
    return users.map((user) => ({
      ...user,
      lastMessage: updatedStatus[user._id] || 'Loading last message...',
      online: onlineStatus[user._id]?.online,
    }));
  }, [users, updatedStatus, onlineStatus,socket,Authuser,setOnlineStatus,setUpdatedStatus,userInfo,setUserInfo]);
// console.log(users," led")
  if (!Authuser._id) {
    return <p>Loading...</p>;
  }

  return (
    <div className="w-[300px] p-2 pl-1 mt-[-20px] bg-white rounded-lg border-blue-300 border shadow-xl shadow-blue-300 ">
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
              <p className="text-sm text-gray-600">{user.lastMessage}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeftUserDisplay;

