import React, { useState, useEffect, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useStatusContext } from '../context/StatusContext';
import { SocketContext } from '../context/SocketContext';
import toast, { Toaster } from 'react-hot-toast';

const LeftStory = () => {
  const [storiesByUser, setStoriesByUser] = useState({});
  const [newStoryContent, setNewStoryContent] = useState('');
  const { clickedUserId, setClickedUserId } = useStatusContext(); // Updated to handle clickedUserId
  const [loading, setLoading] = useState(false);
  const [s1,sets1]=useState(false)
  const { Authuser } = useAuthContext();
   const {socket}=useContext(SocketContext);
  // Fetch all stories when the component mounts
  useEffect(() => {
    fetchStories();
  }, []);
  useEffect(() => {
    // Listen for 'storyCreated' event
    socket.on('storyCreated', (newStory) => { 
      setStoriesByUser((prevStories) => {
        const userId = newStory.userId._id; // Get the user ID of the story creator
  
        // Update the stories in the state
        return {
          ...prevStories,
          [userId]: [...(prevStories[userId] || []), newStory],
        };
      });
      fetchStories();

    });
    socket.on('newStory', (data) => {
    if(data.story.visibility.includes(Authuser._id)){
       toast.success(data.message, {
        position: 'top-right',
        duration: 3000,
       // Duration in milliseconds
      });
    }
    else{
      toast.error('sorry you are not in the story !!! ', {
        position: 'top-right',
        duration: 3000,
       // Duration in milliseconds
      });
    }
    });
    socket.on('storyDeleted', (deletedStoryId) => {
      fetchStories();
    });
    // Cleanup the event listener when the component unmounts
    return () => {
      socket.off('storyCreated');
      socket.off('newStory');
      socket.off('storyDeleted');
    };
  }, [socket]);
  // Function to fetch stories
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/story/user/${Authuser._id}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      const data = await response.json();
    //  console.log(data);
      // Group stories by user ID
      const storiesGrouped = data.reduce((acc, story) => {
        const userId = story.userId._id; // Get the actual user ID from the userId object
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push(story);
        return acc;
      }, {});
      // console.log(storiesGrouped);
  
      // Sort stories by createdAt in ascending order for each user
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

  // Function to create a new story
  // const createStory = async () => {
  //   if (!newStoryContent.trim()) {
  //     alert('Please enter some content for your story');
  //     return;
  //   }

  //   try {
  //     const response = await fetch('http://localhost:5000/story/create-story/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         userId: Authuser._id,
  //         username: Authuser.username,
  //         content: newStoryContent,
  //         visibility: [],
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to create story');
  //     }
     
  //     // alert('Story created successfully!');
  //     setNewStoryContent('');
  //     fetchStories(); // Refresh the list of stories
  //   } catch (error) {
  //     console.error('Error creating story:', error);
  //   }
  // };


// Function to create a new story
const createStory = () => {
  if (!newStoryContent.trim()) {
    alert('Please enter some content for your story');
    return;
  }

  // Emit the event to the server
  socket.emit('createStory', {
    userId: Authuser._id,
    username: Authuser.username,
    content: newStoryContent,
    visibility: ['670fe2280ad0e102b1d42256','670ff84eb261513b586a2b94'],
  }
);
// Clear the input field after creating the story
setNewStoryContent('');
// fetchStories();
};

  return (
    <div className='p-3 border border-gray shadow-2xl mt-[-20px] font-bold shadow-blue-400 h-full w-[300px] bg-white rounded-lg'>
      <Toaster/>
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
      <button onClick={()=>{createStory()}} className='bg-blue-500 text-white p-2 rounded'>
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
            {/* {console.log(storiesByUser, " stories by user")} */}
          {Object.entries(storiesByUser).map(([userId, userStories]) => (
            <li key={userId} className='my-2' onClick={() => setClickedUserId(userId)}>
              <strong>{userStories[0].userId.username}</strong> ({userStories.length} stories)
            </li>
          ))}
        </ul>        
        )}
      </div>
    </div>
  );
};

export default LeftStory;
