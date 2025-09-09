'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Terminal, RefreshCw, Play, Pause } from 'lucide-react'

interface LogEntry {
  timestamp: string
  message: string
}

interface LogStreamProps {
  jobId: string
}

export function LogStream({ jobId }: LogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/scoring-jobs/${jobId}/logs`)
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      const newLogs: LogEntry[] = []
      if (data && Array.isArray(data)) {
        data.forEach((event: any) => {
          // Extract message from MessageTemplateTokens
          let message = 'No message'
          if (Array.isArray(event.MessageTemplateTokens) && event.MessageTemplateTokens.length > 0) {
            message = event.MessageTemplateTokens.map((token: any) => token.Text).join('')
          }

          // Extract job_id, process_id, score, service, source, submission_type from Properties
          let jobIdProp = null
          let processId = null
          let score = null
          let service = null
          let source = null
          let submissionType = null

          if (Array.isArray(event.Properties)) {
            event.Properties.forEach((prop: any) => {
              if (prop.Name === 'job_id') jobIdProp = prop.Value
              if (prop.Name === 'process_id') processId = prop.Value
              if (prop.Name === 'score') score = prop.Value
              if (prop.Name === 'service') service = prop.Value
              if (prop.Name === 'source') source = prop.Value
              if (prop.Name === 'submission_type') submissionType = prop.Value
            })
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
      setIsConnected(true)
      
      if (scrollAreaRef.current && !isPaused) {
        setTimeout(() => {
          const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]')
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight
          }
        }, 100)
      }
    } catch (err) {
      // setError('Failed to fetch logs from Loki')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  useEffect(() => {
    fetchLogs()
    
    const interval = setInterval(() => {
      if (!isPaused) {
        fetchLogs()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, isPaused])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              disabled={!isConnected}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={isConnected ? disconnect : fetchLogs}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isConnected ? (
                "Disconnect"
              ) : (
                "Reconnect"
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <ScrollArea ref={scrollAreaRef} className="h-96 w-full border rounded-md p-4 bg-black text-green-400 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {isLoading ? "Connecting to log stream..." : "No logs available"}
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-gray-400 flex-shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="mt-2 text-xs text-muted-foreground">
          {logs.length} log entries • Auto-scroll: {isPaused ? "Paused" : "Active"}
        </div>
      </CardContent>
    </Card>
  )
}