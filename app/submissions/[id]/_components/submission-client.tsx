'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Trophy, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Download,
  Calendar,
  User,
  ArrowLeft,
  Trash2,
  Eye,
  BarChart3,
  Target,
  Link as LinkIcon,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { FileDisplay } from '@/components/file-display'

interface SubmissionClientProps {
  submissionId: string
  user: any
}

interface ScoringJob {
  id: string
  status: string
  score?: number
  screener?: {
    name: string
  }
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

interface Submission {
  id: string
  title: string
  description: string
  textContent?: string
  urls: string[]
  status: string
  score?: number
  createdAt: string
  updatedAt: string
  submitter: {
    id: string
    username: string
    walletAddress: string
  }
  bounty: {
    id: string
    title: string
    creatorId: string
    status: string
  }
  files: any[]
  scoringJobs?: ScoringJob[]
  isAnonymized: boolean
}

export function SubmissionClient({ submissionId, user }: SubmissionClientProps) {
  const router = useRouter()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRescoring, setIsRescoring] = useState(false)

  useEffect(() => {
    fetchSubmission()
    
    // Set up auto-refresh interval - check for updates every 30 seconds
    const interval = setInterval(() => {
      fetchSubmission(true) // Pass true to indicate this is a background refresh
    }, 30000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [submissionId])

  const fetchSubmission = async (isBackgroundRefresh = false) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`)
      if (!response.ok) {
        if (response.status === 404) {
          if (!isBackgroundRefresh) toast.error('Submission not found')
        } else if (response.status === 403) {
          if (!isBackgroundRefresh) toast.error('You do not have permission to view this submission')
        } else {
          if (!isBackgroundRefresh) toast.error('Failed to load submission')
        }
        if (!isBackgroundRefresh) router.push('/dashboard')
        return
      }
      
      const data = await response.json()
      const newSubmission = data.submission
      
      // Check if there are meaningful changes for background updates
      if (isBackgroundRefresh && submission) {
        const hasChanges = 
          submission.status !== newSubmission.status ||
          submission.score !== newSubmission.score ||
          submission.scoringJobs?.length !== newSubmission.scoringJobs?.length ||
          submission.scoringJobs?.some((job, index) => 
            job.status !== newSubmission.scoringJobs?.[index]?.status ||
            job.score !== newSubmission.scoringJobs?.[index]?.score
          )
        
        if (hasChanges) {
          toast.success('Submission updated', {
            description: 'The submission has been updated with new information.',
            duration: 3000
          })
        }
      }
      
      setSubmission(newSubmission)
    } catch (error) {
      console.error('Error fetching submission:', error)
      if (!isBackgroundRefresh) {
        toast.error('Failed to load submission')
        router.push('/dashboard')
      }
    } finally {
      if (!isBackgroundRefresh) {
        setIsLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!submission) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete submission')
      }
      
      toast.success('Submission deleted successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error deleting submission:', error)
      toast.error('Failed to delete submission')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRescore = async () => {
    if (!submission) return
    
    setIsRescoring(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/rescore`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('Failed to rescore submission')
      }
      
      toast.success('Submission rescoring initiated successfully')
      // Refresh the submission data to show updated status
      await fetchSubmission()
    } catch (error) {
      console.error('Error rescoring submission:', error)
      toast.error('Failed to rescore submission')
    } finally {
      setIsRescoring(false)
    }
  }


  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-orange-500 text-white'
      case 'SCORING': return 'bg-blue-500 text-white'
      case 'APPROVED': return 'bg-green-500 text-white'
      case 'REJECTED': return 'bg-red-500 text-white'
      case 'WINNER': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getScoringStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'SCORING': return <Clock className="h-4 w-4 animate-pulse" />
      case 'FAILED': return <AlertCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const canDelete = submission && (
    user?.isAdmin || 
    (submission.submitter.id === user?.id && submission.status === 'PENDING')
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          <div className="relative">
            <div className="p-8 rounded-2xl border border-border/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-10 bg-muted/60 rounded animate-pulse"></div>
                  <div className="space-y-3">
                    <div className="h-10 w-96 bg-muted/60 rounded animate-pulse"></div>
                    <div className="h-6 w-64 bg-muted/40 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-24 bg-muted/60 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-96 bg-muted/30 rounded-2xl animate-pulse"></div>
              <div className="h-64 bg-muted/30 rounded-2xl animate-pulse"></div>
            </div>
            <div className="space-y-8">
              <div className="h-64 bg-muted/30 rounded-2xl animate-pulse"></div>
              <div className="h-80 bg-muted/30 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center py-12 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl mb-6">
              <AlertCircle className="h-16 w-16 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Submission Not Found
            </h1>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              The submission you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button 
              onClick={() => router.back()}
              className="hover:scale-105 transition-transform duration-200 px-6 py-3"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl -z-10" />
          <div className="p-8 rounded-2xl backdrop-blur-sm border border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.back()}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
                    {submission.title}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Submitted to{' '}
                    <Link 
                      href={`/bounties/${submission.bounty.id}`} 
                      className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                    >
                      {submission.bounty.title}
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 md:flex-col md:items-end">
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(submission.status)} shadow-lg border-0 text-sm font-medium px-4 py-2 hover:scale-105 transition-transform duration-200`}
                >
                  {submission.status}
                </Badge>
                <div className="flex items-center gap-2">
                  {user?.isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={isRescoring} className="hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-500/30">
                          <RotateCcw className={`mr-2 h-4 w-4 ${isRescoring ? 'animate-spin' : ''}`} />
                          Rescore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Rescore Submission</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to rescore this submission? This will clear all existing scoring jobs and reset the submission status to pending.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRescore} className="bg-blue-600 hover:bg-blue-700">
                            Rescore
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting} className="hover:scale-105 transition-transform duration-200">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this submission? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Submission Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="relative overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/95">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    Submission Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 relative">
                  <div className="group">
                    <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                      Description
                      <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
                    </h3>
                    <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-6 rounded-xl border border-border/30 hover:border-border/60 transition-colors duration-300">
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{submission.description}</p>
                    </div>
                  </div>
                  
                  {submission.textContent && (
                    <div className="group">
                      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        Text Content
                        <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
                      </h3>
                      <div className="bg-gradient-to-br from-slate-950/5 to-slate-950/10 dark:from-slate-50/5 dark:to-slate-50/10 p-6 rounded-xl border border-border/30 hover:border-border/60 transition-all duration-300 hover:shadow-lg">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-foreground/90 overflow-x-auto">{submission.textContent}</pre>
                      </div>
                    </div>
                  )}
                  
                  {submission.urls && submission.urls.length > 0 && submission.urls[0] && (
                    <div className="group">
                      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        URLs
                        <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
                      </h3>
                      <div className="space-y-3">
                        {submission.urls.map((url, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group/url flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/url:bg-primary/20 transition-colors duration-200">
                              <LinkIcon className="h-4 w-4" />
                            </div>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 font-medium break-all flex-1 transition-colors duration-200"
                            >
                              {url}
                            </a>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {submission.files && submission.files.length > 0 && (
                    <div className="group">
                      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        Files
                        <div className="h-px flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
                      </h3>
                      <div className="p-6 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 border border-border/30 hover:border-border/60 transition-all duration-300">
                        <FileDisplay files={submission.files} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Scoring Jobs */}
            {submission.scoringJobs && submission.scoringJobs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="relative overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/95">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-accent/10 text-accent">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      Scoring History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="space-y-4">
                      {submission.scoringJobs.map((job, index) => (
                        <motion.div 
                          key={job.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative overflow-hidden border border-border/30 rounded-xl p-6 bg-gradient-to-r from-muted/20 to-muted/10 hover:border-border/60 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  {getScoringStatusIcon(job.status)}
                                </div>
                                <div>
                                  <span className="font-semibold text-lg">{job.screener?.name || 'Unknown Screener'}</span>
                                  <Badge variant="outline" className={`ml-3 ${getStatusColor(job.status)} border-0 shadow-sm`}>
                                    {job.status}
                                  </Badge>
                                </div>
                              </div>
                              <Link href={`/scoring-jobs/${job.id}`}>
                                <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Button>
                              </Link>
                            </div>
                            
                            {job.score && (
                              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2">
                                  <Trophy className="h-5 w-5 text-green-600" />
                                  <span className="text-sm text-muted-foreground">Final Score:</span>
                                  <span className="font-bold text-2xl text-green-600">{job.score}/100</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {job.completedAt && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <div>
                                    <div className="font-medium text-green-600">Completed</div>
                                    <div className="text-muted-foreground">{new Date(job.completedAt).toLocaleString()}</div>
                                  </div>
                                </div>
                              )}
                              {job.startedAt && !job.completedAt && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                  <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                                  <div>
                                    <div className="font-medium text-blue-600">Started</div>
                                    <div className="text-muted-foreground">{new Date(job.startedAt).toLocaleString()}</div>
                                  </div>
                                </div>
                              )}
                              {job.errorMessage && (
                                <div className="md:col-span-2 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-red-600">Error</div>
                                    <div className="text-red-600/80 text-sm">{job.errorMessage}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
        </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Score Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="relative overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/95">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                <CardContent className="pt-8 pb-8 text-center relative">
                  {submission.score ? (
                    <div>
                      <div className="relative mb-6">
                        <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 flex items-center justify-center shadow-2xl animate-glow relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                          <div className="text-4xl font-black text-white relative z-10">{submission.score}</div>
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-transparent to-white/10" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-lg px-4 py-1 text-sm font-semibold">
                            ✨ Scored
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Final Score
                        </h3>
                        <p className="text-muted-foreground">Your submission has been evaluated</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="relative mb-6">
                        <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-2xl animate-pulse relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
                          <Clock className="h-12 w-12 text-white relative z-10 animate-float" />
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-transparent to-white/10" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0 shadow-lg px-4 py-1 text-sm font-semibold animate-pulse">
                            ⏳ Pending
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                          Awaiting Score
                        </h3>
                        <p className="text-muted-foreground">Your submission is being evaluated</p>
                        {submission.scoringJobs && submission.scoringJobs.some(job => job.status === 'SCORING') && (
                          <div className="mt-3">
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                              <p className="text-sm text-blue-600 font-medium">Currently being scored...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Link to most recent scoring job */}
                  {submission.scoringJobs && submission.scoringJobs.length > 0 && (
                    <div className="mt-6">
                      <Link href={`/scoring-jobs/${submission.scoringJobs[0].id}`}>
                        <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-all duration-200 bg-gradient-to-r hover:from-primary/5 hover:to-accent/5">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          View Scoring Details
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Submission Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="relative overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-card/95">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none" />
                <CardHeader className="relative">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    Submission Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors duration-200">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Submitter</div>
                      <div className="font-semibold">
                        {submission.isAnonymized ? '🕶️ Anonymous' : `@${submission.submitter.username}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/15 transition-colors duration-200">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Submitted</div>
                      <div className="font-semibold">
                        {new Date(submission.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 group-hover:bg-yellow-500/15 transition-colors duration-200">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bounty</div>
                        <Link href={`/bounties/${submission.bounty.id}`} className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:underline">
                          {submission.bounty.title}
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30 transition-all duration-200">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 group-hover:bg-purple-500/15 transition-colors duration-200">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bounty Status</div>
                      <Badge variant="outline" className={`${getStatusColor(submission.bounty.status)} border-0 shadow-sm font-semibold`}>
                        {submission.bounty.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}