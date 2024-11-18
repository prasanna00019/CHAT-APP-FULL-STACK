import React from 'react';
import reply from '../assets/a3.svg'
const LoadingScreen = ({ isFading }) => (
  <div style={{ ...loadingScreenStyle, opacity: isFading ? 0 : 1 }}>
    <img src={reply}  alt="Loading..."/>
  </div>
);
const loadingScreenStyle = {
  position: 'fixed',
  width: '100%',
  height: '100%',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  transition: 'opacity 0.5s ease', // Smooth transition
};
export default LoadingScreen;
