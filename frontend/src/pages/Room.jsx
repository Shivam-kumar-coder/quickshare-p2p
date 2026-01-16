import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Wifi, Battery, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import QRDisplay from '../components/QRDisplay.jsx'
import FileTransfer from '../components/FileTransfer.jsx'
import ChatWindow from '../components/ChatWindow.jsx'
import Dashboard from '../components/Dashboard.jsx'
import { socketService } from '../utils/socket.js'
import { webRTCService } from '../utils/webrtc.js'

export default function Room() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  
  const [peerConnected, setPeerConnected] = useState(false)
  const [connectionStrength, setConnectionStrength] = useState('good')
  const [transferSpeed, setTransferSpeed] = useState(0)
  const [connectedUsers, setConnectedUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [isInitializing, setIsInitializing] = useState(true)

  // Initialize socket connection
  useEffect(() => {
    const init = async () => {
      try {
        const socket = socketService.connect()
        
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id)
          socketService.joinRoom(roomId)
        })

        socket.on('user-connected', (data) => {
          console.log('User connected:', data.userId)
          setConnectedUsers(prev => [...prev, data.userId])
          toast.success('Device connected!')
          initiateWebRTC(data.userId)
        })

        socket.on('user-disconnected', (userId) => {
          console.log('User disconnected:', userId)
          setConnectedUsers(prev => prev.filter(id => id !== userId))
          setPeerConnected(false)
          toast('Device disconnected')
        })

        socket.on('signal', handleSignal)

        // Simulate connection after 2 seconds
        setTimeout(() => {
          setPeerConnected(true)
          setConnectionStrength('excellent')
          setTransferSpeed(5 * 1024 * 1024) // 5 MB/s
          setIsInitializing(false)
          toast.success('Connected to room!')
        }, 2000)

      } catch (error) {
        console.error('Initialization error:', error)
        toast.error('Failed to initialize connection')
      }
    }

    init()

    return () => {
      socketService.leaveRoom(roomId)
      socketService.disconnect()
      webRTCService.close()
    }
  }, [roomId])

  const initiateWebRTC = useCallback(async (targetUserId) => {
    try {
      const peerConnection = webRTCService.createPeerConnection()
      
      // Setup WebRTC event handlers
      webRTCService.onDataChannel((data) => {
        if (data.type === 'message') {
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: data.content,
            sender: 'other',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          }])
        }
      })

      const offer = await webRTCService.createOffer()
      if (offer) {
        socketService.sendSignal(targetUserId, 'offer', offer)
      }

      setPeerConnected(true)
    } catch (error) {
      console.error('WebRTC init error:', error)
    }
  }, [])

  const handleSignal = useCallback(async ({ from, type, data }) => {
    switch (type) {
      case 'offer':
        await webRTCService.setRemoteDescription(data)
        const answer = await webRTCService.createAnswer()
        if (answer) {
          socketService.sendSignal(from, 'answer', answer)
        }
        break
        
      case 'answer':
        await webRTCService.setRemoteDescription(data)
        break
        
      case 'ice-candidate':
        webRTCService.addIceCandidate(data)
        break
    }
  }, [])

  const handleSendMessage = (message) => {
    if (!peerConnected) {
      toast.error('Not connected to any device')
      return
    }

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'you',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Send via WebRTC if connected
    if (webRTCService.sendMessage(message)) {
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        ))
      }, 1000)
    }
    
    // Also send via socket for demo
    socketService.sendMessage(roomId, message)
  }

  const handleSendFile = (fileData) => {
    if (!peerConnected) {
      toast.error('Not connected to any device')
      return
    }

    const metadata = {
      fileId: fileData.id,
      fileName: fileData.name,
      fileSize: fileData.size,
      fileType: fileData.type
    }
    
    socketService.sendFileMetadata(roomId, metadata)
    toast.success(`Sending "${fileData.name}"...`)
  }

  const handleRefreshRoom = () => {
    navigate('/')
    setTimeout(() => {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
      navigate(`/room/${newRoomId}`)
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Home</span>
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Room: {roomId}</h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{connectedUsers.length + 1} devices</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Wifi className="w-4 h-4" />
                <span className={peerConnected ? 'text-green-600' : 'text-red-600'}>
                  {peerConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {isInitializing && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium animate-pulse">
            ⚡ Initializing P2P connection...
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - QR & Dashboard */}
        <div className="lg:col-span-1 space-y-6">
          <QRDisplay roomId={roomId} onRefresh={handleRefreshRoom} />
          <Dashboard 
            peerConnected={peerConnected}
            connectionStrength={connectionStrength}
            transferSpeed={transferSpeed}
            connectedUsers={connectedUsers}
          />
        </div>

        {/* Right Column - File Transfer & Chat */}
        <div className="lg:col-span-2 space-y-6">
          <FileTransfer 
            onSendFile={handleSendFile}
            peerConnected={peerConnected}
          />
          <ChatWindow 
            onSendMessage={handleSendMessage}
            messages={messages}
            peerConnected={peerConnected}
          />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-lg font-bold text-primary-600">{messages.length}</div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-lg font-bold text-primary-600">
              {peerConnected ? 'Active' : 'Inactive'}
            </div>
            <div className="text-sm text-gray-600">Connection</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-lg font-bold text-primary-600">
              {connectedUsers.length}
            </div>
            <div className="text-sm text-gray-600">Connected Devices</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-gray-200">
            <div className="text-lg font-bold text-primary-600">P2P</div>
            <div className="text-sm text-gray-600">Transfer Mode</div>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      {!peerConnected && !isInitializing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-pulse">
          ⚠️ Waiting for device connection...
        </div>
      )}
    </div>
  )
}