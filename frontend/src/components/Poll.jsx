import React, { useState } from 'react';

const Poll = () => {
  const [pollQuestion, setPollQuestion] = useState('What programming languages do you use?');
  const [pollOptions, setPollOptions] = useState([
    { id: 1, text: 'JavaScript', votes: 0 },
    { id: 2, text: 'Python', votes: 0 },
    { id: 3, text: 'Java', votes: 0 },
    { id: 4, text: 'C++', votes: 0 },
  ]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleVoteChange = (id) => {
    if (selectedOptions.includes(id)) {
      setSelectedOptions(selectedOptions.filter((optionId) => optionId !== id));
    } else {
      setSelectedOptions([...selectedOptions, id]);
    }
  };

  const submitVotes = () => {
    setPollOptions((prevOptions) =>
      prevOptions.map((option) =>
        selectedOptions.includes(option.id)
          ? { ...option, votes: option.votes + 1 }
          : option
      )
    );
    setSelectedOptions([]);
  };

  return (
    <div className="poll-container">
      <h3>{pollQuestion}</h3>
      <div className="poll-options">
        {pollOptions.map((option) => (
          <label key={option.id} className="poll-option">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleVoteChange(option.id)}
            />
            {option.text} - {option.votes} vote{option.votes !== 1 ? 's' : ''}
          </label>
        ))}
      </div>
      <button onClick={submitVotes} disabled={selectedOptions.length === 0}>
        Submit Votes
      </button>
    </div>
  );
};

export default Poll;
