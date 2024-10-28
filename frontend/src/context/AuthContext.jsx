import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext=createContext();
export const useAuthContext=()=>{
    return useContext(AuthContext);
}

export const AuthContextProvider=({children})=>{
  const [users, setUsers] = useState([]); // State to store users fetched from MongoDB
  
  const [clickedId,setclickedId]=useState(null);
  const [loading, setLoading] = useState(true);
  const [messageId,setMessageId]=useState(null);
  const [userMap,setUserMap]=useState({});
  const fetchUsers = async () => {
    if (users.length === 0) {
      try {
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const mappedUsers = data.reduce((acc, user) => {
          acc[user._id] = user.username; // or use `user` if you want the full object
          return acc;
        }, {});

        setUsers(data);
        setUserMap(mappedUsers); 
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    }
  };
useEffect(()=>{
  fetchUsers();
  // console.log(users)
  // console.log(userMap)
},[])
    const [Authuser,setAuthuser]=useState(JSON.parse(localStorage.getItem("chat-user")) || null);
    return <AuthContext.Provider value={{Authuser,setAuthuser,users,setUsers,clickedId,setclickedId,loading,setLoading,messageId,setMessageId
    ,userMap
    }}>
        {children}
        </AuthContext.Provider>
}


