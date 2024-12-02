// import React, { useEffect } from 'react'
// import CryptoJS from 'crypto-js';
// import bluetick from '../assets/blue-double.png'
// import normaltick from '../assets/normal-double.png'
// import { useAuthContext } from '../context/AuthContext';
// import useLogout from '../hooks/useLogout';
// const secretKey = '!@#$%^y7gH*3xs'; 
// const MessageInfo = (
//   {
//     showPinnedMessages, showStarredMessages, showMessageInfo, searchTerm,
//     setShowPinnedMessages, setShowStarredMessages, setShowMessageInfo, setSearchTerm,
//     searchResultsDiv, pinnedResultsDiv, starredResultsDiv, messages2,IsGroupInfo,showAI
//   }
// ) => {
//   const {userMap}=useAuthContext();
//   const summarize = async (text) => {
//     try {
//       const response = await fetch('https://webdev-projects.onrender.com/summarize', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: 'This is an example text that needs summarizing.' }),
//       });
//      console.log(response)
//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log(data.summary);
//     } catch (error) {
//       console.error('Error summarizing text:', error);
//     }
//   };

//   // Example usage:
//   summarize("This is an example text that needs summarizing.");

//   function decryptMessage(encryptedMessage, secretKey) {
//   try{
//     const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8);
//   }
//   catch{
//     return encryptedMessage
//   }
//   }
//   return (
//     <div>
//       {
//         showStarredMessages && starredResultsDiv
//       }
//       {
//         showPinnedMessages && pinnedResultsDiv
//       }
//       {
//         searchTerm && searchResultsDiv
//       }
//       {
//           showAI &&
//           <div className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
//             <h1>SUMMARIZE:</h1>
//             {(messages2
//               .filter((message) => message._id === showAI)
//               .map((message) => (
//                 <div key={message._id} className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
//                   <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
//                     <strong>{decryptMessage(message.text, 'd32$11QW.!2GcKws')}</strong>
//                     <div>

//                     </div>
//                   </div>
//                 </div>
//               )))}
//           </div>
//       }
//      {
//   (showMessageInfo &&
//  IsGroupInfo) ?
//   (messages2
//     .filter((message) => message._id === showMessageInfo)
//     .map((message) => (
//       <div key={message._id} className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
//         <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
//           <strong>{decryptMessage(message.text, 'd32$11QW.!2GcKws')}</strong>
//         </div>

//         {/* {message.status && message.status.length > 0 ? (
//           message.status.map((status) => (
//             <div key={status.userId} className="flex flex-col gap-1">
//               <strong>USER : {userMap[status.userId]}</strong>
//               <strong>
//                 DELIVERED: {status.deliveredTime ? new Date(status.deliveredTime).toLocaleString() : 'N/A'}
//               </strong>
//               <strong>
//                 READ: {status.readTime ? new Date(status.readTime).toLocaleString() : 'N/A'}
//               </strong>
//             </div>
//           ))
//         ) : (
//           <strong>No status available</strong>
//         )} */}
//         {message.status && message.status.length > 0 ? (
//   <div className="flex flex-col gap-2">
//      {/* Read Users */}
//      <div className='bg-white p-1 border border-black flex flex-col gap-4'>
//      <div className='flex gap-3'>

