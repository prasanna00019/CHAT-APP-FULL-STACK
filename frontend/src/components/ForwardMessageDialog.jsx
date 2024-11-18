import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button,
    ListItem, ListItemIcon, ListItemText, Checkbox, } from '@mui/material';
    import toast, { Toaster } from 'react-hot-toast';
import { encryptMessage } from '../helper_functions';
import { useAuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
const ForwardMessageDialog = ({ open, handleClose, allUsers, onForward,message }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const { socket } = useContext(SocketContext);
    const secretKey = '!@#$%^y7gH*3xs';
    const {Authuser}=useAuthContext();
    const handleForwardToMultipleUsers = (selectedUsers) => {
        selectedUsers.forEach((userId) => {
          const messageData = {
            sender: Authuser._id,
            receiver: userId,
            message: message.text,
            reply:  null,
          };
          socket.emit('sendMessageOneToOne', messageData);
        });
        setSelectedUsers([]);
        toast.success('Message forwarded successfully', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#333',
            color: '#fff',
          },
        })
      };
    const handleUserToggle = (userId) => {
      setSelectedUsers((prevSelected) =>
        prevSelected.includes(userId)
          ? prevSelected.filter((id) => id !== userId)
          : [...prevSelected, userId]
      );
    };
    const handleForward = () => {
      if (selectedUsers.length > 0) {
        handleForwardToMultipleUsers(selectedUsers);
        handleClose();
      }
    };
  
    return (
        <>
        <Toaster/>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Forward Message</DialogTitle>
        <DialogContent>
          <h4>Select users to forward the message:</h4>
          {allUsers.map((user) => (
              <ListItem key={user._id}>
              <ListItemIcon>
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserToggle(user._id)}
                />
              </ListItemIcon>
              <ListItemText primary={user.username || user.email} />
            </ListItem>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleForward} color="primary" disabled={selectedUsers.length === 0}>
            Forward
          </Button>
        </DialogActions>
      </Dialog>
          </>
    );
  };

export default ForwardMessageDialog;
