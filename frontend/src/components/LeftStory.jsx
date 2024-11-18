import React, { useState, useEffect, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import { SocketContext } from '../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import a1 from '../assets/a1.svg'
import { Button, Checkbox, Dialog, DialogActions, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const LeftStory = ({userId}) => {
  const [storiesByUser, setStoriesByUser] = useState({});
  const [newStoryContent, setNewStoryContent] = useState('');
  const storage = getStorage();
  const { clickedUserId, setClickedUserId } = useStatusContext(); // Updated to handle clickedUserId
  const [loading, setLoading] = useState(false);
  const [s1, sets1] = useState(false)
  const [image, setImage] = useState(null);
  const navigate=useNavigate();
  const { Authuser } = useAuthContext();
  const [allUsers, setAllUsers] = useState([]);
  const [open,setOpen]= useState(false);
  const { socket } = useContext(SocketContext);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const handleClickOpen = () => {
    setOpen(true);
  }
  const handleClose = () => {
    setOpen(false)
  };
  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/users/');
      setAllUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
    fetchStories();
    fetchUsers();
  }, []);
  useEffect(() => {
    socket.on('storyCreated', (newStory) => {
      setStoriesByUser((prevStories) => {
        const userId = newStory.userId._id; 
        return {
          ...prevStories,
          [userId]: [...(prevStories[userId] || []), newStory],
        };
      });
      fetchStories();
    });
    socket.on('newStory', (data) => {
      if (data.story.visibility.includes(Authuser._id)) {
        toast.success(data.message, {
          position: 'top-right',
          duration: 3000,
         
        });
      }
      else {
        toast.error('sorry you are not in the story !!! ', {
          position: 'top-right',
          duration: 3000,
        });
      }
    });
    socket.on('storyDeleted', (deletedStoryId) => {
      fetchStories();
    });
    return () => {
      socket.off('storyCreated');
      socket.off('newStory');
      socket.off('storyDeleted');
    };
  }, [socket]);
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/story/user/${Authuser._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      const data = await response.json();
      const storiesGrouped = data.reduce((acc, story) => {
        const userId = story.userId._id; 
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(story);
        return acc;
      }, {});
      for (const userId in storiesGrouped) {
        storiesGrouped[userId].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
      setStoriesByUser(storiesGrouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };
  const createStory = () => {
    if (!newStoryContent.trim()) {
      alert('Please enter some content for your story');
      return;
    }
    handleClickOpen();
    // fetchStories();
  };
  
const handleToggleParticipant = (userId) => {
  const isSelected = selectedParticipants.includes(userId);
  if (isSelected) {
    setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
  } else {
    setSelectedParticipants([...selectedParticipants, userId]);
  }
};
 const handleBroadcast=async()=>{
   let url='';
  if (image) {
    const imageRef = ref(storage, `images/${image.name}`);
    await uploadBytes(imageRef, image);
    url = await getDownloadURL(imageRef);
    console.log(url);
    // setImageURL(url);
    // console.log(imageURL,' image url');
  }
  const selectedUsers = allUsers.filter((user) => selectedParticipants.includes(user.id));
    const visibility = selectedUsers.map((user) => user._id);
    // Emit the event to the server
    socket.emit('createStory', {
      userId: Authuser._id,
      username: Authuser.username,
      content: newStoryContent,
      media: url,
      visibility,
    }
    );
    setNewStoryContent('');
    handleClose();
    setSelectedParticipants([]);
 }
 
  return (
    <div className='p-3 border border-gray shadow-2xl mt-[-20px] font-bold shadow-blue-400 h-full w-[300px] bg-white rounded-lg'>
      <Toaster />
      <h2>LEFT USERS FOR STORIES</h2>
      <hr />
      <p>My Story</p>
      <input
        type='text'
        placeholder='Write your story...'
        value={newStoryContent}
        onChange={(e) => setNewStoryContent(e.target.value)}
        className='w-full p-2 my-2 border rounded'
      />
      <button onClick={() => { createStory() }} className='bg-blue-500 text-white p-2 rounded'>
        Create Story
      </button>
      <hr />
      <div className='h-[100px]'></div>
      <hr />
      <div>
        <h3>Other Users' Stories</h3>
        {loading ? (
          <p>Loading stories...</p>
        ) : (
          <ul>
            {Object.entries(storiesByUser).map(([userId, userStories]) => (
              <li key={userId} className='my-2' onClick={() => setClickedUserId(userId)}>
                <strong>{userStories[0].userId.username}</strong> ({userStories.length} stories)
              </li>
            ))}
          </ul>
        )}
      </div>
      <Dialog open={open} onClose={handleClose}>
            <h4>Select Participants to broadcast:
              {console.log(allUsers)}
            </h4>
            {allUsers.map(user => (
              <ListItem key={user._id} button onClick={() => handleToggleParticipant(user._id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedParticipants.includes(user._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={user.username || user.email} />
              </ListItem>
            ))}
              <input type="file" onChange={handleImageChange} />
          <DialogActions>
            <Button onClick={handleClose} color="secondary">Cancel</Button>
            {/* <Button onClick={handleCreateGroup} color="primary">Create Group</Button> */}
            <Button onClick={handleBroadcast} color="primary">Broadcast</Button>
          </DialogActions>
        </Dialog>
    </div>
  );
};

export default LeftStory;
