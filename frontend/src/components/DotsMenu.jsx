import React, { useState, useRef, useEffect } from 'react';
import './DotsMenu.css'; 
import { useNavigate } from 'react-router-dom';

const DotsMenu = ({
  setShowStarredMessages,
  setShowPinnedMessages,
  showPinnedMessages,
  showStarredMessages,
  searchBar, setSearchBar
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null); 

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const navigate = useNavigate();

  const handleOptionClick = (option) => {
    console.log(`You clicked on ${option}`);
    setIsOpen(false); 
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
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
          <div onClick={() => { setShowPinnedMessages(!showPinnedMessages); }}>Pinned Messages</div>
          <div onClick={() => { setShowStarredMessages(!showStarredMessages); }}>Starred Messages</div>
          <div onClick={() => { navigate('/user-profile'); }}>User Profile</div>
          <div onClick={() => { setSearchBar(!searchBar) }}>SEARCH</div>
        </div>
      )}
    </div>
  );
};

export default DotsMenu;
