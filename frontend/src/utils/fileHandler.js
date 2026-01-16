class FileHandler {
  constructor() {
    this.chunkSize = 16 * 1024 // 16KB chunks
    this.activeTransfers = new Map()
  }

  async prepareFileForSending(file) {
    const fileId = this.generateFileId()
    const totalChunks = Math.ceil(file.size / this.chunkSize)
    
    return {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      totalChunks,
      chunkSize: this.chunkSize
    }
  }

  async *readFileInChunks(file, chunkSize = this.chunkSize) {
    let offset = 0
    
    while (offset < file.size) {
      const chunk = file.slice(offset, offset + chunkSize)
      const arrayBuffer = await chunk.arrayBuffer()
      yield {
        data: arrayBuffer,
        index: Math.floor(offset / chunkSize),
        offset,
        size: chunk.size
      }
      offset += chunkSize
    }
  }

  createFileReceiver(metadata) {
    const { fileId, fileName, fileSize, totalChunks, fileType } = metadata
    const receivedChunks = new Array(totalChunks).fill(null)
    let receivedCount = 0
    
    const receiver = {
      fileId,
      fileName,
      fileSize,
      fileType,
      totalChunks,
      receivedChunks,
      receivedCount,
      startTime: Date.now(),
      
      addChunk: function(index, chunkData) {
        if (!this.receivedChunks[index]) {
          this.receivedChunks[index] = chunkData
          this.receivedCount++
          return true
        }
        return false
      },
      
      isComplete: function() {
        return this.receivedCount === this.totalChunks
      },
      
      assembleFile: function() {
        if (!this.isComplete()) {
          throw new Error('File not complete')
        }
        
        const blob = new Blob(this.receivedChunks, { type: this.fileType })
        const file = new File([blob], this.fileName, { type: this.fileType })
        
        return {
          file,
          metadata: {
            fileName: this.fileName,
            fileSize: this.fileSize,
            fileType: this.fileType,
            transferTime: Date.now() - this.startTime,
            speed: this.fileSize / ((Date.now() - this.startTime) / 1000)
          }
        }
      },
      
      getProgress: function() {
        return {
          progress: (this.receivedCount / this.totalChunks) * 100,
          received: this.receivedCount,
          total: this.totalChunks,
          transferredBytes: this.receivedCount * this.chunkSize,
          totalBytes: this.fileSize
        }
      }
    }
    
    this.activeTransfers.set(fileId, receiver)
    return receiver
  }

  getTransfer(fileId) {
    return this.activeTransfers.get(fileId)
  }

  removeTransfer(fileId) {
    this.activeTransfers.delete(fileId)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('video/')) return '🎬'
    if (fileType.startsWith('audio/')) return '🎵'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('zip') || fileType.includes('compressed')) return '📦'
    if (fileType.includes('text') || fileType.includes('document')) return '📝'
    return '📎'
  }

  generateFileId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  downloadFile(file, fileName) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const fileHandler = new FileHandler()