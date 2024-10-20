// import React, { useContext, useEffect, useState } from 'react';
// import { useStatusContext } from '../context/StatusContext';
// import { SocketContext } from '../context/SocketContext';
// import { useAuthContext } from '../context/AuthContext';

// const RightStory = () => {
//   const { setClickedUserId, clickedStoryId, clickedUserId } = useStatusContext(); // clickedUserId for fetching all stories of the user
//   const [stories, setStories] = useState([]);
//   const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
//   const [isVisible, setIsVisible] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const {socket} = useContext(SocketContext); // Assuming you have a SocketContext
//   const {Authuser}=useAuthContext();
//   const displayDuration = 3000; // 3 seconds per story

//   // Fetch all stories for the clicked user in ascending order
//   const updateViewCount = (storyId, userId) => {
//     socket.emit('viewStory', { storyId, userId });
//   };
//   useEffect(() => {
//     // console.log(stories ,stories.length)
//     if (clickedUserId && stories.length > 0) {
//       // console.log(currentStoryIndex)
//       console.log(stories[currentStoryIndex]._id);
//       updateViewCount(stories[currentStoryIndex]._id, Authuser._id);
//     }
//     if(currentStoryIndex===stories.length-1){
//       // setCurrentStoryIndex(0);
//       // setProgress(0);
//       // setIsVisible(false);
//       setClickedUserId(null);
//     }
//      console.log(clickedUserId);
//   }, [clickedUserId, currentStoryIndex,setClickedUserId,setCurrentStoryIndex,stories ]);
//   const fetchUserStories = async (userId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/story/user/${userId}`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch stories');
//       }
//       const data = await response.json();
//       setStories(data);
//       setCurrentStoryIndex(0);
//       setIsVisible(true);
//       setProgress(0);
//     } catch (error) {
//       console.error('Error fetching stories:', error);
//     }
//   };

//   // Fetch stories whenever clickedUserId changes
//   useEffect(() => {
//     if (clickedUserId) {
//       fetchUserStories(clickedUserId);
//     }
//   }, [clickedUserId]);

//   // Handle the progress bar animation for each story
//   useEffect(() => {
//     if (isVisible && stories.length > 0) {
//       const interval = setInterval(() => {
//         setProgress((prev) => prev + 100 / (displayDuration / 100));
//       }, 100);

//       const timeout = setTimeout(() => {
//         if (currentStoryIndex < stories.length - 1) {
//           setProgress(0); // Reset progress for the next story
//           setCurrentStoryIndex((prev) => prev + 1);
//         } else {
//           setIsVisible(false); // Hide the stories after the last one
//         }
//       }, displayDuration);

//       // Cleanup intervals and timeouts
//       return () => {
//         // setClickedUserId(null);
//         clearInterval(interval);
//         clearTimeout(timeout);
//         // setClickedUserId(null);
//       };
//     }
//   }, [isVisible, currentStoryIndex, stories]);

//   if (!isVisible || stories.length === 0) {
//     return (
//       <div className='border border-gray shadow-blue-300 mt-[-20px] border-black font-bold shadow-2xl h-full w-[700px] bg-white rounded-lg'>
//         RIGHT STORY DISPLAY
//       </div>
//     ); // Display a default right story div initially
//   }

//   const currentStory = stories[currentStoryIndex];

//   return (
//     <div style={{ backgroundColor: `${currentStory.backgroundColor}` }} className='border border-gray shadow-blue-300 mt-[-20px] border-black font-bold shadow-2xl h-full w-[700px] bg-white rounded-lg'>
//       {/* Progress bar */}
//       <div
//         className='h-1 bg-blue-500 rounded'
//         style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
//       ></div>

//       {/* Story content */}
//       <div className='p-4'>
//         <h3 className='text-xl mb-2'>{currentStory.username}'s Story</h3>
//         <p>{currentStory.content}</p>
//       </div>
//     </div>
//   );
// };

// export default RightStory;

import React, { useContext, useEffect, useState } from 'react';
import { useStatusContext } from '../context/StatusContext';
import { SocketContext } from '../context/SocketContext';
import { useAuthContext } from '../context/AuthContext';
// import { FaEye } from 'react-icons/fa'; // Import an eye icon from react-icons
import eye from '../assets/eye.png';
const RightStory = () => {
  const { setClickedUserId, clickedStoryId, clickedUserId } = useStatusContext();
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { socket } = useContext(SocketContext);
  const { Authuser } = useAuthContext();
  const displayDuration = 3000; // 3 seconds per story
  const [viewers, setViewers] = useState([]); // State for viewers list
  const [isPaused, setIsPaused] = useState(false); // State to track if progress is paused

  // Fetch all stories for the clicked user in ascending order
  const updateViewCount = (storyId, userId) => {
    socket.emit('viewStory', { storyId, userId });
  };

  useEffect(() => {
    if (clickedUserId && stories.length > 0) {
      updateViewCount(stories[currentStoryIndex]._id, Authuser._id);
    }
    if (currentStoryIndex === stories.length - 1) {
      setClickedUserId(null);
    }
  }, [clickedUserId, currentStoryIndex, setClickedUserId, stories]);

  const fetchUserStories = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/story/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }
      const data = await response.json();
      setStories(data);
      setCurrentStoryIndex(0);
      setIsVisible(true);
      setProgress(0);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  // Fetch stories whenever clickedUserId changes
  useEffect(() => {
    if (clickedUserId) {
      fetchUserStories(clickedUserId);
    }
  }, [clickedUserId]);

  // Handle the progress bar animation for each story
  useEffect(() => {
    if (isVisible && stories.length > 0 && !isPaused) {
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
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isVisible, currentStoryIndex, stories, isPaused]);

  // Function to handle eye icon click
  const handleEyeClick = () => {
    setIsPaused(!isPaused); // Toggle paused state
    if (!isPaused) {
      // If unpausing, fetch viewers for the current story
      setViewers(currentStory.viewers || []); // Assuming `viewers` is part of the current story data
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

  return (
    <div style={{ backgroundColor: `${currentStory.backgroundColor}` }} className='border border-gray shadow-blue-300 mt-[-20px] border-black font-bold shadow-2xl h-full w-[700px] bg-white rounded-lg'>
      {/* Progress bar */}
      <div
        className='h-1 bg-blue-500 rounded'
        style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
      ></div>

      {/* Eye Icon */}
      <div className="flex justify-end p-2">
        <img src={eye} width={20} height={20} onClick={handleEyeClick} className={`cursor-pointer ${isPaused ? 'text-red-500' : 'text-blue-500'}`} />
       {/* <img src={eye} on  alt="" /> */}
      </div>

      {/* Story content */}
      <div className='p-4'>
        <h3 className='text-xl mb-2'>{currentStory.username}'s Story</h3>
        <p>{currentStory.content}</p>
      </div>

      {/* Viewers List */}
      {isPaused && viewers.length > 0 && (
        <div className="p-4">
          <h4 className='text-lg mb-2'>Viewers:</h4>
          <ul>
            {viewers.map((viewer) => (
              <li key={viewer.userId} className='flex flex-col gap-2'> 
               <div className='flex flex-col gap-1 border border-black p-2 bg-zinc-300'>
               <span>{viewer.userId}</span> 
               <span> {new Date(viewer.viewedAt).toLocaleString()}</span> 
                </div> 
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RightStory;
