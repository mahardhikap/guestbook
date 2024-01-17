import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import axios from 'axios'; // Import Axios
let url = import.meta.env.VITE_BASE_URL;

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const messagesContainerRef = useRef(null);

  const sendMessage = async () => {
    try {
      const response = await axios.post(
        `${url}/api/messages`,
        {
          username: usernameInput,
          message: messageInput,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        loadChatHistory();
        setMessageInput('');
      } else {
        console.error('Failed to send message:', response.statusText);
        alert('Please fill username and message!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${url}/api/messages`);
      const history = response.data;
      setMessages(history);
    } catch (error) {
      console.error('Error fetching chat history', error);
    }
  };

  const handleChangeUsername = (e) => {
    const inputValue = e.target.value;
    const limitedInput = inputValue.slice(0, 50);
    setUsernameInput(limitedInput);
  };
  const handleChangeMessage = (e) => {
    const inputValue = e.target.value;
    const limitedInput = inputValue.slice(0, 150);
    setMessageInput(limitedInput);
  };

  useEffect(() => {
    if (url) {
      const newSocket = io(`${url}`);
      setSocket(newSocket);

      loadChatHistory();

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('chat message', (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      socket.on('chat history', (history) => {
        setMessages(history);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat message');
        socket.off('chat history');
      }
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full p-2 sm:w-1/2 container mx-auto h-screen">
      <div className="flex flex-col w-full justify-center">
        <div>
          <div className="text-center my-5 font-bold text-blue-500">
            GUEST BOOK
          </div>
          <hr className="border-2 mb-4 mx-auto w-1/2" />
          <ul ref={messagesContainerRef} className='h-60 overflow-y-auto	'>
            {messages.map((msg, index) => (
              <li
                key={index}
                className="bg-gray-50 p-1 rounded-lg my-2 shadow-sm"
              >
                <Message username={msg.username} text={msg.message} />
              </li>
            ))}
          </ul>
        </div>
        <hr className="border-2 my-4 mx-auto w-1/2" />
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={usernameInput}
            onChange={handleChangeUsername}
            placeholder="username (max. 50 characters)"
            className="p-3 rounded-lg border"
          />
          <textarea
            type="text"
            value={messageInput}
            onChange={handleChangeMessage}
            placeholder="message (max. 150 characters)"
            className="p-3 rounded-lg border h-20"
          />
          <button
            className="bg-blue-600 rounded-lg p-3 font-bold text-white"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
