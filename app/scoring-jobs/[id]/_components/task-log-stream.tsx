'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Terminal, RefreshCw, Download } from 'lucide-react'

interface LogEntry {
  timestamp: string
  message: string
}

interface TaskLogStreamProps {
  jobId: string
  taskName: string
}

export function TaskLogStream({ jobId, taskName }: TaskLogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        task_name: taskName,
        full: 'true',
      })
      const response = await fetch(`/api/scoring-jobs/${jobId}/logs?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      const newLogs: LogEntry[] = []
      
      if (data && data && Array.isArray(data)) {
        data.forEach((event: any) => {
          // Extract message from MessageTemplateTokens
          let message = 'No message'
          if (Array.isArray(event.MessageTemplateTokens) && event.MessageTemplateTokens.length > 0) {
            message = event.MessageTemplateTokens.map((token: any) => token.Text).join('')
          }

          newLogs.push({
            timestamp: event.Timestamp,
            message,
          })
        })
      }
      
      // Sort logs by timestamp
      newLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      setLogs(newLogs)
    } catch (err) {
      setError('Failed to fetch task logs')
      console.error('Error fetching task logs:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadLogs = async () => {
    setIsDownloading(true)
    try {
      const params = new URLSearchParams({
        task_name: taskName,
        full: 'true'
      })

      const response = await fetch(`/api/scoring-jobs/${jobId}/logs?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch full logs: ${response.statusText}`)
      }
      
      const data = await response.json()
      const allLogs: LogEntry[] = []
      
      if (data && data && Array.isArray(data)) {
        data.forEach((event: any) => {
          let message = 'No message'
          if (Array.isArray(event.MessageTemplateTokens) && event.MessageTemplateTokens.length > 0) {
            message = event.MessageTemplateTokens.map((token: any) => token.Text).join('')
          }

          allLogs.push({
            timestamp: event.Timestamp,
            message,
          })
        })
      }

      // Sort logs by timestamp
      allLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      if (allLogs.length === 0) {
        alert('No logs available for this task')
        return
      }

      const logText = allLogs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString()
        return `[${timestamp}] ${log.message}`
      }).join('\n')

      const blob = new Blob([logText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `task-${taskName}-${jobId}-logs.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading task logs:', error)
      alert('Failed to download task logs. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Fetch logs when component mounts
  useEffect(() => {
    fetchLogs()
  }, [jobId, taskName])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Task Logs</span>
          <Badge variant="outline" className="text-xs">
            {logs.length} entries
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadLogs}
            disabled={isDownloading || logs.length === 0}
            className="h-7 px-2"
          >
            {isDownloading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Download className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div 
        ref={containerRef}
        className="h-96 w-full border rounded-md p-3 bg-black text-green-400 font-mono text-xs overflow-y-auto"
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {isLoading ? "Loading task logs..." : "No logs available for this task"}
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={`${log.timestamp}-${index}`} className="flex gap-2">
                <span className="text-gray-400 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}