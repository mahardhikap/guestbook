import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import axios from 'axios';

let url = import.meta.env.VITE_BASE_URL;

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [countdown, setCountdown] = useState(10); // Countdown timer
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
        // Set loading state back to false after completing the request
        setLoading(true);
        setCountdown(10);
        const timerId = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);
        setTimeout(() => {
          setLoading(false);
          clearInterval(timerId);
        }, 10000);
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
    const limitedInput = inputValue.slice(0, 25);
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
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full p-2 sm:w-1/2 container mx-auto">
      <div className="flex flex-col w-full justify-center">
        <div>
          <div className="text-center my-2 font-bold text-gray-600">
            SEND TO ME
          </div>
          <hr className="border-2 mb-4 mx-auto w-1/2" />
          <ul ref={messagesContainerRef} className="h-96 overflow-y-auto">
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <li
                  key={index}
                  className="bg-neutral-50 p-1 rounded-lg my-2 shadow-sm"
                >
                  <Message
                    username={msg.username}
                    text={msg.message}
                    date={new Date(msg.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'numeric',
                      year: 'numeric',
                      // hour: 'numeric',
                      // minute: 'numeric',
                      // second: 'numeric',
                      timeZone: 'Asia/Jakarta',
                    })}
                    time={new Date(msg.created_at).toLocaleString('id-ID', {
                      // day: 'numeric',
                      // month: 'numeric',
                      // year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      // second: 'numeric',
                      timeZone: 'Asia/Jakarta',
                    })}
                  />
                </li>
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <div className="bg-gray-50 p-1 rounded-lg my-2 shadow-sm text-blue-300">
                  Be the first to send a message!
                </div>
              </div>
            )}
          </ul>
        </div>
        <hr className="border-2 my-4 mx-auto w-1/2" />
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={usernameInput}
            onChange={handleChangeUsername}
            placeholder="username (max. 25 characters)"
            className="p-3 rounded-lg border text-sm bg-neutral-50"
          />
          <textarea
            type="text"
            value={messageInput}
            onChange={handleChangeMessage}
            placeholder="message (max. 150 characters)"
            className="p-3 rounded-lg border h-20 text-sm bg-neutral-50"
          />
          <button
            className={`bg-gray-600 rounded-lg p-3 font-bold text-white text-sm mb-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={sendMessage}
            disabled={loading} // Disable the button when loading is true
          >
            {loading ? `Wait ${countdown}s` : 'Send'}
          </button>
        </div>
        <div className='text-xs font-small mt-5 text-center p-0 m-0'>&copy;2024 Mahardhika</div>
      </div>
    </div>
  );
};

export default App;
