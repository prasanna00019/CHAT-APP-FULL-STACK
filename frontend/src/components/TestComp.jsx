import React, { useState } from 'react';
const allUsernames = ['john_doe', 'jane_smith', 'admin', 'superuser', 'test_user'];
function TestComp() {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredUsernames, setFilteredUsernames] = useState([]);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Show dropdown when "@" is detected followed by some characters
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const lastWord = value.slice(lastAtIndex + 1); // Text after the last '@'
      if (lastWord.length > 0 && /^[a-zA-Z0-9_]+$/.test(lastWord)) {
        setShowDropdown(true);
        const matches = allUsernames.filter((username) =>
          username.toLowerCase().startsWith(lastWord.toLowerCase())
        );
        setFilteredUsernames(matches);
      } else {
        setShowDropdown(false); // Don't show dropdown for non-alphanumeric characters after "@"
      }
    } else {
      setShowDropdown(false);
    }
  };
  const handleUsernameSelect = (username) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const newValue = inputValue.slice(0, lastAtIndex + 1) + username + ' ';
    setInputValue(newValue);
    setShowDropdown(false);
  };
  return (
    <div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Type a message..."
        style={{ width: '300px' }}
      />
      {showDropdown && (
        <div
          className="dropdown"
          style={{
            border: '1px solid #ccc',
            position: 'absolute',
            backgroundColor: 'white',
            width: '300px',
            zIndex: 1,
          }}
        >
          {filteredUsernames.length > 0 ? (
            filteredUsernames.map((username) => (
              <div
                key={username}
                onClick={() => handleUsernameSelect(username)}
                style={{ cursor: 'pointer', padding: '5px' }}
              >
                {username}
              </div>
            ))
          ) : (
            <div style={{ padding: '5px', color: 'gray' }}>No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}
export default TestComp;
