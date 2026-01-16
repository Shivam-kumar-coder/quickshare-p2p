import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { 
  Upload, 
  Send, 
  File, 
  User, 
  Copy, 
  MessageSquare,
  Share2,
  X,
  Check,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Room() {
  const { roomId } = useParams()
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [files, setFiles] = useState([])
  const [connectedUsers, setConnectedUsers] = useState(['User 1', 'You'])
  const [isConnected, setIsConnected] = useState(true)
  const fileInputRef = useRef(null)

  // Demo data
  useEffect(() => {
    // Demo messages
    setMessages([
      { id: 1, text: 'Hello! Ready to share files?', sender: 'other', time: '10:00 AM' },
      { id: 2, text: 'Yes, send me the photos', sender: 'you', time: '10:01 AM' },
    ])

    // Simulate connection
    const timer = setTimeout(() => {
      setIsConnected(true)
      toast.success('Connected to room!')
    }, 1000)

    return () => clearTimeout(timer)
  }, [roomId])

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    const newFiles = selectedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    toast.success(`Added ${selectedFiles.length} file(s)`)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendFile = (file) => {
    // Simulate file transfer
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'sending', progress: 0 } : f
    ))

    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setFiles(prev => prev.map(f => {
        if (f.id === file.id) {
          if (progress >= 100) {
            clearInterval(interval)
            toast.success(`"${f.name}" sent successfully!`)
            return { ...f, progress: 100, status: 'completed' }
          }
          return { ...f, progress, status: 'sending' }
        }
        return f
      }))
    }, 200)
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage = {
      id: Date.now(),
      text: messageInput,
      sender: 'you',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    
    // Simulate reply after 1 second
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: 'Got it!',
        sender: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, reply])
    }, 1000)

    setMessageInput('')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId)
    toast.success('Room code copied!')
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Room: <span className="text-blue-600">{roomId}</span></h1>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">
                  {isConnected ? `${connectedUsers.length} users connected` : 'Connecting...'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Code
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Left Column - File Transfer */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Transfer Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">File Transfer</h2>
              <span className="text-gray-600">{files.length} files</span>
            </div>

            {/* File Drop Zone */}
            <div
              className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500">Supports all file types • No size limits</p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Selected Files</h3>
                {files.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium truncate max-w-xs">{file.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {file.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleSendFile(file)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Send
                          </button>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {file.status === 'sending' && (
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{file.progress}%</span>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Sent</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Chat</h2>
            
            {/* Messages */}
            <div className="h-64 overflow-y-auto mb-4 space-y-4 p-2">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender === 'you'
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'you' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Info Panel */}
        <div className="space-y-6">
          {/* Connected Users */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Connected Users</h2>
            <div className="space-y-3">
              {connectedUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{user}</p>
                    <p className="text-sm text-gray-500">
                      {user === 'You' ? 'This device' : 'Connected'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How to Use</h2>
            <ol className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Share room code with other person</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Drag & drop files to send</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Chat in real-time while transferring</span>
              </li>
            </ol>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Transfer Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{files.length}</p>
                <p className="text-sm text-gray-600">Files</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-600">
                  {files.filter(f => f.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
