import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Fetch initial messages when component mounts
    fetchMessages();

    // Listen initial messages from socket.io
    socket.on('initial messages', (initialMessages) => {
      setMessages(initialMessages);
    });

    // Listen for new chat messages from socket.io
    socket.on('chat message', (newMessage) => {
      console.log('Client receive new message:', newMessage);
      setMessages(prevMessages => [...prevMessages, {
        username: newMessage[0],
        message: newMessage[1]
      }]);
    });

    return () => {
      socket.off('initial messages');
      socket.off('chat message');
    };

  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/messages');
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }

  const sendMessage = async () => {
    try {
      await axios.post('http://localhost:5000/messages', {
        username, message
      });
      // Clear message input after sending
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h1>Chat Application</h1>
      <div>
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.username}: </strong>
              {msg.message}
            </li>
          ))}
        </ul>
        <ul>
          {newMessages.map((msg, index) => (
            <li key={index}>
              <strong>{msg[0]}: </strong>
              {msg[1]}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <input
          type="text"
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <textarea
          placeholder='Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>
        <br />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
