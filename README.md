# Realtime Cursor Tracker

A real-time collaborative cursor tracking application that allows multiple users to see each other's mouse cursors in real-time across different browser sessions.

## Features

- **Real-time cursor synchronization** - See other users' cursors move in real-time
- **Random user identification** - Each user gets a randomly generated username (e.g., "happy_dog", "sleepy_cat")
- **Color-coded cursors** - Each user has a unique colored cursor for easy identification
- **Room-based sessions** - Users can join specific rooms to collaborate
- **Smooth cursor animations** - Cursors move smoothly with CSS transitions
- **WebSocket communication** - Low-latency real-time updates

## Tech Stack

### Frontend

- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **WebSocket API** - Real-time communication
- **CSS3** - Smooth animations and styling

### Backend

- **Node.js** - Server runtime
- **ws** - WebSocket library for Node.js
- **HTTP Server** - Basic HTTP server for WebSocket upgrades

## Project Structure

```
GhostCursor/
├── src/
│   ├── main.ts              # Main application logic
│   ├── websocketProvider.ts # WebSocket connection management
│   ├── mouse.ts            # Mouse tracking and reactive coordinates
│   ├── style.css           # Application styles
│   └── vite-env.d.ts       # TypeScript environment definitions
├── example/
│   └── server.cjs          # WebSocket server implementation
├── public/
│   └── vite.svg           # Vite logo
├── index.html             # Main HTML file
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or bun package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/FxOmar/GhostCursor.git
cd GhostCursor
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

### Running the Application

1. **Start the WebSocket server:**

```bash
node example/server.cjs
```

The server will start on `http://localhost:8080`

2. **Start the frontend development server:**

```bash
npm run dev
# or
bun run dev
```

The frontend will be available at `http://localhost:5173`

3. **Open multiple browser tabs/windows** to see the real-time cursor synchronization in action!

## How It Works

### Frontend Architecture

1. **Mouse Tracking** (`mouse.ts`):

   - Uses a Proxy-based reactive system to track mouse coordinates
   - Automatically triggers callbacks when mouse position changes
   - Provides smooth, efficient mouse position updates

2. **WebSocket Provider** (`websocketProvider.ts`):

   - Manages WebSocket connections and reconnection logic
   - Handles room joining/leaving functionality
   - Provides message handling and broadcasting capabilities

3. **Main Application** (`main.ts`):
   - Generates random usernames for users
   - Creates and manages cursor elements in the DOM
   - Coordinates between mouse tracking and WebSocket communication
   - Handles cursor rendering and animations

### Backend Architecture

The server (`example/server.cjs`) provides:

- **Room Management**: Users can join specific rooms for isolated sessions
- **Client Tracking**: Maintains active connections and user states
- **Message Broadcasting**: Efficiently broadcasts cursor updates to room members
- **Connection Handling**: Manages client connections, disconnections, and cleanup

### Communication Protocol

The application uses JSON messages over WebSocket:

```javascript
// Join a room
{
  type: 'join',
  roomId: 'default',
  username: 'happy_dog',
  x: 100,
  y: 200
}

// Send cursor position
{
  type: 'message',
  data: {
    username: 'happy_dog',
    x: 150,
    y: 250
  }
}

// Receive cursor updates
{
  type: 'message',
  data: [
    { username: 'happy_dog', x: 150, y: 250, color: '#ff0000' },
    { username: 'sleepy_cat', x: 300, y: 400, color: '#00ff00' }
  ]
}
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Customization

### Changing Cursor Appearance

Modify the `createCursorSVG()` function in `main.ts` to customize cursor shapes:

```typescript
function createCursorSVG(color: string) {
  return `
    <svg width="16" height="16" viewBox="0 0 16 16">
      <!-- Your custom cursor SVG here -->
    </svg>
  `;
}
```

### Adding New Features

The modular architecture makes it easy to extend:

- Add new message types in the WebSocket protocol
- Implement cursor trails or effects in the CSS
- Add user authentication or persistent rooms
- Include chat functionality alongside cursor tracking

## Browser Compatibility

- Modern browsers with WebSocket support
- Chrome 16+, Firefox 11+, Safari 7+, Edge 12+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with Vite for fast development experience
- Uses modern TypeScript features for type safety
- Implements efficient WebSocket communication patterns
