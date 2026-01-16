class WebRTCService {
  constructor() {
    this.peerConnection = null
    this.dataChannel = null
    this.fileChannel = null
    this.iceCandidates = []
    this.onDataChannelCallbacks = []
    this.onFileProgressCallbacks = []
  }

  createPeerConnection(config = {}) {
    const pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      ...config
    }

    this.peerConnection = new RTCPeerConnection(pcConfig)

    // Setup data channel for chat
    this.dataChannel = this.peerConnection.createDataChannel('chat', {
      ordered: true,
      maxPacketLifeTime: 3000
    })

    this.setupDataChannel(this.dataChannel)

    // Listen for incoming data channels (for receiving)
    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel
      if (channel.label === 'chat') {
        this.setupDataChannel(channel)
      } else if (channel.label === 'file') {
        this.fileChannel = channel
        this.setupFileChannel(channel)
      }
    }

    // ICE candidate handling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.iceCandidates.push(event.candidate)
      }
    }

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection.connectionState)
    }

    // ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection.iceConnectionState)
    }

    return this.peerConnection
  }

  setupDataChannel(channel) {
    channel.onopen = () => {
      console.log('Data channel opened:', channel.label)
    }

    channel.onclose = () => {
      console.log('Data channel closed:', channel.label)
    }

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.onDataChannelCallbacks.forEach(callback => callback(data))
      } catch (error) {
        console.log('Raw message:', event.data)
      }
    }

    channel.onerror = (error) => {
      console.error('Data channel error:', error)
    }
  }

  setupFileChannel(channel) {
    channel.binaryType = 'arraybuffer'
    
    channel.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        // Metadata message
        const metadata = JSON.parse(event.data)
        this.onFileProgressCallbacks.forEach(callback => callback({
          type: 'metadata',
          ...metadata
        }))
      } else {
        // Binary data (file chunk)
        this.onFileProgressCallbacks.forEach(callback => callback({
          type: 'chunk',
          data: event.data
        }))
      }
    }
  }

  createFileChannel() {
    this.fileChannel = this.peerConnection.createDataChannel('file', {
      ordered: true,
      maxRetransmits: 10
    })
    this.setupFileChannel(this.fileChannel)
    return this.fileChannel
  }

  async createOffer() {
    if (!this.peerConnection) return null
    
    try {
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
      return null
    }
  }

  async createAnswer() {
    if (!this.peerConnection) return null
    
    try {
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error('Error creating answer:', error)
      return null
    }
  }

  async setRemoteDescription(description) {
    if (!this.peerConnection) return false
    
    try {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(description)
      )
      return true
    } catch (error) {
      console.error('Error setting remote description:', error)
      return false
    }
  }

  addIceCandidate(candidate) {
    if (!this.peerConnection) return false
    
    try {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      return true
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      return false
    }
  }

  sendMessage(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({
        type: 'message',
        content: message,
        timestamp: Date.now()
      }))
      return true
    }
    return false
  }

  sendFileChunk(chunk) {
    if (this.fileChannel && this.fileChannel.readyState === 'open') {
      this.fileChannel.send(chunk)
      return true
    }
    return false
  }

  sendFileMetadata(metadata) {
    if (this.fileChannel && this.fileChannel.readyState === 'open') {
      this.fileChannel.send(JSON.stringify({
        type: 'file-metadata',
        ...metadata
      }))
      return true
    }
    return false
  }

  onDataChannel(callback) {
    this.onDataChannelCallbacks.push(callback)
  }

  onFileProgress(callback) {
    this.onFileProgressCallbacks.push(callback)
  }

  close() {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    if (this.fileChannel) {
      this.fileChannel.close()
    }
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    
    this.peerConnection = null
    this.dataChannel = null
    this.fileChannel = null
    this.onDataChannelCallbacks = []
    this.onFileProgressCallbacks = []
  }
}

export const webRTCService = new WebRTCService()