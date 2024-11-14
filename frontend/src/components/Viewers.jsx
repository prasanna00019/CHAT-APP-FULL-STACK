import React from 'react'
import GreenHeart from '../assets/heart-green.png';
import reply from '../assets/reply.png';
const Viewers = ({ viewers, isLikedByUser ,NumLikes}) => {
  return (
    <ul>
      {viewers?.length > 0 ? viewers.map((viewer) => (
        <li key={viewer.userId} className='flex  gap-2 justify-evenly'>
          <div className='flex flex-col gap-1 border border-black p-2 bg-zinc-300'>
            <span>{viewer.userId}</span>
            <span> {new Date(viewer.viewedAt).toLocaleString()}</span>
          </div>
          <img src={isLikedByUser ? GreenHeart : ''} width={50} height={10} alt="" />
        </li>
      )) : "No Viewers"}


    </ul>
  )
}
export default Viewers
