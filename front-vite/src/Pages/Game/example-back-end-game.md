To set up a **back-end** that can communicate with a game developed using **Phaser** via **WebSockets**, you need to follow a client-server architecture where the **client** (the Phaser game) interacts with the **server** (usually built with Node.js) using WebSockets for real-time communication.

### Steps to Set Up the Back-end with WebSocket:

#### 1. **Set Up the Back-end with Node.js and WebSocket**

Node.js is a common choice for the back-end due to its efficiency in handling WebSockets. You can use a package like `ws` (a lightweight WebSocket library) or `socket.io` (a more complete library that handles automatic reconnections, fallbacks, and other features).

##### **Example with `ws` (Simple WebSocket):**

1. **Install Dependencies**:

   Start by creating a Node.js project and installing the `ws` library:

   ```bash
   npm init -y
   npm install ws
   ```

2. **Create the WebSocket Server**:

   Create a file named `server.js` to manage the server logic and launch the WebSocket:

   ```javascript
   const WebSocket = require('ws');

   const wss = new WebSocket.Server({ port: 8080 });

   wss.on('connection', (ws) => {
     console.log('Client connected');

     // Send a message to the client
     ws.send(JSON.stringify({ message: 'Welcome to the server!' }));

     // Receive a message from the client
     ws.on('message', (data) => {
       console.log('Message received from client:', data);

       // Respond to the client
       ws.send(JSON.stringify({ message: 'I received your message!' }));
     });

     // Handle client disconnection
     ws.on('close', () => {
       console.log('Client disconnected');
     });
   });

   console.log('WebSocket server listening on port 8080');
   ```

   This WebSocket server is set up to:
   - Accept real-time connections from clients.
   - Send and receive JSON messages.
   - Handle client disconnections.

##### **Example with `socket.io` (More Complete):**

If you prefer a more feature-rich library, `socket.io` is a popular choice.

1. **Install Dependencies**:

   ```bash
   npm install socket.io
   ```

2. **Create the `socket.io` Server**:

   ```javascript
   const { Server } = require('socket.io');
   const io = new Server(8080);

   io.on('connection', (socket) => {
     console.log('A client connected');

     // Send a message to the client
     socket.emit('message', { message: 'Welcome to the server!' });

     // Receive a message from the client
     socket.on('message', (data) => {
       console.log('Message received from client:', data);

       // Respond to the client
       socket.emit('message', { message: 'I received your message!' });
     });

     // Handle client disconnection
     socket.on('disconnect', () => {
       console.log('Client disconnected');
     });
   });

   console.log('Socket.io server listening on port 8080');
   ```

#### 2. **Set Up the Phaser Client with WebSocket**

In your Phaser game, you can connect to the WebSocket server or `socket.io` server using the native WebSocket support in JavaScript.

##### **Native WebSocket Connection in Phaser:**

1. **Connect to the WebSocket Server in the Phaser Client:**

   ```typescript
   class MyGameScene extends Phaser.Scene {
     private socket!: WebSocket;

     constructor() {
       super({ key: 'MyGameScene' });
     }

     preload() {
       // Load assets...
     }

     create() {
       // Connect to the WebSocket server
       this.socket = new WebSocket('ws://localhost:8080');

       // Handle the connection opening
       this.socket.onopen = () => {
         console.log('Connected to WebSocket server');
         this.socket.send(JSON.stringify({ message: 'Hello, server!' }));
       };

       // Handle receiving messages from the server
       this.socket.onmessage = (event) => {
         const data = JSON.parse(event.data);
         console.log('Message from server:', data.message);
       };

       // Handle the connection closing
       this.socket.onclose = () => {
         console.log('WebSocket connection closed');
       };
     }

     update() {
       // Game logic...
     }
   }
   ```

   This code in the Phaser client handles connecting to a WebSocket server, sending messages, and receiving responses.

##### **Socket.io Connection in Phaser:**

1. **Install `socket.io-client` for the Phaser Client:**

   ```bash
   npm install socket.io-client
   ```

2. **Connect to the `socket.io` Server in the Phaser Client:**

   ```typescript
   import { io } from 'socket.io-client';

   class MyGameScene extends Phaser.Scene {
     private socket!: any;

     constructor() {
       super({ key: 'MyGameScene' });
     }

     preload() {
       // Load assets...
     }

     create() {
       // Connect to the `socket.io` server
       this.socket = io('http://localhost:8080');

       // Handle the connection event
       this.socket.on('connect', () => {
         console.log('Connected to socket.io server');
         this.socket.emit('message', { message: 'Hello, server!' });
       });

       // Receive messages from the server
       this.socket.on('message', (data: any) => {
         console.log('Message from server:', data.message);
       });

       // Handle disconnection
       this.socket.on('disconnect', () => {
         console.log('Disconnected from socket.io server');
       });
     }

     update() {
       // Game logic...
     }
   }
   ```

#### 3. **Integrate Game Logic**

Once you have established communication between the client and server via WebSocket, you can use these messages to synchronize the game state. For example:
- The client sends a **player movement** message to the server.
- The server processes this input and sends the update back to connected clients.

Here’s a simple example:

##### **Server (Node.js):**
```javascript
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const playerAction = JSON.parse(data);
    
    // Process the player action and update game state
    // Broadcast the update to connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ update: 'player moved' }));
      }
    });
  });
});
```

##### **Client (Phaser):**
```typescript
this.socket.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  // Apply the update to the game
  if (update.update === 'player moved') {
    console.log('State update received:', update);
    // Logic to update the position or state of the game
  }
};
```

### Conclusion
To enable Phaser to communicate with a back-end using WebSockets, you can set up a Node.js server with `ws` or `socket.io`, and use the built-in WebSocket support in the Phaser client to manage the connection. This setup allows you to create multiplayer games or synchronize game state between the server and clients.