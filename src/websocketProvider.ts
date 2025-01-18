export class WebSocketProvider {
  protected socket: WebSocket | null;
  protected currentRoom: string | null;
  protected connectionPromise: Promise<void> | null;
  protected messageHandlers: Map<any, any>;

  constructor(private serverUrl: string) {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.currentRoom = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
  }

  // Connect to WebSocket server
  protected connect() {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.serverUrl);

        this.socket.onopen = () => {
          console.log('Connected to WebSocket server');
          resolve();
        };

        this.socket.onclose = () => {
          console.log('Disconnected from WebSocket server');
          this.connectionPromise = null;
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Join a specific room
  async joinRoom(roomId: string) {
    await this.connect();

    if (this.currentRoom) {
      await this.leaveRoom();
    }

    const joinMessage = {
      type: 'join',
      roomId: roomId,
    };

    if (this.socket) {
      this.socket.send(JSON.stringify(joinMessage));
    } else {
      throw new Error('WebSocket is not connected');
    }

    this.currentRoom = roomId;

    console.log(`Joined room: ${roomId}`);
  }

  // Leave the current room
  async leaveRoom() {
    if (!this.currentRoom) {
      return;
    }

    const leaveMessage = {
      type: 'leave',
      roomId: this.currentRoom,
    };

    if (this.socket) {
      this.socket.send(JSON.stringify(leaveMessage));
    } else {
      throw new Error('WebSocket is not connected');
    }

    console.log(`Left room: ${this.currentRoom}`);
    this.currentRoom = null;
  }

  async sendMessage(message: any) {
    if (!this.currentRoom) {
      throw new Error('Not connected to any room');
    }

    const messageData = {
      type: 'message',
      roomId: this.currentRoom,
      data: message,
    };

    if (this.socket) {
      this.socket.send(JSON.stringify(messageData));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  // Add a message handler for specific message types
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Handle incoming messages
  handleMessage(data: any) {
    const handler = this.messageHandlers.get(data.type);
    if (handler) {
      handler(data);
    }
  }
  // Disconnect from the WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.currentRoom = null;
      this.connectionPromise = null;
    }
  }
}
