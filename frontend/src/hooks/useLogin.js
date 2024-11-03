import { useState } from "react"
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
const useLogin = () => {
   const [loading, setloading] = useState(false);
   const { setAuthuser } = useAuthContext();
   const login = async (email, password) => {
      const success = handleInputErrors(email, password);
      if (!success) return;
      setloading(true);
      try {
         const res = await fetch('http://localhost:5000/auth/login/', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
         })
         const data = await res.json();
         if (data.error) {
            throw new Error(data.error)
         }
         localStorage.setItem('chat-user', JSON.stringify(data));
         setAuthuser(data);
         console.log(data);
      } catch (error) {
         toast.error(error.message);
      }
      finally {
         setloading(false);
      }
   }
   return { loading, login };
}
export default useLogin
function handleInputErrors(email, password) {
   if (!email || !password) {
      toast.error("Please fill in all fields");
      return false;
   }
   return true;
}