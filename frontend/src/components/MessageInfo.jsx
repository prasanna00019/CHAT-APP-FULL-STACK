import React from 'react'
import CryptoJS from 'crypto-js';
const secretKey = '!@#$%^y7gH*3xs'; 
const MessageInfo = (
  {
    showPinnedMessages, showStarredMessages, showMessageInfo, searchTerm,
    setShowPinnedMessages, setShowStarredMessages, setShowMessageInfo, setSearchTerm,
    searchResultsDiv, pinnedResultsDiv, starredResultsDiv, messages
  }
) => {
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
        showMessageInfo && messages.filter((message) => message._id === showMessageInfo).map(
          (message) => (

            <div key={message._id} className='flex gap-3 flex-col bg-zinc-100 w-[200px]'>
              <div className='bg-white p-2 border-gray-400 border-x-8 border-y-8'>
                <strong>{decryptMessage(message.text, secretKey)}</strong>
              </div>
              <strong>DELIVERED: {new Date(message.status.deliveredTime).toLocaleString()}</strong>
              <strong>READ: {new Date(message.status.readTime).toLocaleString()}</strong>
            </div>
          ))
      }
    </div>
  )
}
export default MessageInfo
