import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
  }

  connect() {
    if (!this.socket) {
      this.socket = io(this.backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join-room', roomId)
    }
  }

  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId)
    }
  }

  sendSignal(to, type, data) {
    if (this.socket) {
      this.socket.emit('signal', { to, type, data })
    }
  }

  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit('send-message', { roomId, message })
    }
  }

  sendFileMetadata(roomId, metadata) {
    if (this.socket) {
      this.socket.emit('file-metadata', { roomId, metadata })
    }
  }

  sendFileResponse(to, accept, fileId) {
    if (this.socket) {
      this.socket.emit('file-response', { to, accept, fileId })
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }

  getSocketId() {
    return this.socket ? this.socket.id : null
  }
}

export const socketService = new SocketService()