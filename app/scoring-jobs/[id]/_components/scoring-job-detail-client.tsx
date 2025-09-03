'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Activity,
  Target,
  FileText,
  Link2,
  Upload,
  Type,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { FileDisplay } from '@/components/file-display'
import { LogStream } from './log-stream'

interface ScoringJobDetailClientProps {
  scoringJob: any
  user: any
  isAdmin: boolean
  isSubmitter: boolean
  isBountyCreator: boolean
}

export function ScoringJobDetailClient({ 
  scoringJob, 
  user, 
  isAdmin, 
  isSubmitter, 
  isBountyCreator 
}: ScoringJobDetailClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentScoringJob, setCurrentScoringJob] = useState(scoringJob)

  useEffect(() => {
    if (currentScoringJob.status === 'SCORING' || currentScoringJob.status === 'ASSIGNED') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/scoring-jobs/${currentScoringJob.id}`)
          if (response.ok) {
            const updatedJob = await response.json()
            setCurrentScoringJob(updatedJob)
          }
        } catch (error) {
          console.error('Failed to refresh scoring job:', error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [currentScoringJob.id, currentScoringJob.status])

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-orange-500 text-white'
      case 'ASSIGNED': return 'bg-blue-500 text-white'
      case 'SCORING': return 'bg-purple-500 text-white'
      case 'COMPLETED': return 'bg-green-500 text-white'
      case 'FAILED': return 'bg-red-500 text-white'
      case 'CANCELLED': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'SCORING': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'FAILED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        
        {isAdmin && (
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            Admin View
          </Badge>
        )}
      </div>

      {/* Scoring Job Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className={getStatusColor(currentScoringJob.status)}>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentScoringJob.status)}
                {currentScoringJob.status}
              </div>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Scoring Job #{currentScoringJob.id.slice(-8)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight">
            Scoring: {currentScoringJob.submission.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Validation of submission for "{currentScoringJob.submission.bounty.title}"
          </p>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Screener</p>
                  <p className="text-lg font-semibold">{currentScoringJob.screener.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Score</p>
                  <p className="text-lg font-semibold">
                    {currentScoringJob.score ? `${currentScoringJob.score}/100` : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-lg font-semibold">
                    {new Date(currentScoringJob.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-lg font-semibold">
                    {currentScoringJob.completedAt && currentScoringJob.startedAt
                      ? `${Math.round((new Date(currentScoringJob.completedAt).getTime() - new Date(currentScoringJob.startedAt).getTime()) / 60000)}m`
                      : currentScoringJob.startedAt
                      ? `${Math.round((Date.now() - new Date(currentScoringJob.startedAt).getTime()) / 60000)}m`
                      : 'Not started'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <p className="text-lg font-semibold">{currentScoringJob.submission.title}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentScoringJob.submission.description}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Submitter</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>@{currentScoringJob.submission.submitter.username || currentScoringJob.submission.submitter.walletAddress?.slice(0, 8)}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Content Type</Label>
              <div className="flex items-center gap-2">
                {currentScoringJob.submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-blue-500" />}
                {currentScoringJob.submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-green-500" />}
                {currentScoringJob.submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-purple-500" />}
                {currentScoringJob.submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-orange-500" />}
                <span>{currentScoringJob.submission.contentType}</span>
              </div>
            </div>

            {/* Display URLs if any */}
            {currentScoringJob.submission.urls && currentScoringJob.submission.urls.length > 0 && (
              <div>
                <Label className="text-sm font-medium">URLs</Label>
                <div className="space-y-1">
                  {currentScoringJob.submission.urls.map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display text content if any */}
            {currentScoringJob.submission.textContent && (
              <div>
                <Label className="text-sm font-medium">Text Content</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {currentScoringJob.submission.textContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Display files if any */}
            {currentScoringJob.submission.files?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Files</Label>
                <div className="mt-2">
                  <FileDisplay files={currentScoringJob.submission.files} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Scoring Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Screener Details</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Name:</span>
                  <span className="font-medium">{currentScoringJob.screener.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hotkey:</span>
                  <Badge variant="outline">{currentScoringJob.screener.hotkey}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority:</span>
                  <span className="font-medium">{currentScoringJob.screener.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active:</span>
                  <Badge variant={currentScoringJob.screener.isActive ? "default" : "secondary"}>
                    {currentScoringJob.screener.isActive ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Timeline</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created:</span>
                  <span className="font-medium">
                    {new Date(currentScoringJob.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {currentScoringJob.startedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Started:</span>
                    <span className="font-medium">
                      {new Date(currentScoringJob.startedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {currentScoringJob.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed:</span>
                    <span className="font-medium">
                      {new Date(currentScoringJob.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Retry Information</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attempts:</span>
                  <span className="font-medium">{currentScoringJob.retryCount}/{currentScoringJob.maxRetries}</span>
                </div>
              </div>
            </div>

            {currentScoringJob.errorMessage && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-600">Error Message</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{currentScoringJob.errorMessage}</p>
                  </div>
                </div>
              </>
            )}

            {currentScoringJob.score && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Final Score</Label>
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-3xl font-bold text-green-700">
                      {currentScoringJob.score}/100
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bounty Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Related Bounty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">{currentScoringJob.submission.bounty.title}</h3>
              <p className="text-muted-foreground">{currentScoringJob.submission.bounty.description}</p>
            </div>
            <Link href={`/bounties/${currentScoringJob.submission.bounty.id}`}>
              <Button variant="outline">
                View Bounty
              </Button>
            </Link>
          </div>
          
          {currentScoringJob.submission.bounty.requirements && (
            <div>
              <Label className="text-sm font-medium">Requirements</Label>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {currentScoringJob.submission.bounty.requirements}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Logs */}
      <LogStream jobId={currentScoringJob.id} />
    </div>
  )
}