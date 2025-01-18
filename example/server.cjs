const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server with rooms is running');
});

const wss = new WebSocket.Server({ server });

// Store rooms and their members
const rooms = new Map();

// Store which room each client is in
const clientRooms = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'join':
          handleJoinRoom(ws, data.roomId);
          break;
        case 'message':
          handleMessage(ws, data);
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

function handleJoinRoom(ws, roomId) {
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

  // Notify client of successful join
  ws.send(
    JSON.stringify({
      type: 'system',
      message: `Joined room ${roomId}`,
      roomId: roomId,
      clientCount: room.size,
    })
  );

  // Notify other clients in the room
  broadcastToRoom(
    roomId,
    {
      type: 'system',
      message: 'New client joined the room',
      clientCount: room.size,
    },
    ws
  );

  console.log(
    `Client joined room ${roomId}. Total clients in room: ${room.size}`
  );
}

function handleMessage(ws, data) {
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

  broadcastToRoom(
    roomId,
    {
      type: 'message',
      roomId,
      data: data.data,
      timestamp: Date.now(),
    },
    ws
  );
}

function handleClientDisconnection(ws) {
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
        });
      }
    }
    clientRooms.delete(ws);
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
