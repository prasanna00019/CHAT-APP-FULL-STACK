import React, { useState, useRef, useEffect } from 'react';
import './DotsMenu.css'; // Optional: for custom styling
import { useNavigate } from 'react-router-dom';

const DotsMenu = ({
  setShowStarredMessages,
  setShowPinnedMessages,
  showPinnedMessages,
  showStarredMessages,
  searchBar, setSearchBar
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); // Create a ref for the menu

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    console.log(`You clicked on ${option}`);
    setIsOpen(false); // Close the menu after selecting an option
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false); // Close the menu if click is outside
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside the menu
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="dots-menu">
      <div className="dots" onClick={toggleMenu}>
        &#x2022;&#x2022;&#x2022; {/* Three dots */}
      </div>
      {isOpen && (
        <div ref={menuRef} className="options mt-[-30px] w-[140px]">
          <div onClick={() => {  setShowPinnedMessages(!showPinnedMessages); }}>Pinned Messages</div>
          <div onClick={() => {  setShowStarredMessages(!showStarredMessages); }}>Starred Messages</div>
          <div onClick={() => { navigate('/user-profile'); }}>User Profile</div>
          <div onClick={() => { setSearchBar(!searchBar) }}>SEARCH</div>
        </div>
      )}
    </div>
  );
};

export default DotsMenu;
