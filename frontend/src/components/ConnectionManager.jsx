import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, Key, ArrowLeft, Camera, X } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import toast from 'react-hot-toast'

export default function ConnectionManager({ onBack }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('scan')
  const [roomCode, setRoomCode] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const qrScannerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.clear()
      }
    }
  }, [])

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true
      },
      false
    )

    scanner.render(
      (decodedText) => {
        handleScannedCode(decodedText)
      },
      (error) => {
        console.log('QR Scan error:', error)
      }
    )

    qrScannerRef.current = scanner
    setIsScanning(true)
  }

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.clear()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScannedCode = (code) => {
    const url = new URL(code)
    const pathParts = url.pathname.split('/')
    const roomId = pathParts[pathParts.length - 1]
    
    if (roomId && roomId.length >= 4) {
      toast.success('Room found! Redirecting...')
      stopScanner()
      setTimeout(() => navigate(`/room/${roomId}`), 1000)
    } else {
      toast.error('Invalid QR code. Please try again.')
    }
  }

  const handleJoinByCode = () => {
    const code = roomCode.trim().toUpperCase()
    if (code.length >= 4) {
      navigate(`/room/${code}`)
    } else {
      toast.error('Please enter a valid room code (min 4 characters)')
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Connect to Device</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`flex-1 py-4 font-medium flex items-center justify-center gap-3 ${activeTab === 'scan' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('scan')
            if (isScanning) stopScanner()
          }}
        >
          <QrCode className="w-5 h-5" />
          Scan QR Code
        </button>
        <button
          className={`flex-1 py-4 font-medium flex items-center justify-center gap-3 ${activeTab === 'code' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => {
            setActiveTab('code')
            if (isScanning) stopScanner()
          }}
        >
          <Key className="w-5 h-5" />
          Enter Code
        </button>
      </div>

      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-6">Scan the QR code from the other device</p>
            
            {!isScanning ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-gray-50">
                  <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Camera preview will appear here</p>
                  <p className="text-sm text-gray-400 mt-2">Make sure to allow camera access</p>
                </div>
                <button
                  onClick={startScanner}
                  className="btn-primary w-full py-4"
                >
                  Start Camera Scanner
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>
                  <button
                    onClick={stopScanner}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 font-medium">💡 Scanning Tips:</p>
                  <ul className="text-blue-600 text-sm mt-2 space-y-1">
                    <li>• Ensure good lighting</li>
                    <li>• Hold steady for 2-3 seconds</li>
                    <li>• Position QR code within frame</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-3 font-medium">
              Enter Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g., X7F9K3"
              className="input-field text-center text-2xl tracking-widest font-mono py-4"
              maxLength={10}
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">
              Get this 6-digit code from the device you want to connect to
            </p>
          </div>

          <button
            onClick={handleJoinByCode}
            disabled={!roomCode.trim() || roomCode.length < 4}
            className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Connect to Room
          </button>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 font-medium">Don't have a code?</p>
                <p className="text-blue-600 text-sm mt-1">
                  Ask the other person to generate a code from the home page and share it with you
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}