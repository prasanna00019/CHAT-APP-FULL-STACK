import React, { useContext, useEffect, useState } from 'react';
import { useStatusContext } from '../context/StatusContext';
import { SocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
import eye from '../assets/eye.png';
import red from '../assets/red.png';
import GreenHeart from '../assets/heart-green.png';
import emptyLike from '../assets/green-love.png'
import toast, { Toaster } from 'react-hot-toast';
import Viewers from './Viewers';
import { Button, TextField } from '@mui/material';
import { encryptMessage } from '../helper_functions';
import useLogout from '../hooks/useLogout';
const RightStory = () => {
  const { setClickedUserId, clickedUserId } = useStatusContext();
  const [stories, setStories] = useState([]);
  const secretKey = '!@#$%^y7gH*3xs';
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const [ClickLike, setClickLike] = useState(false);
  const [progress, setProgress] = useState(0);
  const { socket } = useContext(SocketContext);
  const { Authuser ,userMap} = useAuthContext();
  const displayDuration = 3000; 
  const {GROUP_CHAT_SECRET_KEY}=useLogout()
  const [viewers, setViewers] = useState([]); 
  const [NumLikes, setNumLikes] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const fetchViewers = async (storyId) => {
    try {
      console.log(storyId, ' here error is there .... update the state ');
      if (!storyId) return
      const response = await fetch(`http://localhost:5000/story/viewers/${storyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch viewers');
      }
      const data = await response.json();
      setViewers(data);
    } catch (error) {
      console.error('Error fetching viewers:', error);
    }
  };
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const encyptmsg = encryptMessage(newMessage, secretKey);
    const messageData = {
      sender: Authuser._id,
      receiver: clickedUserId,
      message: encyptmsg,
      reply: null,
      type: "story",
    }
    console.log(clickedUserId)
    console.log(messageData)
    socket.emit('sendMessageOneToOne', messageData);
    setNewMessage('');
    setIsPaused(false);
    toast.success('Message sent', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#333',
        color: '#fff',
      },
    })
  }
  useEffect(() => {
    if (clickedUserId && stories.length > 0) {
      const currentStoryId = stories[currentStoryIndex]._id;
      fetchViewers(currentStoryId); 
    }
  }, [clickedUserId, currentStoryIndex, stories]);
  const updateViewCount = (storyId, userId) => {
    socket.emit('viewStory', { storyId, userId });
    setViewers((prevViewers) => [
      ...prevViewers,
      { userId: userId, viewedAt: new Date() },
    ]);
  };
  useEffect(() => {
    socket.on('newStory', (data) => {
      if (data.story.visibility.includes(Authuser._id)) {
          toast.success(`NEW STORY ADDED`, {
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          })   
      }
      else {
        toast.error('sorry you are not in the story !!! ', {
          position: 'top-right',
          duration: 3000,
          // Duration in milliseconds
        });
      }
    });
    socket.on('storyDeleted', (deletedStoryId) => {
      toast.success(`STORY DELETED`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
    });
    socket.on('updateViewers', ({ storyId, viewers }) => {
      console.log(storyId, ' storyID ');
      toast.success(`VIEWERS UPDATED`, {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      console.log(viewers.length, " viewers length")
      setViewers((prevViewers) => [
        ...prevViewers,
        { userId: viewers[viewers.length - 1].userId, viewedAt: new Date() },
      ]);
      if (stories[currentStoryIndex]?._id === storyId) {
        updateViewCount(storyId, Authuser._id);
        fetchViewers(storyId);
      }
    });
    socket.on('updateLikes', (data) => {
      // console.log(data, ' likes data');
      setStories((prevStories) => {
        const updatedStories = prevStories.map((story) => {
          if (story._id === data._id) {
            return data;
          }
          return story;
        });
        return updatedStories;
      })
      if (stories[currentStoryIndex]?._id === data._id) {
        toast.success(`LIKES UPDATED`, {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
      }
    });
    // Cleanup the socket listener when the component is unmounted
    return () => {
      socket.off('storyDeleted');
      socket.off('newStory');
      socket.off('updateLikes');
      socket.off('updateViewers');
    };
  }, [socket]);
  const handleLikeStory = () => {
    const storyId = stories[currentStoryIndex]?._id;
    if (!storyId) return;
    socket.emit('likeStory', { storyId, userId: Authuser._id });
    setClickLike(!ClickLike); // toggle the like state
   if(ClickLike){ 
   setNumLikes((prevNumLikes) => prevNumLikes + 1);
  }
  else{
    setNumLikes((prevNumLikes) => prevNumLikes - 1);
  }
  };
  useEffect(() => {
    if (clickedUserId && stories.length > 0) {
      updateViewCount(stories[currentStoryIndex]._id, Authuser._id);
    }
    if (currentStoryIndex === stories.length - 1) {
      setClickedUserId(null);
    }
  }, [clickedUserId, currentStoryIndex, setClickedUserId, stories]);
  useEffect(() => {
    if (clickedUserId && stories.length > 0) {
      fetchUserStories(clickedUserId);
    }
  }, [clickedUserId])
  const fetchUserStories = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/story/all/${userId}/${Authuser._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      let data = await response.json();
      setStories(data);
      setCurrentStoryIndex(0);
      setIsVisible(true);
      setProgress(0);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };
  useEffect(() => {
    if (clickedUserId) {
      fetchUserStories(clickedUserId);
    }
  }, [clickedUserId]);

  // Handle the progress bar animation for each story
  useEffect(() => {
    if (isVisible && stories.length > 0 && !isPaused) {
      // Fetch the viewers list
      const interval = setInterval(() => {
        setProgress((prev) => prev + 100 / (displayDuration / 100));
      }, 100);

      const timeout = setTimeout(() => {
        if (currentStoryIndex < stories.length - 1) {
          setProgress(0); // Reset progress for the next story
          setCurrentStoryIndex((prev) => prev + 1);
        } else {
          setIsVisible(false); // Hide the stories after the last one
        }
      }, displayDuration);

      // Cleanup intervals and timeouts
      return () => {
        // setClickedUserId(null);
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, currentStoryIndex, stories, isPaused]);

  // Function to handle eye icon click
  const handleEyeClick = () => {
    setIsPaused(!isPaused); // Toggle paused state
    if (!isPaused) {
      fetchViewers(stories[currentStoryIndex]._id);
    }
  };

  const deleteStory = () => {
    if (stories.length > 0) {
      const storyToDelete = stories[currentStoryIndex];
      socket.emit('deleteStory', storyToDelete._id); // Emit event to delete story on the server
      setStories((prevStories) => prevStories.filter(story => story._id !== storyToDelete._id)); // Update local state
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex((prevIndex) => prevIndex - 1); // Move to the previous story if available
      } else {
        setIsVisible(false); // Hide the stories if no stories left
      }
    }
  };
  if (!isVisible || stories.length === 0) {
    return (
      <div className='border border-gray shadow-blue-300 mt-[-20px] border-black font-bold shadow-2xl h-full w-[700px] bg-white rounded-lg'>
        RIGHT STORY DISPLAY
      </div>
    ); // Display a default right story div initially
  }

  const currentStory = stories[currentStoryIndex];
  const isLikedByUser = currentStory.likes.some(like => like.userId === Authuser._id);

  return (
    <div style={{ backgroundColor: `${currentStory.backgroundColor}` }} className='border border-gray shadow-blue-300 mt-[-20px] border-black font-bold shadow-2xl h-full w-[700px] bg-white rounded-lg'>
      {/* Progress bar */}
      <Toaster />
      <div
        className='h-1 bg-blue-500 rounded'
        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
      ></div>
      {/* Eye Icon */}
      {currentStory.userId === Authuser._id &&
        <button
          className='mt-4 p-2 text-white rounded'
          onClick={deleteStory}
        >
          <img src={red} width={20} height={20} alt="" />
        </button>}
      {
        currentStory.userId === Authuser._id &&
        <div className="flex justify-end p-2">
          <img src={eye} width={20} height={20} onClick={handleEyeClick} className={`cursor-pointer ${isPaused ? 'text-red-500' : 'text-blue-500'}`} />
        </div>}
      {/* Story content */}
      <div className='p-4'>
        {/* <h3 className='text-xl mb-2'>{currentStory.username}'s Story</h3> */}
        <h3>{userMap[currentStory.userId]}</h3>
        <p>{currentStory.content}</p>
        <TextField
          label="Type your message..."
          fullWidth
          value={newMessage}
          onFocus={() => {setIsPaused(true);socket.emit('register', Authuser._id);}} 
          onBlur={() => setIsPaused(false)} // Set paused to false on blur

          onChange={(e) => { setNewMessage(e.target.value); }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          />
             <Button onClick={handleSendMessage} variant="contained" color="primary">
          Send
        </Button> 
        <div>{
  currentStory.media && <img src={currentStory.media} width={300} height={300} alt="" />}</div>
        <div className="flex items-center gap-4">
          {/* {console.log(currentStory.likes)} */}
          {
  !NumLikes ? <img src={emptyLike} onClick={handleLikeStory} alt="Like" width={20} height={20} /> :
    <img src={GreenHeart} onClick={handleLikeStory} alt="Like" width={20} height={20} />
}
          {/* <img onClick={()=>{handleLikeStory(); setClickLike(!ClickLike) }} src={ClickLike ? GreenHeart : emptyLike} alt="Like" width={20} height={20} /> */}

          <span>{NumLikes} Likes</span>        </div>
      </div>

      {/* Viewers List */}
      {isPaused && (
        <div className="p-4">
          <h4 className='text-lg mb-2'>Viewers:</h4>
          <Viewers viewers={viewers} isLikedByUser={isLikedByUser} NumLikes={NumLikes} />
        </div>
      )}
    </div>
  );
};

export default RightStory;

