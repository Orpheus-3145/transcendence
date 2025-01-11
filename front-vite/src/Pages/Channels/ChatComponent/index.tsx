import { Box, TextField, Button, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const [channel, setChannel] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [userChannels, setUserChannels] = useState([]);

  // Establish connection to the WebSocket server
  useEffect(() => {
	  const newSocket = io(
		  import.meta.env.URL_WEBSOCKET + import.meta.env.WS_NS_CHAT,
		  {
			  withCredentials: true,
			  transports: ['websocket'],
		  },
	  );
	  setSocket(newSocket);

    newSocket.on('newMessage', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data.message, senderId: data.senderId, channel: data.channel },
      ]);
    });

    return () => newSocket.close();
  }, []);

  // Join a channel
  const joinChannel = (channelName) => {
    socket.emit('joinChannel', { channel: channelName });
    setUserChannels((prev) => [...prev, channelName]);
    setChannel('');
  };

  // Leave a channel
  const leaveChannel = (channelName) => {
    socket.emit('leaveChannel', { channel: channelName });
    setUserChannels((prev) => prev.filter((ch) => ch !== channelName));
  };

  // Send a message to a channel
  const sendMessage = (channelName, message) => {
    socket.emit('sendMessage', { channel: channelName, message });
    setMessage('');
  };

  return (
    <div>
      <h1>React Chat</h1>

      <div>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Enter channel name"
        />
        <button onClick={() => joinChannel(channel)}>Join Channel</button>
      </div>

      <div>
        <h2>Channels</h2>
        <ul>
          {userChannels.map((ch) => (
            <li key={ch}>
              <span>{ch}</span>
              <button onClick={() => leaveChannel(ch)}>Leave</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Messages</h2>
        <div>
          <select
            onChange={(e) => setChannel(e.target.value)}
            value={channel}
          >
            <option value="">Select a channel</option>
            {userChannels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
          />
          <button
            onClick={() => {
              if (channel && message) {
                sendMessage(channel, message);
              }
            }}
          >
            Send
          </button>
        </div>

        <div>
          <h3>Messages:</h3>
          {messages
            .filter((msg) => msg.channel === channel)
            .map((msg, index) => (
              <div key={index}>
                <strong>{msg.senderId}:</strong> {msg.message}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;