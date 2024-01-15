import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import axios from 'axios'; // Import Axios
let url = import.meta.env.VITE_BASE_URL;

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

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
        setUsernameInput('');
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

  return (
    <div className="w-1/2 container mx-auto">
      <div className="flex flex-col w-full justify-center h-screen">
        <div>
          <div className="text-center my-5 font-bold text-blue-500">
            GUEST BOOK
          </div>
          <ul>
            {messages.map((msg, index) => (
              <li key={index}>
                <Message username={msg.username} text={msg.message} />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3 my-3">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="username"
            className="p-3 rounded-lg border-2"
          />
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="message"
            className="p-3 rounded-lg border-2"
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
