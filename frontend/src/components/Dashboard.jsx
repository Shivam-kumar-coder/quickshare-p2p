import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Users, Zap, Shield, Battery, Activity } from 'lucide-react'

export default function Dashboard({ 
  peerConnected, 
  connectionStrength, 
  transferSpeed,
  connectedUsers = []
}) {
  const [stats, setStats] = useState({
    filesTransferred: 0,
    dataTransferred: 0,
    transferTime: 0,
    connectionTime: 0
  })

  const [networkInfo, setNetworkInfo] = useState({
    downlink: 0,
    effectiveType: '4g',
    rtt: 0
  })

  useEffect(() => {
    // Simulate connection time
    const startTime = Date.now()
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        connectionTime: Math.floor((Date.now() - startTime) / 1000)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if ('connection' in navigator) {
      const conn = navigator.connection
      if (conn) {
        setNetworkInfo({
          downlink: conn.downlink || 0,
          effectiveType: conn.effectiveType || 'unknown',
          rtt: conn.rtt || 0
        })
      }
    }
  }, [])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return '0 B/s'
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  }

  const formatDataSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getConnectionStrengthIcon = () => {
    if (!peerConnected) return <WifiOff className="w-5 h-5 text-red-500" />
    
    switch (connectionStrength) {
      case 'excellent': return <Wifi className="w-5 h-5 text-green-500" />
      case 'good': return <Wifi className="w-5 h-5 text-yellow-500" />
      case 'poor': return <Wifi className="w-5 h-5 text-orange-500" />
      default: return <Wifi className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Connection Dashboard</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          {getConnectionStrengthIcon()}
          <span className={`font-medium ${peerConnected ? 'text-green-600' : 'text-red-600'}`}>
            {peerConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatSpeed(transferSpeed || 0)}
          </p>
          <p className="text-sm text-gray-600">Current Speed</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatTime(stats.connectionTime)}
          </p>
          <p className="text-sm text-gray-600">Connection Time</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              {connectedUsers.length + 1}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {connectedUsers.length + 1}
          </p>
          <p className="text-sm text-gray-600">Connected Devices</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
              {networkInfo.effectiveType.toUpperCase()}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {networkInfo.downlink.toFixed(1)} Mbps
          </p>
          <p className="text-sm text-gray-600">Network Speed</p>
        </div>
      </div>

      {/* Network Info */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Network Information</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {networkInfo.rtt}ms
            </p>
            <p className="text-sm text-gray-600">Latency</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {networkInfo.downlink} Mbps
            </p>
            <p className="text-sm text-gray-600">Download</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {networkInfo.effectiveType}
            </p>
            <p className="text-sm text-gray-600">Connection Type</p>
          </div>
        </div>
      </div>

      {/* Transfer Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Security</p>
              <p className="text-sm text-gray-500">End-to-end encrypted</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Battery className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Transfer Mode</p>
              <p className="text-sm text-gray-500">Direct P2P Connection</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Optimal
          </span>
        </div>
      </div>

      {/* Connection Quality Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Connection Quality</span>
          <span className="text-sm text-gray-500">
            {connectionStrength === 'excellent' ? 'Excellent' : 
             connectionStrength === 'good' ? 'Good' : 
             connectionStrength === 'poor' ? 'Poor' : 'Unknown'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              connectionStrength === 'excellent' ? 'w-full bg-green-500' :
              connectionStrength === 'good' ? 'w-2/3 bg-yellow-500' :
              connectionStrength === 'poor' ? 'w-1/3 bg-red-500' : 'w-0'
            }`}
          ></div>
        </div>
      </div>
    </div>
  )
}

// Utility component for Clock icon
function Clock(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  )
}