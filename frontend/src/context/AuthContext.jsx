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

    const [Authuser,setAuthuser]=useState(JSON.parse(localStorage.getItem("chat-user")) || null);
    return <AuthContext.Provider value={{Authuser,setAuthuser,users,setUsers,clickedId,setclickedId,loading,setLoading,messageId,setMessageId}}>
        {children}
        </AuthContext.Provider>
}


