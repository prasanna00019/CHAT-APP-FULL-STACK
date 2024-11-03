import React from 'react'
import CryptoJS from 'crypto-js';
import { useAuthContext } from '../context/AuthContext';
const secretKey = '!@#$%^y7gH*3xs'; 
const MessageInfo = (
  {
    showPinnedMessages, showStarredMessages, showMessageInfo, searchTerm,
    setShowPinnedMessages, setShowStarredMessages, setShowMessageInfo, setSearchTerm,
    searchResultsDiv, pinnedResultsDiv, starredResultsDiv, messages2,IsGroupInfo
  }
) => {
  const {userMap}=useAuthContext();
  console.log(IsGroupInfo, ' from group....');
function decryptMessage(encryptedMessage, secretKey) {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
  return (
    <div>
      {
        showStarredMessages && starredResultsDiv
      }
      {
        showPinnedMessages && pinnedResultsDiv
      }
      {
        searchTerm && searchResultsDiv
      }
     {
  (showMessageInfo &&
 IsGroupInfo) ?
  (messages2
    .filter((message) => message._id === showMessageInfo)
    .map((message) => (
      <div key={message._id} className="flex gap-3 flex-col bg-zinc-100 w-[200px]">
        <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
          <strong>{decryptMessage(message.text, secretKey)}</strong>
        </div>

        {message.status && message.status.length > 0 ? (
          message.status.map((status) => (
            <div key={status.userId} className="flex flex-col gap-1">
              <strong>USER : {userMap[status.userId]}</strong>
              <strong>
                DELIVERED: {status.deliveredTime ? new Date(status.deliveredTime).toLocaleString() : 'N/A'}
              </strong>
              <strong>
                READ: {status.readTime ? new Date(status.readTime).toLocaleString() : 'N/A'}
              </strong>
            </div>
          ))
        ) : (
          <strong>No status available</strong>
        )}
      </div>
    ))
  ) :( messages2.filter((message) => message._id === showMessageInfo).map(
    (message) => (

      <div key={message._id} className='flex gap-3 flex-col bg-zinc-100 w-[200px]'>
        <div className='bg-white p-2 border-gray-400 border-x-8 border-y-8'>
          <strong>{decryptMessage(message.text, secretKey)}</strong>
        </div>
      {console.log(message.status)}
        <strong>DELIVERED: {new Date(message.status.deliveredTime).toLocaleString() || 'N/A'}</strong>
        <strong>READ: {new Date(message.status.readTime).toLocaleString() || 'N/A'}</strong>
      </div>
    ))
)
}

    </div>
  )
}
export default MessageInfo
