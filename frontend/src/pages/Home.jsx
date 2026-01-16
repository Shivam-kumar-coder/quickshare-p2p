import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Smartphone, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Home() {
  const navigate = useNavigate()
  const [roomCode, setRoomCode] = useState('')

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
    toast.success('Room created!')
    navigate(`/room/${roomId}`)
  }

  const handleJoinRoom = () => {
    if (roomCode.trim().length >= 4) {
      navigate(`/room/${roomCode.trim().toUpperCase()}`)
    } else {
      toast.error('Please enter a valid room code')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Share2 className="w-12 h-12 text-blue-600" />
          <h1 className="text-5xl font-bold text-gray-800">QuickShare</h1>
        </div>
        <p className="text-xl text-gray-600">Direct P2P file sharing between devices</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Monitor className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-4">Create Room</h3>
          <p className="text-gray-600 mb-6">Start a new sharing session</p>
          <button 
            onClick={handleCreateRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
          >
            Create New Room
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Smartphone className="w-16 h-16 text-green-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-4">Join Room</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full p-4 border-2 border-gray-200 rounded-xl text-center text-xl font-mono"
              maxLength={6}
            />
            <button 
              onClick={handleJoinRoom}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500">
        <p>100% Free • No file size limits • Direct P2P transfer</p>
      </div>
    </div>
  )
}
