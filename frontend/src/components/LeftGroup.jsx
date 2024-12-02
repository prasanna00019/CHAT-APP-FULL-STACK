import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Checkbox, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import RightGroup from './RightGroup';
import encryption from '../assets/encryption.png';
import bluetick from '../assets/blue-double.png'
import normaltick from '../assets/normal-double.png'
import { useStatusContext } from '../context/StatusContext';
import wallpaper from '../assets/wallpaper2.jpeg'
import { decryptMessage } from '../helper_functions';
import useLogout from '../hooks/useLogout';
import Trending from './Trending';
import { useAuthContext } from '../context/AuthContext';
const LeftGroup = ({ userId }) => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);  // Modal state
  const [groupName, setGroupName] = useState('');
  const { messages, setMessages } = useStatusContext();
  const { GROUP_CHAT_SECRET_KEY } = useLogout()
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [readRoute, setreadRoute] = useState(true);
  const { userMap, Authuser } = useAuthContext();
  const { GroupMap, setGroupMap } = useAuthContext()
  const [clickedGroupId, setClickedGroupId] = useState(null);
  const [lastMessage, setlastMessage] = useState({})
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  const highlightQuery = (name, query) => {
    if (!query) return name;

    const regex = new RegExp(`(${query})`, 'i'); // Case-insensitive match
    const parts = name.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} style={{ color: 'green', fontWeight: 'bold' }}>
              {part}
            </span>
          ) : (
            <span key={index} style={{ color: 'black' }}>
              {part}
            </span>
          )
        )}
      </span>
    );
  };
  const handleToggle = (t) => {
    if (t == 1) {
      setreadRoute(true);
    }
    else if (t == 2) {
      setreadRoute(false);
    }
  }
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/group/get-groups/${userId}`);
      setGroups(res.data);
      const mappedGroups = res.data.reduce((acc, group) => {
        acc[group._id] = group.name; // or use `user` if you want the full object
        return acc;
      }, {});
      setGroupMap(mappedGroups);
      // console.log(mappedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  useEffect(() => {
    fetchGroups();
  }, [userId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/users/');
        setAllUsers(res.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    const lastMessageOfAllGroups = async () => {
      try {
        const res = await axios.get('http://localhost:5000/group/getLastMessage')
        const lastMessageMap = res.data.reduce((acc, group) => {
          // console.log(group._id, group.lastMessage.text,group)
          acc[group._id] = group.lastMessage?.text;
          // acc[group?.sender]=group.lastMessage?.sender
          return acc;
        }, {});
        setlastMessage(lastMessageMap);
      }
      catch (error) {
        console.log(error)
      }
    }
    fetchUsers();
    lastMessageOfAllGroups();
  }, []);
  useEffect(() => {
    const lastMessageOfAllGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/group/getLastMessage/${userId}`);
        const lastMessageMap = res.data.reduce((acc, group) => {
          acc[group._id] = {
            lastMessage: group.lastMessage,
            // unreadCount: group.unreadCount,
          };
          return acc;
        }, {});
        console.log(lastMessageMap);
        setlastMessage(lastMessageMap);
      } catch (error) {
        console.error("Error fetching last messages:", error);
      }
    }
    lastMessageOfAllGroups();
  }, [messages])
  const handleClickOpen = () => {
    setOpen(true);
  }
  const handleClose = () => {
    setOpen(false)
  };
  const handleToggleParticipant = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
    // console.log(selectedParticipants);
  };
  const handleDeleteGroup = async (groupId) => {
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
        admins: [userId],
        createdBy: userId,
      };
      await axios.post('http://localhost:5000/group/create-group', newGroup);
      setOpen(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response.data.message)
    }
  };
  return (
    <div className='flex max-w-full' >
      <div style={{ padding: '20px', backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }} className='
    shadow-2xl shadow-green-400 rounded-lg min-w-[300px] mr-[100px] flex flex-col border h-full border-black bg-white'>
        <Toaster />
        <div className="search-container flex flex-col gap-1 justify-around">
          <div className='flex gap-2 justify-around'>
            <button className='bg-green-300 text-green-600 rounded-full p-1' onClick={() => { handleToggle(1) }}>CHATS</button>
            <button className='bg-green-300 text-green-600 rounded-full p-1' onClick={() => { handleToggle(2) }} >UNREAD</button>
          </div>
          <input
            type="text"
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input border border-black rounded-full mb-1 p-2 w-full"
          />
        </div>
        <ul className='border border-black p-2 mt-1 '>
          {groups.filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))?.map(group => (
            <li key={group._id} className='shadow-2xl border border-black p-2 mt-3 bg-white flex flex-col' onClick={() =>
              setClickedGroupId(group._id)}>
              <div className='flex gap-3'>
                <img src={group.groupIcon ? group.groupIcon : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} width={50} height={20} alt="" />
                <p> {highlightQuery(group.name, searchQuery)}</p>
              </div>
              <div className='flex gap-1 justify-around'>
                {/* <span>
        {lastMessage?.[group._id]?.status?.every(status => status.state === 'read') ? (
          <img src={bluetick} width={30} height={10} alt="Read by all" />
        ) : lastMessage?.[group._id]?.status?.every(status => status.state === 'delivered' || status.state === 'read') ? (
          <img src={normaltick} width={30} height={10} alt="Delivered to all" />
        ) : (
          <span>✔</span>
        )}
       </span> */}
                <p> {decryptMessage(lastMessage?.[group._id]?.lastMessage?.text, GROUP_CHAT_SECRET_KEY)?.length > 10 ? decryptMessage(lastMessage?.[group._id]?.lastMessage?.text, GROUP_CHAT_SECRET_KEY)?.slice(0, 10) + '...' :
                  decryptMessage(messages?.[messages.length - 1]?.text, GROUP_CHAT_SECRET_KEY) ||
                  'No message yet...'}</p>
                <p className='bg-green-500 rounded-full w-[25px]'>{
                  //  lastMessage?.[group._id]?.unreadCount

                }</p>

              </div>
              {console.log(lastMessage)}
            </li>
          ))}
        </ul>
        <div className='flex gap-2'>
          <img src={encryption} height={30} width={80} alt="" />
          <p className="italic text-gray-600 font-extrabold   mt-5">YOUR MESSAGES ARE END TO END ENCRYPTED</p>
        </div>
        <Trending clickedGroupId={clickedGroupId} setClickedGroupId={setClickedGroupId} />
        <Button
          variant="contained"
          color="primary"
          style={{ position: 'fixed', bottom: 20, left: 160 }}
          onClick={handleClickOpen}
        >
          Create Group
        </Button>
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
            {/* {console.log(userId)} */}
            <h4>Select Participants:</h4>
            {
              //  console.log(allUsers.filter((user) => user._id !== userId))
              allUsers.filter((user) => user._id !== userId).map(user => (
                <ListItem key={user._id} button onClick={() => handleToggleParticipant(user.id)}>
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
