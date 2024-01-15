import React from 'react';

const Message = ({ username, text }) => {
  return (
    <div className='flex flex-col'>
      <div className="text-green-300 font-bold">{username}</div>
      <div className="font-medium">{text}</div>
    </div>
  );
};

export default Message;