//      <img src={bluetick} width={20} height={10}  alt="" />
//       <strong className='text-blue-500'>READ BY:</strong>
//       </div>
//       {message.status.filter(status => status.readTime).length > 0 ? (
//         message.status
//           .filter(status => status.readTime)
//           .map(status => (
//             <div key={status.userId} className="flex flex-col justify-between items-center ">
//               <span > {userMap[status.userId]}</span>
//               <span>{new Date(status.readTime).toLocaleString()}</span>
//             </div>
//           ))
//       ) : (
//         <span className="italic text-gray-500">No read users</span>
//       )}
//     </div>
//     {/* Delivered Users */}
//     <div className='bg-white p-1 border border-black shadow-inner'>
//     <div className='flex gap-3'>
//       <img src={normaltick} width={20} height={10}  alt="" />
//       <strong className='text-gray-800 mb-1'>DELIVERED TO:</strong>
//       </div>
//       {message.status.filter(status => status.deliveredTime).length > 0 ? (
//         message.status
//           .filter(status => status.deliveredTime)
//           .map(status => (
//             <div key={status.userId} className="flex flex-col justify-between items-center ">
//               <span> {userMap[status.userId]}</span>
//               <span className='mb-3'>{new Date(status.deliveredTime).toLocaleString()}</span>
//             </div>
//           ))
//       ) : (
//         <span className="italic text-gray-500">No delivered users</span>
//       )}
//     </div>
//     <div>
//   <strong>Sent Count: </strong>
//   {
//     message.status.filter(status => status.state === 'sent').length
//   }
// </div>
//   </div>
// ) : (
//   <strong>No status available</strong>
// )}

//       </div>
//     ))
//   ) :( messages2.filter((message) => message._id === showMessageInfo).map(
//     (message) => (

//       <div key={message._id} className='flex gap-3 flex-col bg-white p-2 border-gray-500 border w-[200px]'>
//         <div className='bg-white p-2 border-gray-400 border-x-8 border-y-8'>
//           <strong>{decryptMessage(message.text, secretKey)}</strong>
//         </div>
//         <strong className='flex flex-col gap-1'>
//         <div className='flex gap-3'>
//         <img src={bluetick} width={30} height={10}  alt="" />
//         <span>READ:</span>
//         </div>
//           {new Date(message.status.readTime).toLocaleString()==='1/1/1970, 5:30:00 AM' ?'-': new Date(message.status.readTime).toLocaleString() || 'N/A'}
//         </strong>
//         <div className='border border-gray-400'></div>
//         <strong>
//         <div className='flex gap-3'>
//         <img src={normaltick} width={30} height={10}  alt="" />
//         <span>DELIVERED:</span>
//         </div>
//           {new Date(message.status.deliveredTime).toLocaleString()==='1/1/1970, 5:30:00 AM' ?'-': new Date(message.status.deliveredTime).toLocaleString() || 'N/A'}
//         </strong>
//       </div>
//     ))
// )
// }

//     </div>
//   )
// }
// export default MessageInfo

import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import bluetick from "../assets/blue-double.png";
import normaltick from "../assets/normal-double.png";
import { useAuthContext } from "../context/AuthContext";
import axios from "axios";
import summarize from "../helper_functions";

const secretKey = "!@#$%^y7gH*3xs";

