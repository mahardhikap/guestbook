import React from 'react';

const Message = ({ username, text }) => {
  return (
    <div className='flex flex-col'>
      <p className="text-gray-700 font-bold break-words">{username}</p>
      <p className="font-small break-words">{text}</p>
    </div>
  );
};

export default Message;
