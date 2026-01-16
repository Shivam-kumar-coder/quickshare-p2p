const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const rooms = new Map();
const connections = new Map();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    connections: connections.size
  });
});

io.on('connection', (socket) => {
  console.log('🔗 New connection:', socket.id);
  connections.set(socket.id, { connectedAt: Date.now() });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: [],
        createdAt: Date.now(),
        lastActivity: Date.now()
      });
    }
    
    const room = rooms.get(roomId);
    room.users.push(socket.id);
    room.lastActivity = Date.now();
    
    console.log(`👤 ${socket.id} joined room: ${roomId}`);
    
    socket.to(roomId).emit('user-connected', {
      userId: socket.id,
      roomId,
      timestamp: Date.now()
    });
    
    const otherUsers = room.users.filter(id => id !== socket.id);
    socket.emit('room-users', otherUsers);
    
    connections.set(socket.id, { ...connections.get(socket.id), roomId });
  });

  socket.on('signal', ({ to, type, data }) => {
    console.log(`📡 Signal from ${socket.id} to ${to}: ${type}`);
    socket.to(to).emit('signal', {
      from: socket.id,
      type,
      data,
      timestamp: Date.now()
    });
  });

  socket.on('send-message', ({ roomId, message }) => {
    socket.to(roomId).emit('receive-message', {
      from: socket.id,
      message,
      timestamp: Date.now()
    });
  });

  socket.on('file-metadata', ({ roomId, metadata }) => {
    socket.to(roomId).emit('file-offer', {
      from: socket.id,
      metadata,
      timestamp: Date.now()
    });
  });

  socket.on('file-response', ({ to, accept, fileId }) => {
    socket.to(to).emit('file-response', {
      from: socket.id,
      accept,
      fileId,
      timestamp: Date.now()
    });
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users = room.users.filter(id => id !== socket.id);
      
      if (room.users.length === 0) {
        rooms.delete(roomId);
      } else {
        room.lastActivity = Date.now();
      }
    }
    
    socket.to(roomId).emit('user-disconnected', socket.id);
    connections.delete(socket.id);
    console.log(`👋 ${socket.id} left room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
    
    rooms.forEach((room, roomId) => {
      if (room.users.includes(socket.id)) {
        room.users = room.users.filter(id => id !== socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        if (room.users.length === 0) {
          rooms.delete(roomId);
        }
      }
    });
    
    connections.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});