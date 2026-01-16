import { useParams } from 'react-router-dom'

export default function Room() {
  const { roomId } = useParams()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Room: {roomId}</h1>
          <p className="text-gray-600">Share this code with others</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">File Transfer</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-500">Drag & drop files here</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <div className="h-64 border rounded-xl p-4">
              <p className="text-gray-500">Messages will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
