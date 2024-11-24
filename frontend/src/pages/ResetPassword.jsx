import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';
// import { auth } from '../../../backend/utils/FireBase';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); 
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email); 
      toast.success('Reset link sent! Check your email.');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    }
  };
  return (
    <div className='flex flex-col items-center justify-center min-w-96 mx-auto'>
      <div className='w-full p-6 bg-white-800 rounded-lg shadow-md bg-blue-200 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-70 border border-gray-100'>
        <Link to='/login' >BACK TO LOGIN</Link>
        <h1 className='text-3xl font-semibold text-center text-gray-500'>
          Reset Password
        </h1>
        <form onSubmit={handleResetPassword}>
          <div>
            <label className='label p-2'>
              <span className='text-base label-text'>Email</span>
            </label>
            <input
              type="email"
              placeholder='Enter your email'
              className='w-full input input-bordered h-10'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <button className='btn btn-block btn-sm mt-5 p-3 rounded-lg bg-green-300' type="submit">
              SEND RESET LINK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
