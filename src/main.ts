import './style.css';

import { WebSocketProvider } from './websocketProvider';
import { Mouse } from './mouse';

let clientId: string | null = null;
let cursors = new Map();

function randomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

const color = randomColor();

function Cursor(color: string) {
  return `
    <svg id="cursor" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="8 0 16 8 8 16 0 8 8 0" fill="${color}"/>
    </svg>
  `;
}

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
  cursor.innerHTML = createCursorSVG(cursorData.color);

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
  for (const [id, element] of cursors.entries()) {
    if (!cursorList.find((c) => c.clientId === id)) {
      element.remove();
      cursors.delete(id);
    }
  }

  // Update or create cursors
  cursorList.forEach((cursorData) => {
    if (cursorData.clientId !== clientId) {
      let cursorElement = cursors.get(cursorData.clientId);

      if (!cursorElement) {
        cursorElement = createCursorElement(cursorData);
        cursors.set(cursorData.clientId, cursorElement);
      }

      cursorElement.style.transform = `translate(${cursorData.x}px, ${cursorData.y}px)`;
      cursorElement.querySelector('.cursor-label').textContent =
        cursorData.username;
    }
  });
}

const socket = new WebSocketProvider('ws://83a1-173-239-236-76.ngrok-free.app');

const mouse = new Mouse();

// generate random x/y coordinates for the cursor

const cursor = Cursor(color);
document.body.innerHTML += cursor;

socket.joinRoom('default').then(async () => {
  await socket.sendMessage({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });
});

const cursorElement = document.getElementById('cursor');

mouse.observeMouse(async (pos) => {
  await socket.sendMessage(pos);
});

socket.onMessage('message', ({ data, clientId }) => {
  console.log(data, clientId);
  if (cursorElement) {
    cursorElement.style.transform = `translate(${data.x - 8}px, ${
      data.y - 2
    }px)`;
  }
});
