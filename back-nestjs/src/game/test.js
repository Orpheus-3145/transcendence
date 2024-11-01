// test-client.js
const { io } = require('socket.io-client');
const socket = io('http://localhost:3000'); // Match backend URL

socket.on('connect', () => {
    console.log('Connected to backend, socket ID:', socket.id);
});

socket.on('gameState', (state) => {
    console.log('Received gameState:', state);
});

