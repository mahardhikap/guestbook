import React from 'react';

const Message = ({ username, text, date, time }) => {
  return (
    <div className="flex flex-col relative">
      <p className="text-green-600 font-bold break-words text-sm">{username} <span className='text-xs text-gray-400 font-normal'> {date} | {time}</span></p>
      <p className="font-small break-words mb-6 text-sm">{text}</p>
      <span className="absolute right-0 bottom-0 font-bold text-xs"></span>
    </div>
  );
};

export default Message;
