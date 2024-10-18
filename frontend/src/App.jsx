import React from 'react';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Signup from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import UserProfile from './components/UserProfile';
import { useAuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
function App() {
  const {Authuser}=useAuthContext();
  // console.log(Authuser," from App.jsx");
  return (
    <div className='p-4 h-screen flex items-center justify-center'>
      <Routes>
      <Route path='/' element={Authuser?<Home/>:<Navigate to={'/login'}/>}/>
      <Route path='/login' element={Authuser?<Navigate to='/'/>:<Login/>}/>
      <Route path='/signup' element={Authuser?<Navigate to='/'/>:<Signup/>}/>
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/user-profile' element={<UserProfile/>}/>
      </Routes>
      <Toaster/>
    </div>
  );
}

export default App;
