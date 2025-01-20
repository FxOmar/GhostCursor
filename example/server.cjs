const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server with rooms is running');
});

const wss = new WebSocket.Server({ server });

// Store rooms and their members
const rooms = new Map();
const clientId = new Map();
const clients = new Map();

function createClientId() {
  let id = Math.floor(Math.random() * 1000000);

  while (clientId.has(id)) {
    id = Math.floor(Math.random() * 1000000);
  }

  return id;
}

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

// Store which room each client is in
const clientRooms = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          handleJoinRoom(ws, data.roomId, data.username, data.x, data.y);
          break;
        case 'message':
          handleMessage(ws, data);
          break;
        case 'disconnect':
          handleClientDisconnection(ws, data);
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    handleClientDisconnection(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    handleClientDisconnection(ws);
  });
});

function handleJoinRoom(ws, roomId, username, x, y) {
  // Leave current room if client is in one
  if (clientRooms.has(ws)) {
    const currentRoomId = clientRooms.get(ws);
    const currentRoom = rooms.get(currentRoomId);

    if (currentRoom) {
      currentRoom.delete(ws);
      if (currentRoom.size === 0) {
        rooms.delete(currentRoomId);
      }
    }
  }

  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }

  // Add client to room
  const room = rooms.get(roomId);

  room.add(ws);
  clientRooms.set(ws, roomId);

  clients.set(username, { username, x, y, color: randomColor(), ws });

  console.log('clients', clients.get(username));
  // Notify client of successful join
  ws.send(
    JSON.stringify({
      type: 'system',
      message: `Joined room ${roomId}`,
      roomId: roomId,
      clientCount: room.size,
      username: username,
    })
  );

  // Notify other clients in the room
  broadcastToRoom(
    roomId,
    {
      type: 'system',
      message: `${username} joined the room`,
      clientCount: room.size,
      username: username,
      users: Array.from(room).map((client) => clients.get(client)),
    },
    ws
  );

  console.log(
    `Client joined room ${roomId} as ${username}. Total clients in room: ${room.size}`
  );
}

function handleMessage(ws, { data }) {
  const roomId = clientRooms.get(ws);

  if (!roomId) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'You are not in any room',
      })
    );
    return;
  }

  const color = clients.get(data.username).color;

  clients.set(data.username, {
    username: data.username,
    x: data.x,
    y: data.y,
    color,
  });

  broadcastToRoom(
    roomId,
    {
      type: 'message',
      roomId,
      data: Array.from(clients.values()),
      timestamp: Date.now(),
    },
    ws
  );
}

function handleClientDisconnection(ws, username = null) {
  console.log('Client disconnected', ws);
  const roomId = clientRooms.get(ws);
  if (roomId) {
    const room = rooms.get(roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        rooms.delete(roomId);
      } else {
        // Notify remaining clients
        broadcastToRoom(roomId, {
          type: 'system',
          message: 'A client has left the room',
          clientCount: room.size,
          users: Array.from(room).map((client) => {
            const username = Array.from(clients.keys()).find(
              (key) => clients.get(key).ws === client
            );
            return clients.get(username);
          }),
        });
      }
    }
    clientRooms.delete(ws);

    if (username) {
      clients.delete(username);
    }
  }
  console.log('Client disconnected');
}

function broadcastToRoom(roomId, message, excludeClient = null) {
  const room = rooms.get(roomId);
  if (room) {
    room.forEach((client) => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
