
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Archive, 
  Code, 
  X, 
  Check,
  AlertCircle,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  submissionId?: string
  onFilesUploaded?: (files: any[]) => void
  maxFiles?: number
  className?: string
  triggerUpload?: boolean
  onPendingFilesChange?: (count: number) => void
}

interface UploadedFile {
  id?: string
  originalName: string
  filename?: string
  filepath?: string
  filesize: string | number
  mimeType: string
  fileType: string
  uploadedAt?: string
  file?: File
  status: 'pending' | 'uploading' | 'uploaded' | 'error'
  progress?: number
}

export function FileUpload({ 
  submissionId, 
  onFilesUploaded, 
  maxFiles = 10,
  className,
  triggerUpload = false,
  onPendingFilesChange
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const hasUploadedRef = useRef(false)



  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      originalName: file.name,
      filesize: file.size,
      mimeType: file.type,
      fileType: getFileType(file.type),
      file,
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
    hasUploadedRef.current = false // Reset upload flag when new files are added
    
    // Don't mark files as uploaded without actually uploading them
    // Just notify parent about pending files
    onFilesUploaded?.(newFiles)
  }, [maxFiles, onFilesUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    multiple: true
  })

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'IMAGE'
    if (mimeType.startsWith('video/')) return 'VIDEO'
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'DOCUMENT'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'ARCHIVE'
    if (mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('code')) return 'CODE'
    return 'OTHER'
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE': return <Image className="h-5 w-5" />
      case 'VIDEO': return <Video className="h-5 w-5" />
      case 'DOCUMENT': return <FileText className="h-5 w-5" />
      case 'ARCHIVE': return <Archive className="h-5 w-5" />
      case 'CODE': return <Code className="h-5 w-5" />
      default: return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes: number | string): string => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = useCallback(async () => {
    if (!submissionId) {
      console.log('No submission ID available for upload')
      return
    }

    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length === 0) {
      console.log('No pending files to upload')
      return
    }

    console.log(`Starting upload of ${pendingFiles.length} files for submission ${submissionId}`)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('submissionId', submissionId)
      
      pendingFiles.forEach(fileData => {
        if (fileData.file) {
          formData.append('files', fileData.file)
        }
      })

      // Update status to uploading
      setFiles(prev => prev.map(file => 
        file.status === 'pending' ? { ...file, status: 'uploading', progress: 0 } : file
      ))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()
      console.log('Upload successful:', data)

      // Update files with uploaded data
      let uploadedFileIndex = 0
      setFiles(prev => prev.map(file => {
        if (file.status === 'uploading') {
          const uploadedFile = data.files[uploadedFileIndex++]
          return {
            ...file,
            ...uploadedFile,
            status: 'uploaded',
            progress: 100
          }
        }
        return file
      }))

      toast.success(`${data.files.length} files uploaded successfully!`)
      onFilesUploaded?.(data.files)

    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // Mark failed uploads
      setFiles(prev => prev.map(file => 
        file.status === 'uploading' ? { ...file, status: 'error' } : file
      ))
    } finally {
      setUploading(false)
    }
  }, [submissionId, files, onFilesUploaded])

  // Auto-upload files when submissionId becomes available or triggerUpload is true
  useEffect(() => {
    const hasPendingFiles = files.some(f => f.status === 'pending')
    
    if (submissionId && hasPendingFiles && !hasUploadedRef.current) {
      hasUploadedRef.current = true
      // Use setTimeout to ensure the state has updated
      setTimeout(() => {
        uploadFiles()
      }, 100)
    } else if (triggerUpload && submissionId && hasPendingFiles && !hasUploadedRef.current) {
      // Handle explicit trigger upload
      hasUploadedRef.current = true
      setTimeout(() => {
        uploadFiles()
      }, 100)
    }
  }, [submissionId, triggerUpload, files])

  // Reset upload flag when new files are added (but not when files status changes)
  useEffect(() => {
    const pendingFiles = files.filter(f => f.status === 'pending')
    if (pendingFiles.length > 0 && !submissionId) {
      // Only reset if we don't have a submission ID yet
      hasUploadedRef.current = false
    }
  }, [files.length, submissionId])

  // Notify parent of pending files count changes
  useEffect(() => {
    const pendingCount = files.filter(f => f.status === 'pending').length
    onPendingFilesChange?.(pendingCount)
  }, [files, onPendingFilesChange])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded': return <Check className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className={className}>
      {/* Dropzone */}
      <motion.div
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => {}}
      >
        <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? 'Drop files here' : 'Upload Files'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop files here, or click to select files
        </p>
          <p className="text-xs text-muted-foreground">
            Maximum {maxFiles} files • Any file type supported
          </p>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Files ({files.length})</h4>
            </div>

            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {getFileIcon(file.fileType)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {file.originalName}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {file.fileType}
                            </Badge>
                            {getStatusIcon(file.status)}
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.filesize)}
                            </span>
                            
                            {file.status === 'uploading' && file.progress !== undefined && (
                              <div className="flex-1">
                                <Progress value={file.progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
