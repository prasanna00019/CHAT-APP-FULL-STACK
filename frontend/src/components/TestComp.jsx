import React, { useEffect, useRef, useState } from 'react';

const TestComp = () => {
  const [readStatus, setReadStatus] = useState({}); // Track read status
  const messageRefs = useRef([]); // References to message elements

  // Simulate a large number of messages
  const messages = Array.from({ length: 100 }, (_, i) => ({
    id: `msg-${i}`,
    text: `This is message number ${i + 1}`,
  }));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            setReadStatus((prevStatus) => ({
              ...prevStatus,
              [messageId]: true, // Mark the message as read
            }));
            // console.log('Read status:message id', readStatus);
          }
          else{
            const messageId = entry.target.getAttribute('data-message-id');
            if(!readStatus[messageId]){
            
            setReadStatus((prevStatus) => ({
              ...prevStatus,
              [messageId]: false
            }))
        }
          }
        });
      },
      { threshold: 0.99 } // Trigger when 50% of the message is visible
    );

    // Observe each message
    messageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Cleanup the observer on component unmount
    return () => {
      messageRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [messages]);

  return (
    <div className="message-container" style={{ height: '400px', overflowY: 'scroll' }}>
      {messages.map((message, index) => (
        <div
          key={message.id}
          ref={(el) => (messageRefs.current[index] = el)}
          data-message-id={message.id}
          className="message-item"
          style={{ border: '1px solid black', padding: '10px', margin: '5px 0' }}
        >
          <p>{message.text}</p>
          {/* Show single tick if not read, double tick if read */}
          <span className="read-status">
            {readStatus[message.id] ? '✔✔' : '✔'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TestComp;
