import { io } from 'socket.io-client';
import API_URL from '../config';

// Socket service singleton
const SOCKET_URL = (API_URL || '').replace(/\/$/, '');

let socket = null;
const joinedPartidas = new Set();

function getToken() {
  return localStorage.getItem('token') || null;
}

function createSocket() {
  const token = getToken();
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
  });

  socket.on('connect', () => {
    // re-join previously joined partidas after reconnect
    joinedPartidas.forEach(pid => {
      try { socket.emit('join:partida', pid); } catch (e) { void e; }
    });
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect_error:', err);
  });

  socket.on('disconnect', (reason) => {
    console.warn('Socket disconnected:', reason);
  });

  return socket;
}

const socketService = {
  init() {
    return createSocket();
  },
  getSocket() {
    return socket;
  },
  setToken(newToken) {
    // update auth token used for connection; will reconnect to apply
    if (!socket) return;
    socket.auth = { token: newToken };
    try {
      socket.disconnect();
    } catch (e) { void e; }
    try {
      socket.connect();
    } catch (e) { void e; }
  },
  joinPartida(partidaId) {
    if (!partidaId) return;
    const s = socket || createSocket();
    if (!joinedPartidas.has(String(partidaId))) {
      try { s.emit('join:partida', partidaId); } catch (e) { console.error(e); }
      joinedPartidas.add(String(partidaId));
    }
    return () => this.leavePartida(partidaId);
  },
  leavePartida(partidaId) {
    if (!partidaId) return;
    if (!socket) return;
    try { socket.emit('leave:partida', partidaId); } catch (e) { void e; }
    joinedPartidas.delete(String(partidaId));
  },
  on(event, cb) {
    const s = socket || createSocket();
    s.on(event, cb);
    return () => s.off(event, cb);
  },
  off(event, cb) {
    if (!socket) return;
    socket.off(event, cb);
  },
  disconnect() {
    if (!socket) return;
    try { socket.disconnect(); } catch (e) { void e; }
    socket = null;
    joinedPartidas.clear();
  },
};

export default socketService;
