import { useState } from "react"
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const useLogout = () => {
    const [loading, setloading] = useState(false);
    const { Authuser, setAuthuser } = useAuthContext();
    const logout = async () => {
        setloading(true)
        try {
            const res = await fetch('http://localhost:5000/auth/logout', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.error) {
                throw new Error(data.error);
            }
            localStorage.removeItem('chat-user');
            setAuthuser(null);
        } catch (error) {
            toast.error(error.message);
        }
        finally {
            setloading(false)
        }
    }
    return { loading, logout };
}

export default useLogout
