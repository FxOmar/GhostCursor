import './style.css';

import { WebSocketProvider } from './websocketProvider';
import { Mouse } from './mouse';

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

const socket = new WebSocketProvider('ws://localhost:8080');

const mouse = new Mouse();

const cursor = Cursor(color);
document.body.innerHTML += cursor;

const cursorElement = document.getElementById('cursor');

socket.joinRoom('default').then(async () => {
  await socket.sendMessage({ x: 10, y: 10 });
});

mouse.observeMouse(async (pos) => {
  await socket.sendMessage(pos);
});

socket.onMessage('message', ({ data }) => {
  if (cursorElement) {
    cursorElement.style.transform = `translate(${data.x - 8}px, ${
      data.y - 2
    }px)`;
  }
});
