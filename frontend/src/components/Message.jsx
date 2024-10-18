import React from 'react';
import dustbin from '../assets/dustbin.png';
import pencil from '../assets/pencil.png';

const Message = ({ 
  message, 
  authUser, 
  editingMessageId, 
  setEditingMessageId, 
  editedText, 
  setEditedText, 
  handleSubmitEdit, 
  handleDeleteForMe, 
  handleDeleteForEveryone, 
  toggleDeleteOptions, 
  showDeleteOptions 
}) => {
  return (
    <div className={`message-item ${message.sender === authUser ? 'ml-[300px]' : 'mr-[600px]'} ${message.sender === authUser ? 'bg-gray-200' : 'bg-blue-200'} rounded-md mb-2 w-[60%]`}>
      <div className="message-content">
        {/* Check if the message was deleted for everyone */}
        {message.deletedForEveryone && !message.deletedFor.includes(authUser) ? (
          <div className="deleted-message flex gap-5 italic text-gray-500 h-[50px]">
            <span className='mt-3 ml-5 text-3xl'>DELETED FOR EVERYONE</span>
            <img onClick={() => handleDeleteForEveryone(message.id)} src={dustbin} width={40} height={10} alt="" />
          </div>
        ) : (
          !message.deletedFor.includes(authUser) && (
            <>
              {editingMessageId === message.id ? (
                <div>
                  <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full border p-1"
                  />
                  <button
                    className="text-blue-500 ml-2"
                    onClick={() => handleSubmitEdit(message.id)}
                  >
                    Save
                  </button>
                  <button
                    className="text-red-500 ml-2"
                    onClick={() => setEditingMessageId(null)} // Cancel edit
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className='flex gap-2 justify-between'>
                    <p className='ml-5 mt-2'>{message.sender === authUser ? 'You' : 'User'}: {message.text}</p>
                    <div className='mt-2 mr-4'> 
                      {message.sender === authUser && (
                        <img
                          src={pencil}
                          width={20}
                          height={10}
                          className='ml-2 cursor-pointer'
                          alt="Edit"
                          onClick={() => {
                            setEditingMessageId(message.id);
                            setEditedText(message.text);
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="message-time text-gray-500 text-sm mt-1">
                    {`SENT AT: ${new Date(message.sentAt).toLocaleTimeString()}`}
                  </div>

                  {/* Show delete options */}
                  <button
                    className="delete-button text-red-500 ml-2"
                    onClick={() => toggleDeleteOptions(message.id)}
                  >
                    Delete
                  </button>
                  {showDeleteOptions === message.id && (
                    <div className="delete-options mt-2 flex flex-col bg-gray-100 p-2 border border-gray-300 rounded-lg">
                      <button
                        className="text-blue-500 mb-2"
                        onClick={() => handleDeleteForMe(message.id)}
                      >
                        Delete for me
                      </button>
                      {message.sender === authUser && (
                        <button
                          className="text-red-500"
                          onClick={() => handleDeleteForEveryone(message.id)}
                        >
                          Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Message;
