import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Smartphone, Monitor, Zap, Shield, Clock, Sparkles, Rocket } from 'lucide-react'
import ConnectionManager from '../components/ConnectionManager.jsx'

export default function Home() {
  const navigate = useNavigate()
  const [showConnection, setShowConnection] = useState(false)

  const generateRoomId = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateRoom = () => {
    const roomId = generateRoomId()
    navigate(`/room/${roomId}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-12 max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <Share2 className="w-14 h-14 text-primary-600 animate-bounce-slow" />
            <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 bg-clip-text text-transparent">
            QuickShare
          </h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-600 mb-6">
          Send files & chat <span className="font-semibold text-primary-600">directly</span> between devices
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto">
          No signup, no limits, no servers in between. Pure P2P magic powered by WebRTC.
        </p>
      </div>

      {showConnection ? (
        <div className="w-full max-w-2xl animate-slide-in">
          <ConnectionManager onBack={() => setShowConnection(false)} />
        </div>
      ) : (
        <>
          {/* Main Action Card */}
          <div className="card w-full max-w-4xl mb-12 glass-effect">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Get Started in Seconds</h2>
              <p className="text-gray-600 mb-8">Choose how you want to connect</p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Create Room Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    RECOMMENDED
                  </div>
                  <Monitor className="w-16 h-16 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Create Room</h3>
                  <p className="text-gray-600 mb-6">Generate a code & share with others</p>
                  <button 
                    onClick={handleCreateRoom}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    <Rocket className="w-5 h-5 inline mr-2" />
                    Generate Code
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    You'll get a QR code and 6-digit room code
                  </p>
                </div>
                
                {/* Join Room Card */}
                <div className="rounded-2xl bg-gradient-to-br from-white to-green-50 border-2 border-green-100 p-8 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  <Smartphone className="w-16 h-16 text-green-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Join Room</h3>
                  <p className="text-gray-600 mb-6">Scan QR or enter code to connect</p>
                  <button 
                    onClick={() => setShowConnection(true)}
                    className="btn-secondary w-full py-4 text-lg border-2"
                  >
                    Connect to Device
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Use camera to scan or manually enter room code
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-200 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">∞</div>
                <div className="text-gray-600">File Size Limit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">0</div>
                <div className="text-gray-600">Sign Up Required</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">100%</div>
                <div className="text-gray-600">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">P2P</div>
                <div className="text-gray-600">Direct Transfer</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mb-12">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-white to-yellow-50 border border-yellow-100">
              <div className="inline-flex p-4 bg-yellow-100 rounded-2xl mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Direct P2P transfer, no server delays. Uses WebRTC for maximum speed.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-white to-green-50 border border-green-100">
              <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Secure & Private</h3>
              <p className="text-gray-600">End-to-end encryption. Files never touch our servers. Your data stays yours.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-white to-purple-50 border border-purple-100">
              <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-xl mb-3">Always Available</h3>
              <p className="text-gray-600">Stay connected as long as you want. No time limits or session restrictions.</p>
            </div>
          </div>

          {/* How it Works */}
          <div className="card max-w-4xl mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Create or Join</h4>
                <p className="text-gray-600 text-sm">Create a room or join using QR/code</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">Connect Devices</h4>
                <p className="text-gray-600 text-sm">Devices connect directly via P2P</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Share & Chat</h4>
                <p className="text-gray-600 text-sm">Transfer files and chat in real-time</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p className="mb-2">Built with ❤️ for seamless file sharing • 100% Free • Open Source</p>
        <p className="text-xs">No ads, no tracking, no nonsense. Just pure file transfer.</p>
      </footer>
    </div>
  )
}