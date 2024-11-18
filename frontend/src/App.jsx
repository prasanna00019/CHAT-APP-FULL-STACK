import React, { useEffect, useState } from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './components/UserProfile';
import { useAuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import { decryptMessage, encryptMessage } from './helper_functions';
import useLogout from './hooks/useLogout';
import LeftGroup from './components/LeftGroup';
import LeftStory from './components/LeftStory';
import RightStory from './components/RightStory';
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
 const {GROUP_CHAT_SECRET_KEY}=useLogout();
//  {console.log(decryptMessage('U2FsdGVkX18VnLXaqwUAyx2vaJ6R4MrwERMZiTZPTZJ43Ta3e1dYPc9YhhXG/G5Y',GROUP_CHAT_SECRET_KEY))}
  useEffect(() => {
    // Start loading process
    const loadTimer = setTimeout(() => {
      setIsFading(true); // Trigger the fade-out effect
    }, 4000);
    // Remove loading screen after fade-out
    const fadeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3500); // Adjust to match transition duration

    // Clean up timers
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(fadeTimer);
    };
  }, []);
  const { Authuser } = useAuthContext();
  return (
    <div className='p-4 h-screen flex items-center justify-center'>
      
      {isLoading ? <LoadingScreen isFading={isFading} /> :  
       <>
     <Routes>
        <Route path='/' element={Authuser ? <Home /> : <Navigate to={'/login'} />} />
        <Route path='/login' element={Authuser ? <Navigate to='/' /> : <Login />} />
        <Route path='/signup' element={Authuser ? <Navigate to={'/login'} /> : <Signup />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/groups" element={  <LeftGroup userId={Authuser._id} />} />
        <Route path="/stories" element={  <>
          <LeftStory  userId={Authuser._id}/>
          <RightStory />
        </>} />
        <Route path='/user-profile' element={<UserProfile />} />
      </Routes>
      <Toaster /> </>}
      
    </div>
  );
}
export default App;
