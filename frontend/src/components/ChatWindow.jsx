import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, User, Clock, Check, CheckCheck } from 'lucide-react'

export default function ChatWindow({ onSendMessage, messages = [], peerConnected }) {
  const [input, setInput] = useState('')
  const [users, setUsers] = useState(['You', 'Other Device'])
  const messagesEndRef = useRef(null)

  // Demo messages for initial view
  const demoMessages = [
    { id: 1, text: 'Hello! 👋', sender: 'other', time: '10:00 AM', status: 'read' },
    { id: 2, text: 'Hi there! Ready to share files?', sender: 'you', time: '10:01 AM', status: 'read' },
    { id: 3, text: 'Yes, send me the photos from the event 📸', sender: 'other', time: '10:02 AM', status: 'read' },
    { id: 4, text: 'Sure, I\'ll send them now. They\'re about 50MB total.', sender: 'you', time: '10:03 AM', status: 'delivered' },
    { id: 5, text: 'Perfect! The transfer is fast 🚀', sender: 'other', time: '10:05 AM', status: 'sent' },
  ]

  const displayMessages = messages.length > 0 ? messages : demoMessages

  useEffect(() => {
    scrollToBottom()
  }, [displayMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = () => {
    if (!input.trim() || !peerConnected) return
    
    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'you',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }
    
    if (onSendMessage) {
      onSendMessage(input)
    }
    
    setInput('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-500" />
      default: return null
    }
  }

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Chat</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm text-gray-600">
              {peerConnected ? `${users.length} users connected` : 'Disconnected'}
            </p>
          </div>
        </div>
        <div className="flex -space-x-2">
          {users.map((user, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white"
              title={user}
            >
              <User className="w-4 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {displayMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.sender === 'you' ? 'order-2' : 'order-1'}`}>
              <div
                className={`message-bubble ${msg.sender === 'you' ? 'message-sent' : 'message-received'}`}
              >
                <p className="break-words">{msg.text}</p>
                <div className={`flex items-center justify-end gap-2 mt-2 ${msg.sender === 'you' ? 'text-white/80' : 'text-gray-500'}`}>
                  <span className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {msg.time}
                  </span>
                  {msg.sender === 'you' && getStatusIcon(msg.status)}
                </div>
              </div>
              {msg.sender !== 'you' && (
                <p className="text-xs text-gray-500 mt-1 ml-1">{msg.sender}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-gray-100 rounded-2xl p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={peerConnected ? "Type a message..." : "Connect to start chatting"}
              className="w-full bg-transparent border-none outline-none resize-none px-3 py-2 text-gray-800 placeholder-gray-400"
              rows={1}
              disabled={!peerConnected}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="p-3 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              disabled={!peerConnected}
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <button
              className="p-3 text-gray-600 hover:text-yellow-500 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              disabled={!peerConnected}
              title="Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || !peerConnected}
              className="p-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>End-to-end encrypted</span>
          </div>
          <div>
            <span>{input.length}/1000</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {['👋 Hello!', '📁 Send files?', '✅ Got it!', '🚀 Fast!'].map((text, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (peerConnected) {
                setInput(text)
                setTimeout(() => {
                  const event = new KeyboardEvent('keypress', { key: 'Enter' })
                  document.dispatchEvent(event)
                }, 100)
              }
            }}
            disabled={!peerConnected}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}