'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Terminal, RefreshCw, Play, Pause, Download, ArrowDown, Lock, Unlock } from 'lucide-react'

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
  const [isDownloading, setIsDownloading] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreLogs, setHasMoreLogs] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastLogCountRef = useRef(0)
  const oldestTimestampRef = useRef<string | null>(null)
  const LOGS_PER_PAGE = 100

  const fetchLogs = async (isLoadingMore = false) => {
    if (isLoadingMore) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: LOGS_PER_PAGE.toString(),
        page: isLoadingMore ? (currentPage + 1).toString() : '0'
      })
      
      if (isLoadingMore && oldestTimestampRef.current) {
        params.append('before', oldestTimestampRef.current)
      }

      const response = await fetch(`/api/scoring-jobs/${jobId}/logs?${params}`)
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

          newLogs.push({
            timestamp: event.Timestamp,
            message,
          })
        })
      }
      
      // Sort logs by timestamp
      newLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      if (isLoadingMore) {
        // Prepend older logs to existing logs
        const combinedLogs = [...newLogs, ...logs]
        setLogs(combinedLogs)
        setCurrentPage(prev => prev + 1)
        
        // Update oldest timestamp for next pagination
        if (newLogs.length > 0) {
          oldestTimestampRef.current = newLogs[0].timestamp
        }
        
        // Check if we got fewer logs than requested (end of logs)
        setHasMoreLogs(newLogs.length === LOGS_PER_PAGE)
      } else {
        // Initial load or refresh - replace all logs
        setLogs(newLogs)
        setCurrentPage(0)
        setHasMoreLogs(newLogs.length === LOGS_PER_PAGE)
        
        // Set oldest timestamp for pagination
        if (newLogs.length > 0) {
          oldestTimestampRef.current = newLogs[0].timestamp
        }
      }
      
      setIsConnected(true)
      lastLogCountRef.current = logs.length + (isLoadingMore ? newLogs.length : 0)
    } catch (err) {
      setError('Failed to fetch logs')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
  }

  const clearLogs = () => {
    setLogs([])
  }

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoadingMore) return
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    const isAtTop = scrollTop <= 10
    
    // If user scrolled away from bottom, disable auto-scroll
    if (!isAtBottom && !userHasScrolled) {
      setUserHasScrolled(true)
      setAutoScroll(false)
    }
    
    // Load more logs when scrolling near the top
    if (isAtTop && hasMoreLogs && !isLoading && !isLoadingMore) {
      const previousScrollHeight = scrollHeight
      fetchLogs(true).then(() => {
        // Maintain scroll position after loading more logs
        setTimeout(() => {
          if (containerRef.current) {
            const newScrollHeight = containerRef.current.scrollHeight
            containerRef.current.scrollTop = newScrollHeight - previousScrollHeight + scrollTop
          }
        }, 50)
      })
    }
  }, [userHasScrolled, hasMoreLogs, isLoading, isLoadingMore])

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const toggleAutoScroll = () => {
    const newAutoScroll = !autoScroll
    setAutoScroll(newAutoScroll)
    setUserHasScrolled(!newAutoScroll)
    
    if (newAutoScroll) {
      scrollToBottom()
    }
  }

  const jumpToBottom = () => {
    setAutoScroll(true)
    setUserHasScrolled(false)
    scrollToBottom()
  }

  const downloadLogs = async () => {
    setIsDownloading(true)
    try {
      // Fetch all logs for download (not just the limited logs from the display)
      const response = await fetch(`/api/scoring-jobs/${jobId}/logs?full=true`)
      if (!response.ok) {
        throw new Error(`Failed to fetch full logs: ${response.statusText}`)
      }
      const data = await response.json()
      console.log("LOGS RESPONSE =============================", data)
      const allLogs: LogEntry[] = []
      
      if (data && Array.isArray(data)) {
        data.forEach((event: any) => {
          // Extract message from MessageTemplateTokens
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
        alert('No logs available to download')
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
      a.download = `scoring-job-${jobId}-all-logs.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading logs:', error)
      alert('Failed to download logs. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && !isPaused && logs.length > lastLogCountRef.current) {
      setTimeout(() => scrollToBottom(), 50)
    }
  }, [logs, autoScroll, isPaused, scrollToBottom])

  // Fetch logs periodically
  useEffect(() => {
    fetchLogs()
    
    const interval = setInterval(() => {
      if (!isPaused) {
        fetchLogs()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [jobId, isPaused])

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

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
            {/* <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              disabled={!isConnected}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? "Resume" : "Pause"}
            </Button> */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
            >
              Clear
            </Button> */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {isDownloading ? "Downloading..." : "Download"}
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={isConnected ? disconnect : fetchLogs}
              // disabled={isLoading}
            >
              {isConnected ? (
                "Disconnect"
              ) : (
                "Reconnect"
              )}
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div 
          ref={containerRef}
          className="h-96 w-full border rounded-md p-4 bg-black text-green-400 font-mono text-xs overflow-y-auto"
          onScroll={handleScroll}
        >
          {/* Loading indicator for pagination */}
          {isLoadingMore && (
            <div className="text-center py-2 text-yellow-400">
              <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
              Loading older logs...
            </div>
          )}
          
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {isLoading ? "Connecting to log stream..." : "No logs available"}
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
          
          {/* End of logs indicator */}
          {!hasMoreLogs && logs.length > 0 && (
            <div className="text-center py-2 text-gray-500 border-t border-gray-700 mt-2">
              — Beginning of logs —
            </div>
          )}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          {logs.length} log entries • Auto-scroll: {isPaused ? "Paused" : autoScroll ? "Active" : "Disabled"}
          {userHasScrolled && !autoScroll && " • Scroll position locked"}
          {hasMoreLogs && " • Scroll up to load more"}
        </div>
      </CardContent>
    </Card>
  )
}