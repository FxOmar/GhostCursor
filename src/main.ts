import './style.css';

import { WebSocketProvider } from './websocketProvider';
import { Mouse } from './mouse';

const username = createRandomUserName();
let cursors = new Map();

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function createRandomUserName() {
  const adjectives = [
    'happy',
    'sad',
    'angry',
    'sleepy',
    'hungry',
    'thirsty',
    'bored',
    'excited',
    'tired',
    'silly',
  ];

  const animals = [
    'dog',
    'cat',
    'bird',
    'fish',
    'rabbit',
    'hamster',
    'turtle',
    'parrot',
    'snake',
    'lizard',
  ];

  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}_${
    animals[Math.floor(Math.random() * animals.length)]
  }`;
}

const color = randomColor();

function createCursorSVG(color: string) {
  return `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="8 0 16 8 8 16 0 8 8 0" fill="${color}"/>
      </svg>
  `;
}

interface CursorData {
  clientId: string;
  color: string;
  username: string;
  x: number;
  y: number;
}

function createCursorElement(cursorData: CursorData) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';

  // Insert the SVG cursor
  cursor.innerHTML = createCursorSVG(color);

  const label = document.createElement('div');
  label.className = 'cursor-label';
  label.textContent = cursorData.username;
  label.style.background = cursorData.color;

  cursor.appendChild(label);
  document.body.appendChild(cursor);

  return cursor;
}

function updateCursors(cursorList: CursorData[]) {
  // Remove cursors that are no longer present
  for (const [username, element] of cursors.entries()) {
    if (!cursorList.find((c) => c.username === username)) {
      element.remove();
      cursors.delete(username);
    }
  }

  // Update or create cursors
  cursorList.forEach((cursorData) => {
    if (cursorData.username !== username) {
      let cursorElement = cursors.get(cursorData.username);

      if (!cursorElement) {
        cursorElement = createCursorElement(cursorData);
        cursors.set(cursorData.username, cursorElement);
      }

      cursorElement.style.transform = `translate(${cursorData.x}px, ${cursorData.y}px)`;
      cursorElement.querySelector('.cursor-label').textContent =
        cursorData.username;
    }
  });
}

const socket = new WebSocketProvider(
  'ws://670a-103-251-201-202.ngrok-free.app'
);

const mouse = new Mouse();

// generate random x/y coordinates for the cursor

socket.joinRoom('default', username).then(async () => {
  await socket.sendMessage({
    username: username,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });
});

const cursorElement = document.getElementById('cursor');

mouse.observeMouse(async (pos) => {
  await socket.sendMessage({ username, x: pos.x, y: pos.y });
});

socket.onMessage('message', (data) => {
  console.log(data);
  if (data.username !== username) {
    updateCursors(data.data);
  }
});

window.addEventListener('beforeunload', () => {
  socket.disconnect(() => {
    socket.sendMessage({ type: 'disconnect', username });
  });
});
