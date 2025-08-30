'use client'

import { useState } from 'react'
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
            <Badge className={getStatusColor(scoringJob.status)}>
              <div className="flex items-center gap-2">
                {getStatusIcon(scoringJob.status)}
                {scoringJob.status}
              </div>
            </Badge>
            <span className="text-sm text-muted-foreground">
              Scoring Job #{scoringJob.id.slice(-8)}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight">
            Scoring: {scoringJob.submission.title}
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Validation of submission for "{scoringJob.submission.bounty.title}"
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
                  <p className="text-lg font-semibold">{scoringJob.screener.name}</p>
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
                    {scoringJob.score ? `${scoringJob.score}/100` : 'Pending'}
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
                    {new Date(scoringJob.createdAt).toLocaleDateString()}
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
                    {scoringJob.completedAt && scoringJob.startedAt
                      ? `${Math.round((new Date(scoringJob.completedAt).getTime() - new Date(scoringJob.startedAt).getTime()) / 60000)}m`
                      : scoringJob.startedAt
                      ? `${Math.round((Date.now() - new Date(scoringJob.startedAt).getTime()) / 60000)}m`
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
              <p className="text-lg font-semibold">{scoringJob.submission.title}</p>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {scoringJob.submission.description}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Submitter</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>@{scoringJob.submission.submitter.username || scoringJob.submission.submitter.walletAddress?.slice(0, 8)}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Content Type</Label>
              <div className="flex items-center gap-2">
                {scoringJob.submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-blue-500" />}
                {scoringJob.submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-green-500" />}
                {scoringJob.submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-purple-500" />}
                {scoringJob.submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-orange-500" />}
                <span>{scoringJob.submission.contentType}</span>
              </div>
            </div>

            {/* Display URLs if any */}
            {scoringJob.submission.urls && scoringJob.submission.urls.length > 0 && (
              <div>
                <Label className="text-sm font-medium">URLs</Label>
                <div className="space-y-1">
                  {scoringJob.submission.urls.map((url: string, index: number) => (
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
            {scoringJob.submission.textContent && (
              <div>
                <Label className="text-sm font-medium">Text Content</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {scoringJob.submission.textContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Display files if any */}
            {scoringJob.submission.files?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Files</Label>
                <div className="mt-2">
                  <FileDisplay files={scoringJob.submission.files} />
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
                  <span className="font-medium">{scoringJob.screener.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hotkey:</span>
                  <Badge variant="outline">{scoringJob.screener.hotkey}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority:</span>
                  <span className="font-medium">{scoringJob.screener.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active:</span>
                  <Badge variant={scoringJob.screener.isActive ? "default" : "secondary"}>
                    {scoringJob.screener.isActive ? "Yes" : "No"}
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
                    {new Date(scoringJob.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {scoringJob.startedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Started:</span>
                    <span className="font-medium">
                      {new Date(scoringJob.startedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {scoringJob.completedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed:</span>
                    <span className="font-medium">
                      {new Date(scoringJob.completedAt).toLocaleString()}
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
                  <span className="font-medium">{scoringJob.retryCount}/{scoringJob.maxRetries}</span>
                </div>
              </div>
            </div>

            {scoringJob.errorMessage && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-red-600">Error Message</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{scoringJob.errorMessage}</p>
                  </div>
                </div>
              </>
            )}

            {scoringJob.score && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Final Score</Label>
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-3xl font-bold text-green-700">
                      {scoringJob.score}/100
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
              <h3 className="font-semibold text-lg">{scoringJob.submission.bounty.title}</h3>
              <p className="text-muted-foreground">{scoringJob.submission.bounty.description}</p>
            </div>
            <Link href={`/bounties/${scoringJob.submission.bounty.id}`}>
              <Button variant="outline">
                View Bounty
              </Button>
            </Link>
          </div>
          
          {scoringJob.submission.bounty.requirements && (
            <div>
              <Label className="text-sm font-medium">Requirements</Label>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {scoringJob.submission.bounty.requirements}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}