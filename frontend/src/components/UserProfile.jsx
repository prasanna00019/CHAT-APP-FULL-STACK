import React, { useEffect, useState, useMemo } from 'react';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';
import { db, storage } from '../../../backend/utils/FireBase';
import toast from 'react-hot-toast';
// import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Link } from 'react-router-dom';
import user_empty from '../assets/user_empty.png';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
const UserProfile = () => {
  const { Authuser } = useAuthContext();

  const [userDetails, setUserDetails] = useState(null);
  const [showOnline, setShowOnline] = useState(false);
  const [showLastSeen, setShowLastSeen] = useState(false);
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
    fontSize: '18px', // font size
    fontWeight: 'bold', // font weight
    padding: '16px', // padding
    borderRadius: '10px', // border radius
    backgroundColor: 'red', // background color
    color: '#fff', // text color
    boxShadow: '0px 0px 10px rgba(0,0,0,0.2)', // box shado
  }
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a new file name (e.g., with a timestamp)
    const newFileName = `${Authuser}.png`;
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
        // Get the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Update the profile picture URL in Firestore
        try {
          const userRef = doc(db, 'users', Authuser);
          await updateDoc(userRef, { profilePic: downloadURL });

          // Update the state to show the new profile picture
          setUserDetails((prevDetails) => ({
            ...prevDetails,
            profilePic: downloadURL,
          }));

          console.log('Profile photo updated successfully');
        } catch (error) {
          console.error('Failed to update profile photo:', error);
        }
      }
    );
  };
  function convertFirebaseTimestamp(firebaseTimestamp) {
    // Check if the input is a Firestore.Timestamp
    if (firebaseTimestamp && firebaseTimestamp.seconds) {
      // Convert the Firestore timestamp to milliseconds
      const date = new Date(firebaseTimestamp.seconds * 1000);

      // Format the date to a readable string
      return date.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      return "Invalid Timestamp";
    }
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userRef = doc(db, 'users', Authuser);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        setUserDetails(data);
        setShowOnline(data.showOnline);
        setShowLastSeen(data.showLastSeen);
      } else {
        console.log('No such user!');
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
    const newFileName = `${Authuser}.png`; // Adding timestamp to the original file name
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
    <div className="user-profile flex flex-col gap-5">
      <h3>BACK TO CHAT</h3>
      <h1>User Profile</h1>
      {/* Profile image with onClick to trigger file input */}
      <img
        src={userDetails.profilePic || user_empty}
        width={50}
        className="m-auto cursor-pointer"
        height={50}
        alt="Profile"
        onClick={() => document.getElementById('profilePhotoInput').click()}
      />

      {/* Hidden file input for changing profile photo */}
      <input
        type="file"
        id="profilePhotoInput"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleProfilePhotoChange}
      />
      <Link to="/" />
      <h2>USERNAME: {userDetails.username}</h2>
      <p>Email: {userDetails.email}</p>
      <h2>LAST SEEN: {userDetails.lastSeen}</h2>
      <h2>ACCOUNT CREATED AT: {convertFirebaseTimestamp(userDetails.createdAt)}</h2>

      <div>
        <label>
          <input
            type="checkbox"
            checked={showOnline}
            onChange={() => setShowOnline(!showOnline)}
          />
          Show Online Status
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={showLastSeen}
            onChange={() => setShowLastSeen(!showLastSeen)}
          />
          Show Last Seen
        </label>
      </div>

      <div>
        <h3>Upload Chat Theme</h3>
        <input type="file" accept="image/*" onChange={handleThemeUpload} />
        {themeImage && <img src={themeImage} alt="Uploaded Theme" style={{ maxWidth: '50%', margin: 'auto', marginTop: '20px' }} />}
      </div>
      <button onClick={() => deleteFile(`chatThemes/${Authuser}.png`)}>DELETE CURRENT CHAT IMAGE</button>
    </div>
  );
};

export default UserProfile;
