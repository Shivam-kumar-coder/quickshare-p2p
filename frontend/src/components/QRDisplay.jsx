import { useState, useEffect } from 'react'
import { Copy, RefreshCw, Check, Share2, Link } from 'lucide-react'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'

export default function QRDisplay({ roomId, onRefresh }) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds

  useEffect(() => {
    const url = `${window.location.origin}/room/${roomId}`
    setShareUrl(url)
  }, [roomId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickShare Room',
          text: `Join my QuickShare room using code: ${roomId}`,
          url: shareUrl,
        })
        toast.success('Shared successfully!')
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    } else {
      handleCopy(`${roomId} - ${shareUrl}`)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Your Room</h3>
          <p className="text-gray-600 text-sm">Share this to connect</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Generate new code"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">New Code</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="p-6 bg-white border-2 border-gray-100 rounded-2xl mb-4">
            <QRCode 
              value={shareUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#1e40af"
              level="H"
            />
          </div>
          <p className="text-sm text-gray-500">Scan with mobile or other device</p>
        </div>

        {/* Room Code */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-gray-700">Room Code</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span>Expires in {formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <code className="text-3xl font-bold tracking-widest font-mono text-primary-700">
              {roomId}
            </code>
            <button
              onClick={() => handleCopy(roomId)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Share2 className="w-5 h-5" />
          Share Room
        </button>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-700 mb-2">📋 How to connect:</h4>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>Share QR code or room code with the other person</li>
            <li>They scan QR or enter code to join</li>
            <li>Once connected, you can start sharing files and chatting</li>
          </ol>
        </div>
      </div>
    </div>
  )
}