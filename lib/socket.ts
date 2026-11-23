'use client';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // The page and the socket share one server, so same origin is the default.
    // Ignore values that are not a real URL, such as an unexpanded ${{VARIABLE}}.
    const configured = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    const options = { transports: ['websocket', 'polling'] };
    socket = /^https?:\/\//.test(configured) ? io(configured, options) : io(options);
  }
  return socket;
}

// The socket outlives page navigation, so a newly opened page must ask for the current state.
export function requestInit(sock: Socket) {
  if (sock.connected) sock.emit('request_init');
}
