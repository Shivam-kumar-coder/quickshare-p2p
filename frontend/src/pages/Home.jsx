import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const [code, setCode] = useState('')

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    navigate(`/room/${roomId}`)
  }

  const joinRoom = () => {
    if (code.length >= 4) {
      navigate(`/room/${code}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">QuickShare</h1>
        <p className="text-gray-600 text-center mb-8">P2P File Sharing</p>
        
        <button 
          onClick={createRoom}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold mb-4 hover:bg-blue-700"
        >
          Create Room
        </button>
        
        <div className="mb-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter room code"
            className="w-full p-3 border rounded-xl mb-2"
          />
          <button 
            onClick={joinRoom}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold"
          >
            Join Room
          </button>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          Share files directly between devices
        </p>
      </div>
    </div>
  )
}
