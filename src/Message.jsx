import React from 'react';

const Message = ({ username, text }) => {
  return (
    <div className='flex'>
      <p className="text-green-300 font-bold">{username}</p>
      <p className="message-text"> : {text}</p>
    </div>
  );
};

export default Message;