const MessageInfo = ({
  showPinnedMessages,
  showStarredMessages,
  showMessageInfo,
  searchTerm,
  setShowPinnedMessages,
  setShowStarredMessages,
  setShowMessageInfo,
  setSearchTerm,
  searchResultsDiv,
  pinnedResultsDiv,
  starredResultsDiv,
  messages2,
  IsGroupInfo,
  showAI,
}) => {
  const { userMap, users } = useAuthContext();
  const [summary, setSummary] = useState("");
  const helper2 = async (text) => {
    const res = await summarize(text);
    setSummary(res);
  }
  const decryptMessage = (encryptedMessage, secretKey) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return encryptedMessage;
    }
  };
  function formatReadme(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Replace **bold** with <strong>
      .replace(/\*(.+?)\*/g, '<em>$1</em>');           // Replace *italic* with <em>
  }
  useEffect(() => {
    if (showAI) {
      const messageToSummarize = messages2.find((message) => message._id === showAI);
      if (messageToSummarize) {
        const decryptedText = decryptMessage(messageToSummarize.text, 'd32$11QW.!2GcKws');
        helper2(decryptedText);
      }
    }
  }, [showAI]);
  const helper11 = async (message) => {
    const ReadReceipts = users.find(user => user._id === message.receiver)?.ReadReceipts;
    const ReadReciepts2 = users.find(user => user._id === message.sender)?.ReadReceipts;

    return !((ReadReceipts && !ReadReciepts2) || (ReadReciepts2 && !ReadReceipts) || (!ReadReciepts2 && !ReadReceipts));
  }

  return (
    <div>
      {showStarredMessages && starredResultsDiv}
      {showPinnedMessages && pinnedResultsDiv}
      {searchTerm && searchResultsDiv}
      {showAI && (
        <div className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
          <h1 >SUMMARIZE:</h1>
          {messages2
            .filter((message) => message._id === showAI)
            .map((message) => (
              <div key={message._id} className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
                <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
                  <strong>{decryptMessage(message.text, 'd32$11QW.!2GcKws')}</strong>
                  <div>
                    <h2>Summary:</h2>
                    <p>{summary || "Loading summary..."}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      {showMessageInfo && IsGroupInfo
        ? messages2
          .filter((message) => message._id === showMessageInfo)
          .map((message) => (
            <div key={message._id} className="flex gap-3 ml-5 flex-col bg-zinc-100 w-[200px]">
              <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
                <strong>{decryptMessage(message.text, secretKey)}</strong>
              </div>
              {message.status && message.status.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {/* Read Users */}
                  <div className="bg-white p-1 border border-black flex flex-col gap-4">
                    <div className="flex gap-3">
                      <img src={bluetick} width={20} height={10} alt="" />
                      <strong className="text-blue-500">READ BY:</strong>
                    </div>
                    {message.status.filter((status) => status.readTime).length > 0 ? (
                      message.status
                        .filter((status) => status.readTime)
                        .map((status) => (
                          <div
                            key={status.userId}
                            className="flex flex-col justify-between items-center "
                          >
                            <span>{userMap[status.userId]}</span>
                            <span>{new Date(status.readTime).toLocaleString()}</span>
                          </div>
                        ))
                    ) : (
                      <span className="italic text-gray-500">No read users</span>
                    )}
                  </div>
                  {/* Delivered Users */}
                  <div className="bg-white p-1 border border-black shadow-inner">
                    <div className="flex gap-3">
                      <img src={normaltick} width={20} height={10} alt="" />
                      <strong className="text-gray-800 mb-1">DELIVERED TO:</strong>
                    </div>
                    {message.status.filter((status) => status.deliveredTime).length > 0 ? (
                      message.status
                        .filter((status) => status.deliveredTime)
                        .map((status) => (
                          <div
                            key={status.userId}
                            className="flex flex-col justify-between items-center "
                          >
                            <span>{userMap[status.userId]}</span>
                            <span className="mb-3">
                              {new Date(status.deliveredTime).toLocaleString()}
                            </span>
                          </div>
                        ))
                    ) : (
                      <span className="italic text-gray-500">No delivered users</span>
                    )}
                  </div>
                </div>
              ) : (
                <strong>No status available</strong>
              )}
            </div>
          ))
        : messages2
          .filter((message) => message._id === showMessageInfo)
          .map((message) => (
            <div key={message._id} className="flex gap-3 flex-col bg-white p-2 border-gray-500 border w-[200px]">
              <div className="bg-white p-2 border-gray-400 border-x-8 border-y-8">
                <strong>{decryptMessage(message.text, secretKey)}</strong>
              </div>
              <strong className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <img src={bluetick} width={30} height={10} alt="" />

                  <span>READ:</span>
                </div>
                {new Date(message.status.readTime).toLocaleString() === "1/1/1970, 5:30:00 AM"
                  ? "-"
                  :
                  !helper11(message) ?
                    new Date(message.status.readTime).toLocaleString() || "N/A" : "-"}
              </strong>
              <div className="border border-gray-400"></div>
              <strong>
                <div className="flex gap-3">
                  <img src={normaltick} width={30} height={10} alt="" />
                  <span>DELIVERED:</span>
                </div>
                {new Date(message.status.deliveredTime).toLocaleString() === "1/1/1970, 5:30:00 AM"
                  ? "-"
                  : new Date(message.status.deliveredTime).toLocaleString() || "N/A"}
              </strong>
            </div>
          ))}
    </div>
  );
};

export default MessageInfo;
