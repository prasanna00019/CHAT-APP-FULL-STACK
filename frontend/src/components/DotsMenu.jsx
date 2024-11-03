// import React, { useState, useRef, useEffect } from 'react';
// import './DotsMenu.css'; 
// import { useNavigate } from 'react-router-dom';
// import { Switch } from '@mui/material';

// const DotsMenu = ({
//   setShowStarredMessages,
//   setShowPinnedMessages,
//   showPinnedMessages,
//   showStarredMessages,
//   searchBar, setSearchBar
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const menuRef = useRef(null); 

//   const toggleMenu = () => {
//     setIsOpen((prev) => !prev);
//   };

//   const navigate = useNavigate();

//   const handleOptionClick = (option) => {
//     console.log(`You clicked on ${option}`);
//     setIsOpen(false); 
//   };

//   const handleClickOutside = (event) => {
//     if (menuRef.current && !menuRef.current.contains(event.target)) {
//       setIsOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="dots-menu">
//       <div className="dots" onClick={toggleMenu}>
//         &#x2022;&#x2022;&#x2022; {/* Three dots */}
//       </div>
//       {isOpen && (
//         <div ref={menuRef} className="options mt-[-30px] w-[140px]">
//           <div onClick={() => { setShowPinnedMessages(!showPinnedMessages); }}>Pinned Messages</div>
//           <div onClick={() => { setShowStarredMessages(!showStarredMessages); }}>Starred Messages</div>
//           <div onClick={() => { navigate('/user-profile'); }}>User Profile</div>
//            LOCK CHAT <Switch/>
//           <div onClick={() => { setSearchBar(!searchBar) }}>SEARCH</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DotsMenu;

import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import './DotsMenu.css'; 
import { useAuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const DotsMenu = ({
  setShowStarredMessages,
  setShowPinnedMessages,
  showPinnedMessages,
  showStarredMessages,
  searchBar, setSearchBar,receiverId, IsGroupInfo, groupId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lockChat, setLockChat] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const {Authuser}=useAuthContext();
  const menuRef = useRef(null); 
  const navigate = useNavigate();
  const {socket}=useContext(SocketContext);
  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };
  useEffect(() => {
    const isChatLocked = Authuser?.LockedChats?.some(
      (lock) => lock.userId === receiverId
    );
    // setI(isChatLocked);
    setLockChat(isChatLocked);
  }, [receiverId, Authuser]);
  const handleOptionClick = (option) => {
    console.log(`You clicked on ${option}`);
    setIsOpen(false); 
  };
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  const handleLockChatToggle = (event) => {
    const isLocked = event.target.checked;
    setLockChat(isLocked);
    if (isLocked) {
      setPasswordDialogOpen(true);  // Open the dialog if locking chat
    }
    else{
      socket.emit('ChatLock',{AuthuserId:Authuser._id, receiverId:IsGroupInfo?groupId:receiverId,password,remove:true}) 
    }
  };
  const handlePasswordSubmit = () => {
    console.log("Password for lock:", password);
    if(!password){
      return;
    }
    socket.emit('ChatLock',{AuthuserId:Authuser._id,receiverId: IsGroupInfo?groupId:receiverId,password,remove:false}) 
    // Save or hash the password here, if needed
    setPasswordDialogOpen(false);  // Close the dialog
    setPassword('');  // Clear the input field
  };
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="dots-menu">
      <div className="dots" onClick={toggleMenu}>
        &#x2022;&#x2022;&#x2022;
      </div>
      {isOpen && (
        <div ref={menuRef} className="options mt-[-30px] w-[140px]">
          <div onClick={() => { setShowPinnedMessages(!showPinnedMessages); }}>Pinned Messages</div>
          <div onClick={() => { setShowStarredMessages(!showStarredMessages); }}>Starred Messages</div>
          <div onClick={() => { navigate('/user-profile'); }}>User Profile</div>
          <div>
            LOCK CHAT <Switch checked={lockChat} onChange={handleLockChatToggle} />
          </div>
          <div onClick={() => { setSearchBar(!searchBar) }}>SEARCH</div>
        </div>
      )}
      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Enter Password to Lock Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setPasswordDialogOpen(false); setLockChat(false);setPassword('')}}>Cancel</Button>
          <Button onClick={handlePasswordSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DotsMenu;
