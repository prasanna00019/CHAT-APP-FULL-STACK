import React, { useContext, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  ListItem, ListItemIcon, ListItemText, Checkbox,
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const ForwardMessageGroup = ({ open, handleClose, groups, message }) => {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { socket } = useContext(SocketContext);
  const { Authuser } = useAuthContext();

  const handleForwardToMultipleGroups = (selectedGroups) => {
    // console.log(selectedGroups)
    selectedGroups.forEach((group) => {
      const receivers = group.participants.filter((id) => id !== Authuser._id);
      const messageData = {
        text: message.text,
        conversationId: message.conversationId,
        receivers,
        group: group._id,
        replyTo: null,
        sender: Authuser._id,
        media: "",
      };
    //   console.log(messageData);
      socket.emit('sendMessageGroup', messageData);
    });
    
    setSelectedGroups([]);
    toast.success('Message forwarded successfully', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleGroupToggle = (group) => {
    const groupIdWithParticipants = { _id: group._id, participants: group.participants };
    setSelectedGroups((prevSelected) =>
      prevSelected.some(g => g._id === group._id)
        ? prevSelected.filter(g => g._id !== group._id)
        : [...prevSelected, groupIdWithParticipants]
    );
  };

  const handleForward = () => {
    if (selectedGroups.length > 0) {
      handleForwardToMultipleGroups(selectedGroups);
      handleClose();
    }
  };

  return (
    <>
      <Toaster />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Forward Message</DialogTitle>
        <DialogContent>
          <h4>Select groups to forward the message:</h4>
          {groups.map((group) => (
            <ListItem key={group._id}>
              <ListItemIcon>
                <Checkbox
                  checked={selectedGroups.some(g => g._id === group._id)}
                  onChange={() => handleGroupToggle(group)}
                />
              </ListItemIcon>
              <ListItemText primary={group.name} />
            </ListItem>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleForward} color="primary" disabled={selectedGroups.length === 0}>
            Forward
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ForwardMessageGroup;
