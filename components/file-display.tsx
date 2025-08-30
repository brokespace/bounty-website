'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  File, 
  Image, 
  Video, 
  Archive, 
  Code, 
  Download,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'

interface FileDisplayProps {
  files: any[]
  className?: string
}

export function FileDisplay({ files, className }: FileDisplayProps) {
  const [downloading, setDownloading] = useState<string | null>(null)

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'IMAGE': return <Image className="h-4 w-4" />
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'DOCUMENT': return <FileText className="h-4 w-4" />
      case 'ARCHIVE': return <Archive className="h-4 w-4" />
      case 'CODE': return <Code className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number | string | bigint): string => {
    let size: number
    if (typeof bytes === 'string') {
      size = parseInt(bytes)
    } else if (typeof bytes === 'bigint') {
      size = Number(bytes)
    } else {
      size = bytes
    }
    
    if (size === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(k))
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (fileId: string) => {
    setDownloading(fileId)
    try {
      const response = await fetch(`/api/files/${fileId}/download`)
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }

      const data = await response.json()
      
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Download started')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    } finally {
      setDownloading(null)
    }
  }

  if (!files || files.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        {files.map((file) => (
          <Card key={file.id} className="hover:shadow-sm transition-shadow">
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
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.filesize)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file.id)}
                  disabled={downloading === file.id}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
