import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Checkbox, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import RightGroup from './RightGroup';
import { SocketContext } from '../context/SocketContext';
import { useStatusContext } from '../context/StatusContext';

const LeftGroup = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);  // Modal state
  const [groupName, setGroupName] = useState('');
  const {messages, setMessages}=useStatusContext();
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [clickedGroupId, setClickedGroupId] = useState(null);
  const {socket}=useContext(SocketContext);
  const [lastMessage, setlastMessage] = useState({})
  useEffect(() => {
    socket.on('lastMessageGroup', (data) => {
      // console.log(data);
      setlastMessage((prevLastMessage) => ({
        ...prevLastMessage,
        [data.group]: data.text,
      }));
    });
    // Cleanup listener when component unmounts
    return () => socket.off('lastMessageGroup');
  }, [socket]);
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/group/get-groups/${userId}`);
      setGroups(res.data);
      // console.log(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch groups by user ID
  useEffect(() => {
    fetchGroups();
  }, [userId]);

  // Fetch all users to display in the participant selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/users/');
        setAllUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
   const lastMessageOfAllGroups=async()=>{
    try{
      const res=await axios.get('http://localhost:5000/group/getLastMessage')
      // console.log(res.data);
      const lastMessageMap = res.data.reduce((acc, group) => {
        console.log(group._id,group.lastMessage.text)
        acc[group._id] = group.lastMessage.text;
        // console.log(acc, group)
        return acc;
    }, {});

    // Set lastMessage state with the mapped object
    setlastMessage(lastMessageMap);
    console.log(lastMessage)
    // console.log(lastMessageMap)
    }
    catch(error){
      console.log(error)
    }
   }
    fetchUsers();
    lastMessageOfAllGroups();
  }, []);

  // Handle modal open/close
  const handleClickOpen = () => 
    {setOpen(true);
     }
        const handleClose = () => {setOpen(false)
  };

  // Handle participant selection
  const handleToggleParticipant = (userId) => {
      if (selectedParticipants.includes(userId)) {
          setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
        } else {
            setSelectedParticipants([...selectedParticipants, userId]);
        }
        console.log(selectedParticipants);
  };

  // Create a new group
  const handleDeleteGroup=async(groupId)=>{
    try {
      await axios.delete(`http://localhost:5000/group/delete-group/${groupId}`);
      setGroups(groups.filter(group => group._id !== groupId));
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  }
  const handleCreateGroup = async () => {
    try {
      const newGroup = {
        name: groupName,
        description: groupDescription,
        participants: selectedParticipants,
        admins: [userId],  // Admin is the user creating the group
        createdBy: userId,
      };
      await axios.post('http://localhost:5000/group/create-group', newGroup);
      setOpen(false);  // Close modal after creation
      fetchGroups();
    //   setGroups([...groups, newGroup]);
      // Optionally, refetch groups or add the new group to state
    } catch (error) {
       toast.error(error.response.data.message)
    //   console.error('Error creating group:', error);
    }
  };

  return (
    <div className='flex max-w-full'>
    <div style={{ padding: '20px' }} className='
    shadow-2xl shadow-green-400 rounded-lg min-w-[300px] mr-[100px] flex flex-col border h-full border-black bg-white'>
        <Toaster/>
      <h2 className='font-bold'>Your Groups</h2>
      <ul>
        {groups.map(group => (
          <li key={group._id} className='border border-black p-2 mt-4' onClick={() => 
          setClickedGroupId(group._id)}>
            {group.name}
            {/* <button className='ml-4' onClick={() => handleDeleteGroup(group._id)}>
                DELETE
            </button> */}
            {/* {console.log(messages[messages.length-1])} */}
            lastMessage:{  messages[messages.length-1]?.text||'No message yet...' ||lastMessage[group._id]}
          </li>

        ))}
      </ul>

      {/* Create Group Button */}
      <Button
        variant="contained"
        color="primary"
        style={{ position: 'fixed', bottom: 20, left: 160 }}
        onClick={handleClickOpen}
      >
        Create Group
      </Button>

      {/* Create Group Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create a new Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Group Description"
            fullWidth
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />

          {/* User selection for participants */}
          <h4>Select Participants:</h4>
          {allUsers.filter((user) => user._id !== userId).map(user => (
            <ListItem key={user.id} button onClick={() => handleToggleParticipant(user.id)}>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={selectedParticipants.includes(user.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={user.username || user.email} />
            </ListItem>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button onClick={handleCreateGroup} color="primary">Create Group</Button>
        </DialogActions>
      </Dialog>
    </div>
      <RightGroup clickedGroupId={clickedGroupId} setClickedGroupId={setClickedGroupId}
      groups={groups} userId={userId} lastMessage={lastMessage} setlastMessage={setlastMessage}
      
      />
      </div>
  );
};

export default LeftGroup;
