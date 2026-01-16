import { useState, useRef, useEffect } from 'react'
import { Upload, File, X, Check, Clock, Download, AlertCircle } from 'lucide-react'
import { fileHandler } from '../utils/fileHandler'
import toast from 'react-hot-toast'

export default function FileTransfer({ onSendFile, onFileOffer, peerConnected }) {
  const [files, setFiles] = useState([])
  const [activeTransfers, setActiveTransfers] = useState({})
  const [pendingOffers, setPendingOffers] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (onFileOffer) {
      // Simulate file offer for demo
      const demoOffer = {
        fileId: 'demo123',
        fileName: 'example.jpg',
        fileSize: 1024 * 1024, // 1MB
        fileType: 'image/jpeg',
        from: 'other-user'
      }
      setPendingOffers([demoOffer])
    }
  }, [onFileOffer])

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
      status: 'pending',
      speed: 0,
      transferred: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    if (selectedFiles.length === 1) {
      toast.success(`Added "${selectedFiles[0].name}"`)
    } else {
      toast.success(`Added ${selectedFiles.length} files`)
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length === 0) return

    const newFiles = droppedFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending',
      speed: 0,
      transferred: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    toast.success(`Added ${droppedFiles.length} file(s)`)
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const sendFile = async (fileData) => {
    if (!peerConnected) {
      toast.error('Not connected to any device')
      return
    }

    setFiles(prev => prev.map(f => 
      f.id === fileData.id ? { ...f, status: 'sending', progress: 0 } : f
    ))

    // Simulate file transfer for demo
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileData.id && f.progress < 100) {
          const increment = Math.random() * 10
          const newProgress = Math.min(100, f.progress + increment)
          const newTransferred = (newProgress / 100) * f.size
          const speed = Math.random() * 1024 * 1024 // Random speed

          if (newProgress === 100) {
            clearInterval(interval)
            toast.success(`"${f.name}" sent successfully!`)
            
            setTimeout(() => {
              setFiles(prev => prev.filter(file => file.id !== fileData.id))
            }, 1000)
          }

          return {
            ...f,
            progress: newProgress,
            transferred: newTransferred,
            speed,
            status: newProgress === 100 ? 'completed' : 'sending'
          }
        }
        return f
      }))
    }, 200)

    if (onSendFile) {
      onSendFile(fileData)
    }
  }

  const sendAllFiles = () => {
    files.forEach(file => {
      if (file.status === 'pending') {
        sendFile(file)
      }
    })
  }

  const handleAcceptFile = (offer) => {
    // Simulate file download
    setActiveTransfers(prev => ({
      ...prev,
      [offer.fileId]: {
        ...offer,
        progress: 0,
        status: 'downloading',
        transferred: 0
      }
    }))

    const interval = setInterval(() => {
      setActiveTransfers(prev => {
        const transfer = prev[offer.fileId]
        if (!transfer || transfer.progress >= 100) {
          clearInterval(interval)
          return prev
        }

        const increment = Math.random() * 15
        const newProgress = Math.min(100, transfer.progress + increment)
        
        if (newProgress === 100) {
          toast.success(`Downloaded "${offer.fileName}"`)
          setTimeout(() => {
            setActiveTransfers(prev => {
              const newTransfers = { ...prev }
              delete newTransfers[offer.fileId]
              return newTransfers
            })
          }, 2000)
        }

        return {
          ...prev,
          [offer.fileId]: {
            ...transfer,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'downloading'
          }
        }
      })
    }, 300)

    setPendingOffers(prev => prev.filter(o => o.fileId !== offer.fileId))
  }

  const handleRejectFile = (fileId) => {
    setPendingOffers(prev => prev.filter(o => o.fileId !== fileId))
    toast('File transfer declined')
  }

  const downloadFile = (transfer) => {
    // Create dummy file for demo
    const blob = new Blob(['Demo file content'], { type: transfer.fileType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = transfer.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`"${transfer.fileName}" downloaded`)
  }

  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">File Transfer</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${peerConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {peerConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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

      {/* Pending File Offers */}
      {pendingOffers.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">📨 Incoming Files</h4>
          <div className="space-y-3">
            {pendingOffers.map(offer => (
              <div key={offer.fileId} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">{offer.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {fileHandler.formatFileSize(offer.fileSize)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptFile(offer)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectFile(offer.fileId)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Transfers */}
      {Object.keys(activeTransfers).length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">📥 Downloads</h4>
          <div className="space-y-3">
            {Object.values(activeTransfers).map(transfer => (
              <div key={transfer.fileId} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{transfer.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {fileHandler.formatFileSize(transfer.transferred)} of {fileHandler.formatFileSize(transfer.fileSize)}
                      </p>
                    </div>
                  </div>
                  {transfer.status === 'completed' ? (
                    <button
                      onClick={() => downloadFile(transfer)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Download
                    </button>
                  ) : (
                    <span className="text-sm font-medium text-blue-600">
                      {transfer.progress.toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${transfer.progress}%` }}
                  ></div>
                </div>
                {transfer.status === 'downloading' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Speed: {formatSpeed(transfer.speed || 0)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-700">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={sendAllFiles}
              disabled={!peerConnected || files.every(f => f.status !== 'pending')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send All
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {files.map(file => (
              <div key={file.id} className="file-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {fileHandler.getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{fileHandler.formatFileSize(file.size)}</span>
                      {file.status === 'sending' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatSpeed(file.speed)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {file.status === 'pending' && (
                    <>
                      <button
                        onClick={() => sendFile(file)}
                        disabled={!peerConnected}
                        className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {file.status === 'sending' && (
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium w-10">
                        {file.progress.toFixed(0)}%
                      </span>
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
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && Object.keys(activeTransfers).length === 0 && pendingOffers.length === 0 && (
        <div className="text-center py-8">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No files selected yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Drag & drop files or click the area above
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{files.length}</p>
            <p className="text-sm text-gray-500">Selected</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {files.filter(f => f.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-500">Sent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {Object.keys(activeTransfers).length}
            </p>
            <p className="text-sm text-gray-500">Receiving</p>
          </div>
        </div>
      </div>
    </div>
  )
}