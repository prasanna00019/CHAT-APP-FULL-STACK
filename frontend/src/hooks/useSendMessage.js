import { useState } from "react"
import { useAuthContext } from "../context/AuthContext";

const useSendMessage = () => {
  const [loading, setloading] = useState(false);
//   const {messages,setmessages,selectedConversation}=UseConversation();
// const {authUser}  
const [messages,setmessages]=useState([]);
const { clickedId, Authuser} = useAuthContext();
const sendMessage=async(message)=>{
    setloading(true);
    try {
        const res=await fetch(`http://localhost:5000/message/send/${Authuser._id}/${clickedId}`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({message})
        })
        const data=await res.json();
        if(data.error){
            throw new Error(data.error);
        }
        setmessages((prevMessages) => [...prevMessages,data]);
    } catch (error) {
        toast.error(error.message)
    } finally{
        setloading(false)
    }
  }
  return {sendMessage,loading}
}

export default useSendMessage
