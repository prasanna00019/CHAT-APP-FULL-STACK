import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useAuthContext } from '../context/AuthContext';
// import {storage } from '../../../backend/utils/FireBase';
import toast from 'react-hot-toast';
import user_empty from '../assets/user_empty.png';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { SocketContext } from '../context/SocketContext';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { storage } from '../../FireBase';
// import { ref } from 'firebase/storage';
const UserProfile = () => {
  const { Authuser ,setAuthuser} = useAuthContext();
 const {socket}=useContext(SocketContext);
  const [userDetails, setUserDetails] = useState(null);
  const [showOnline, setShowOnline] = useState(Authuser.ShowOnline);
  const [showLastSeen, setShowLastSeen] = useState(Authuser.ShowLastSeen);
  const [showReadReceipts, setReadReceipts] = useState(Authuser.ReadReceipts);
  const [themeImage, setThemeImage] = useState(null);
  const customTheme = {
    fontSize: '18px', // font size
    fontWeight: 'bold', // font weight
    padding: '16px', // padding
    borderRadius: '10px', // border radius
    backgroundColor: 'blue', // background color
    color: '#fff', // text color
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
  }
  const customErrorTheme = {
    fontSize: '18px',
    fontWeight: 'bold', // font weight
    padding: '16px', // padding
    borderRadius: '10px', // border radius
    backgroundColor: 'red', // background color
    color: '#fff', // text color
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
  }
  useEffect(()=>{
      socket.on('ChangedPhoto',({user,downloadURL})=>{
        setAuthuser(user);
      }
    )
    socket.on('UpdatedLastSeen',(data)=>{
      setAuthuser(data);
    })
    socket.on('UpdatedReadReceipts',(data)=>{
      // console.log(data);
      setAuthuser(data);
    })
    socket.on('UpdatedOnlineStatus',(data)=>{
      setAuthuser(data);
    })
    return ()=>{
      socket.off('ChangedOnlineStatus');
      socket.off('ChangedPhoto');
      socket.off('UpdatedReadReceipts');
      socket.off('UpdatedLastSeen');
    }
  },[socket]);
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a new file name (e.g., with a timestamp)
    const newFileName = `${Authuser._id}.png`;
    const storageRef = ref(storage, `profilePhotos/${newFileName}`);

    // Upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error('Upload failed:', error);
      },
      async () => {
       socket.emit('ProfilePhotoChanged',{Authuser,downloadURL:await getDownloadURL(uploadTask.snapshot.ref)})
      }
    );
    
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
        try{
          const res=await fetch('http://localhost:5000/users/'+Authuser._id);
          const data=await res.json();
          setUserDetails(data);
          setThemeImage(data.profilePic);
        }
        catch(error){
         console.log(error);
        }
    };

    fetchUserDetails();
  }, [Authuser]);
  const deleteFile = async (filePath) => {
    const fileRef = ref(storage, filePath); // File path in Firebase Storage

    try {
      await deleteObject(fileRef);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };
  const handleThemeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFileName = `${Authuser._id}.png`; // Adding timestamp to the original file name
    const storageRef = ref(storage, `chatThemes/${newFileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error('Upload failed:', error);
        toast.error('Failed to upload chat theme', { style: customErrorTheme });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('File available at', downloadURL);
        toast.success('Chat theme uploaded successfully!', { style: customTheme });

        // Optionally update user profile with the new chat theme URL
        setThemeImage(downloadURL);
      }
    );
  };

  const userMemo = useMemo(() => userDetails, [userDetails]);

  if (!userDetails) return <div>Loading...</div>;
return (
  <div style={styles.container} className='overflow-y-scroll' >
    <Button variant="contained" color="primary" onClick={() => window.history.back()}>
      Back to Chat
    </Button>
    <Typography variant="h4" style={styles.heading}>
      User Profile
    </Typography>
    <Avatar
      src={userDetails.profilePic || '/default-avatar.png'}
      alt="Profile"
      sx={{ width: 80, height: 80, cursor: 'pointer', margin: '10px auto' }}
      onClick={() => document.getElementById('profilePhotoInput').click()}
    />

    {/* Hidden File Input for Profile Photo */}
    <input
      type="file"
      id="profilePhotoInput"
      style={{ display: 'none' }}
      accept="image/*"
      onChange={handleProfilePhotoChange}
    />

    <Typography  variant="h5">Username: {userDetails.username}</Typography>
    <Typography variant="h5">Email: {userDetails.email}</Typography>
    <Typography variant="h5">
      Last Seen: {userDetails.lastSeen === null ? 'ONLINE' : userDetails.lastSeen}
    </Typography>
    <Typography variant="h5">
      Account Created At: {userDetails.createdAt}
    </Typography>

    {/* Switch Toggles */}
    <div style={styles.switchContainer}>
      <Typography variant="body1">Show Online Status</Typography>
      <Switch
        checked={showOnline}
        onChange={() =>{ setShowOnline(!showOnline);
          socket.emit('UpdateOnlineStatus', { userId: Authuser._id, onlineStatus: !showOnline });
        }}
        color="primary"
      />
    </div>

    <div style={styles.switchContainer}>
      <Typography variant="body1">Show Last Seen</Typography>
      <Switch
        checked={showLastSeen}
        onChange={() => {setShowLastSeen(!showLastSeen);
          socket.emit('UpdateLastSeen', { userId: Authuser._id, lastSeen: !showLastSeen });
        }}
        color="primary"
      />
    </div>

    <div style={styles.switchContainer}>
      <Typography variant="body1">Read Receipts</Typography>
      <Switch
        checked={showReadReceipts} // Assuming you might have a separate state for read receipts
        onChange={() => {setReadReceipts(!showReadReceipts); 
          socket.emit('UpdateReadReceipts', { userId: Authuser._id, readReceipts: !showReadReceipts });
        }}
        color="primary"
      />
    </div>

    {/* Chat Theme Upload */}
    <div style={styles.themeUpload}>
      <Typography variant="body1" gutterBottom>
        Upload Chat Theme
      </Typography>
      <input type="file" accept="image/*" onChange={handleThemeUpload} style={styles.fileInput} />
    </div>

    <Button
      variant="outlined"
      color="secondary"
      onClick={() => deleteFile(`chatThemes/${userDetails.userID}.png`)}
    >
      Delete Current Chat Image
    </Button>
  </div>
);
};

const styles = {
container: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#f2f2f2',
  gap: '15px',
  width:'500px',
  marginTop:'40px',
  maxWidth: '1300px',
  maxHeight:'700px',
  margin: '20px auto',
  marginTop: '-10px',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: '10px',
  backgroundColor: '#f9f9f9',
},
heading: {
  fontWeight: '600',
  color: '#3f51b5',
},
switchContainer: {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  padding: '5px 0',
},
themeUpload: {
  width: '100%',
  textAlign: 'center',
  margin: '15px 0',
},
fileInput: {
  width: '100%',
  padding: '10px 0',
},
};

export default UserProfile;