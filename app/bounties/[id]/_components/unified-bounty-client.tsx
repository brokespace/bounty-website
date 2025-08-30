'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/file-upload'
import { FileDisplay } from '@/components/file-display'
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Coins, 
  Target, 
  ArrowLeft,
  Plus,
  ThumbsUp,
  ThumbsDown,
  FileText,
  CheckCircle,
  AlertCircle,
  User,
  Share,
  Eye,
  EyeOff,
  Link2,
  Upload,
  Type,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UnifiedBountyClientProps {
  bounty: any
  user?: any
  isOwner: boolean
  isAdmin: boolean
  isAuthenticated: boolean
}

export function UnifiedBountyClient({ 
  bounty, 
  user, 
  isOwner, 
  isAdmin, 
  isAuthenticated 
}: UnifiedBountyClientProps) {
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bountyData, setBountyData] = useState<any>(bounty?.loading ? null : bounty)
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [userSubmissions, setUserSubmissions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('details')

  const [submissionForm, setSubmissionForm] = useState({
    title: '',
    description: '',
    contentType: 'FILE',
    urls: [''],
    textContent: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [triggerUpload, setTriggerUpload] = useState(false)
  const [pendingFilesCount, setPendingFilesCount] = useState(0)


  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files)
    if (submissionId && files.length > 0 && files[0].id) {
      toast.success('Submission and files uploaded successfully!')
      setSubmissionForm({ title: '', description: '', contentType: 'FILE', urls: [''], textContent: '' })
      setUploadedFiles([])
      setSubmissionId(null)
      setTriggerUpload(false)
      setPendingFilesCount(0)
      setIsSubmissionDialogOpen(false)
      setTimeout(() => {
        fetchData()
      }, 1000)
    } else if (files.length > 0 && !submissionId) {
      console.log(`${files.length} files ready for upload when submission is created`)
    }
  }

  // Fetch bounty data and submissions
  useEffect(() => {
    if (bounty?.id) {
      fetchData()
    }
  }, [bounty?.id])

  const fetchData = async () => {
    try {
      // Fetch bounty data
      const bountyResponse = await fetch(`/api/bounties/${bounty.id}`)
      if (bountyResponse.ok) {
        const bountyDataResult = await bountyResponse.json()
        setBountyData(bountyDataResult)
      }

      // Fetch all submissions (anonymized for others)
      const allSubmissionsResponse = await fetch(`/api/bounties/${bounty.id}/submissions`)
      if (allSubmissionsResponse.ok) {
        const allSubmissionsData = await allSubmissionsResponse.json()
        setAllSubmissions(allSubmissionsData || [])
      }

      // Fetch user's own submissions if logged in
      if (user) {
        const userSubmissionsResponse = await fetch(`/api/bounties/${bounty.id}/submissions?userId=${user.id}`)
        if (userSubmissionsResponse.ok) {
          const userSubmissionsData = await userSubmissionsResponse.json()
          setUserSubmissions(userSubmissionsData || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-500 text-white'
      case 'COMPLETED': return 'bg-blue-500 text-white'
      case 'PAUSED': return 'bg-yellow-500 text-white'
      case 'CANCELLED': return 'bg-red-500 text-white'
      case 'PENDING': return 'bg-orange-500 text-white'
      case 'APPROVED': return 'bg-green-500 text-white'
      case 'REJECTED': return 'bg-red-500 text-white'
      case 'WINNER': return 'bg-purple-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please sign in to submit')
      return
    }

    setIsLoading(true)
    try {
      // Determine content type based on what user has filled
      let contentType = 'FILE' // default
      const hasUrls = submissionForm.urls.some(url => url.trim() !== '')
      const hasText = submissionForm.textContent.trim() !== ''
      const hasFiles = pendingFilesCount > 0

      if (currentBounty?.acceptedSubmissionTypes?.includes('MIXED')) {
        contentType = 'MIXED'
      } else if (currentBounty?.acceptedSubmissionTypes?.includes('URL') && hasUrls && !hasText && !hasFiles) {
        contentType = 'URL'
      } else if (currentBounty?.acceptedSubmissionTypes?.includes('TEXT') && hasText && !hasUrls && !hasFiles) {
        contentType = 'TEXT'
      } else if (currentBounty?.acceptedSubmissionTypes?.includes('FILE') && (hasFiles || (!hasUrls && !hasText))) {
        contentType = 'FILE'
      }

      // Validate submission has required content
      if (contentType === 'URL' && !hasUrls) {
        toast.error('Please provide at least one URL')
        return
      }
      if (contentType === 'TEXT' && !hasText) {
        toast.error('Please provide text content')
        return
      }
      if (contentType === 'FILE' && !hasFiles && !hasUrls && !hasText) {
        toast.error('Please provide files or other content')
        return
      }

      const submissionData = {
        ...submissionForm,
        contentType,
        urls: submissionForm.urls.filter(url => url.trim() !== '')
      }

      const response = await fetch(`/api/bounties/${bountyData?.id || bounty?.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create submission')
      }

      setSubmissionId(data.submission.id)

      if (pendingFilesCount > 0) {
        toast.success('Submission created successfully! Uploading files...')
        setTimeout(() => {
          setTriggerUpload(true)
        }, 100)
      } else {
        toast.success('Submission created successfully!')
        setUserSubmissions((prev: any) => [data.submission, ...prev])
        setAllSubmissions((prev: any) => [{ ...data.submission, isAnonymized: true }, ...prev])
        setSubmissionForm({ title: '', description: '', contentType: 'FILE', urls: [''], textContent: '' })
        setUploadedFiles([])
        setSubmissionId(null)
        setPendingFilesCount(0)
        setIsSubmissionDialogOpen(false)
      }

    } catch (error: any) {
      toast.error(error.message || 'Failed to create submission')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async (submissionId: string, voteType: 'UPVOTE' | 'DOWNVOTE') => {
    if (!user) {
      toast.error('Please sign in to vote')
      return
    }

    try {
      const response = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      })

      if (response.ok) {
        toast.success('Vote recorded!')
        fetchData()
      } else {
        throw new Error('Failed to vote')
      }
    } catch (error) {
      toast.error('Failed to record vote')
    }
  }

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: bountyData?.title || 'Bounty',
        text: bountyData?.description || '',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const renderSubmission = (submission: any, isUserSubmission: boolean = false) => {
    // Determine if submission should be anonymized (only for non-owners/non-admins)
    const shouldAnonymize = !isUserSubmission && user?.id !== submission.submitterId && !(isOwner || isAdmin)
    
    return (
      <Card key={submission.id} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary/60 bg-gradient-to-br from-background to-muted/20 w-full min-w-0">
        <CardContent className="p-0">
          {/* Header Section */}
          <div className="p-4 sm:p-6 pb-4 border-b border-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors break-words">
                    {shouldAnonymize ? 'Anonymous Submission' : submission.title}
                  </h3>
                  <Badge variant="secondary" className={`${getStatusColor(submission.status)} shadow-sm`}>
                    {submission.status}
                  </Badge>
                  {shouldAnonymize && (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                  {isUserSubmission && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      <Eye className="h-3 w-3 mr-1" />
                      Your Submission
                    </Badge>
                  )}
                </div>
                
                {/* Score Display */}
                {submission.score && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-primary">
                        {submission.score}/100
                      </span>
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                  </div>
                )}
                
                {/* Screening Information */}
                {submission.scoringJobs?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {submission.scoringJobs.map((job: any) => (
                        <motion.div
                          key={job.id}
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {job.status === 'COMPLETED' ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm hover:bg-emerald-100 transition-all">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Scored by {job.screener.name}
                            </Badge>
                          ) : job.status === 'SCORING' ? (
                            <Link href={`/scoring-jobs/${job.id}`}>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 cursor-pointer shadow-sm transition-all animate-pulse">
                                <Clock className="h-3 w-3 mr-1" />
                                Being scored by {job.screener.name}
                              </Badge>
                            </Link>
                          ) : job.status === 'FAILED' ? (
                            <Link href={`/scoring-jobs/${job.id}`}>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 cursor-pointer shadow-sm transition-all">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Failed by {job.screener.name}
                              </Badge>
                            </Link>
                          ) : (
                            <Link href={`/scoring-jobs/${job.id}`}>
                              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-sm transition-all">
                                <Clock className="h-3 w-3 mr-1" />
                                {job.status.toLowerCase()} by {job.screener.name}
                              </Badge>
                            </Link>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status Indicator & Admin Actions */}
              <div className="flex flex-col items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  submission.status === 'WINNER' ? 'bg-purple-500 shadow-purple-500/50' :
                  submission.status === 'APPROVED' ? 'bg-green-500 shadow-green-500/50' :
                  submission.status === 'REJECTED' ? 'bg-red-500 shadow-red-500/50' :
                  'bg-orange-500 shadow-orange-500/50'
                } shadow-lg`} />
                
                {/* Vote Buttons (only for authenticated users, not their own submissions) */}
                {isAuthenticated && user?.id !== submission.submitterId && !(isOwner || isAdmin) && (
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(submission.id, 'UPVOTE')}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 w-8 h-8 p-0"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(submission.id, 'DOWNVOTE')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 w-8 h-8 p-0"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 pt-4">
            <p className="text-muted-foreground leading-relaxed mb-4">
              {shouldAnonymize ? 'Submission content hidden for privacy' : submission.description}
            </p>
            
            {/* User Information */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <User className="h-4 w-4" />
                <span>
                  {shouldAnonymize 
                    ? 'Anonymous User' 
                    : `@${submission.submitter?.username || submission.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}`
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                <Calendar className="h-4 w-4" />
                <span>Submitted {submission.createdAt?.split('T')[0] || 'Unknown date'}</span>
              </div>
              {submission.contentType && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                  {submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-blue-500" />}
                  {submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-green-500" />}
                  {submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-purple-500" />}
                  {submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-orange-500" />}
                  <span className="capitalize">{submission.contentType.toLowerCase()}</span>
                </div>
              )}
              {submission.files?.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-full">
                  <FileText className="h-4 w-4" />
                  <span>
                    {shouldAnonymize ? 'Has attachments' : `${submission.files.length} ${submission.files.length === 1 ? 'file' : 'files'}`}
                  </span>
                </div>
              )}
            </div>

            {/* Display URLs only if not anonymized */}
            {!shouldAnonymize && submission.urls && submission.urls.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-blue-500" />
                  Links
                </h4>
                <div className="space-y-2">
                  {submission.urls.map((url: string, urlIndex: number) => (
                    <div key={urlIndex} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-blue-50/50 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Link2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium break-all flex-1 min-w-0 overflow-hidden"
                        title={url}
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display text content only if not anonymized */}
            {!shouldAnonymize && submission.textContent && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-purple-500" />
                  Content
                </h4>
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 border border-purple-100 rounded-lg">
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {submission.textContent}
                  </div>
                </div>
              </div>
            )}

            {/* Display files only if not anonymized */}
            {!shouldAnonymize && submission.files?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  Attachments
                </h4>
                <div className="border rounded-lg p-3 sm:p-4 shadow-sm">
                  <FileDisplay files={submission.files} />
                </div>
              </div>
            )}

            {/* Feedback section (only for admin or user's own submissions) */}
            {!shouldAnonymize && submission.feedback && (
              <div className="mt-6 p-4 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 border border-orange-100 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-4 w-4" />
                  Feedback
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {submission.feedback}
                </p>
              </div>
            )}

            {/* Admin Actions (only for bounty owners/admins) */}
            {/* {(isOwner || isAdmin) && (
              <div className="mt-6 p-4 bg-gradient-to-br from-slate-50/50 to-gray-50/50 border border-slate-200 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-700">
                  <Settings className="h-4 w-4" />
                  Admin Actions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Handle status update
                      toast.info('Status update functionality would go here')
                    }}
                  >
                    Update Status
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Handle add feedback
                      toast.info('Add feedback functionality would go here')
                    }}
                  >
                    Add Feedback
                  </Button>
                </div>
              </div>
            )} */}
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBounty = bountyData || bounty
  const canSubmit = user && currentBounty?.status === 'ACTIVE' && !isOwner

  // Get all submissions to display
  const submissionsToDisplay = (() => {
    // Combine user submissions and anonymized submissions
    const combined = [...userSubmissions]
    allSubmissions.forEach((submission: any) => {
      if (!userSubmissions.some((userSub: any) => userSub.id === submission.id)) {
        combined.push(submission)
      }
    })
    return combined
  })()

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/bounties" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bounties
        </Link>
        
        {/* Admin Badge */}
        {isAuthenticated && (isOwner || isAdmin) && (
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            <Settings className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )}
      </div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-start gap-3">
                <Badge className={getStatusColor(currentBounty?.status || 'DRAFT')}>
                  {currentBounty?.status || 'DRAFT'}
                </Badge>
                {currentBounty?.categories?.map((category: any) => (
                  <Badge 
                    key={category.id} 
                    variant="outline"
                    style={{ borderColor: category.color }}
                  >
                    {category.name}
                  </Badge>
                ))}
                {(isOwner || isAdmin) && (
                  <Badge variant="outline" className="bg-primary text-primary-foreground">
                    <Settings className="h-3 w-3 mr-1" />
                    Admin View
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold tracking-tight">
                {currentBounty?.title || 'Untitled Bounty'}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {currentBounty?.description || 'No description provided'}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>by @{currentBounty?.creator?.username || currentBounty?.creator?.walletAddress?.slice(0, 8) || 'Unknown'}</span>
                </div>
                {currentBounty?.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{currentBounty.createdAt.split('T')[0]}</span>
                  </div>
                )}
                {currentBounty?.deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Due: {currentBounty.deadline.split('T')[0]}</span>
                  </div>
                )}
              </div>

              {/* Submission Types */}
              {currentBounty?.acceptedSubmissionTypes && currentBounty.acceptedSubmissionTypes.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Accepts:</span>
                  {currentBounty.acceptedSubmissionTypes.map((type: string) => (
                    <Badge key={type} variant="outline" className="flex items-center gap-1">
                      {type === 'URL' && <Link2 className="h-3 w-3 text-blue-500" />}
                      {type === 'FILE' && <Upload className="h-3 w-3 text-green-500" />}
                      {type === 'TEXT' && <Type className="h-3 w-3 text-purple-500" />}
                      {type === 'MIXED' && <Trophy className="h-3 w-3 text-orange-500" />}
                      {type === 'URL' && 'URLs'}
                      {type === 'FILE' && 'Files'}
                      {type === 'TEXT' && 'Text'}
                      {type === 'MIXED' && 'Mixed'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Reward Info */}
            <Card className="w-full lg:w-80 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" />
                  Reward Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                      <Coins className="h-6 w-6" />
                      {currentBounty?.alphaReward || '0'} α
                    </div>
                    <p className="text-xs text-muted-foreground">Current Reward</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-orange-600">
                      <Target className="h-6 w-6" />
                      {currentBounty?.alphaRewardCap || '0'} α
                    </div>
                    <p className="text-xs text-muted-foreground">Max Cap</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Distribution:</span>
                    <span className="text-sm font-medium">
                      {currentBounty?.rewardDistribution === 'ALL_AT_ONCE' ? '60% at once' : '100% over time'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Winners:</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentBounty?.winningSpots || 1}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4">
                  {canSubmit && (
                    <Dialog open={isSubmissionDialogOpen} onOpenChange={(open) => {
                      setIsSubmissionDialogOpen(open)
                      if (open) {
                        setTriggerUpload(false)
                        setUploadedFiles([])
                        setSubmissionId(null)
                        const defaultContentType = currentBounty?.acceptedSubmissionTypes?.[0] || 'FILE'
                        setSubmissionForm({ title: '', description: '', contentType: defaultContentType, urls: [''], textContent: '' })
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Plus className="mr-2 h-4 w-4" />
                          Submit Solution
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 w-[calc(100vw-2rem)] sm:w-full">
                        <DialogHeader>
                          <DialogTitle>Create Submission</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmissionSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Submission Title</Label>
                            <Input
                              id="title"
                              placeholder="Enter a title for your submission"
                              value={submissionForm.title}
                              onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Describe your solution and approach..."
                              rows={4}
                              value={submissionForm.description}
                              onChange={(e) => setSubmissionForm(prev => ({ ...prev, description: e.target.value }))}
                              required
                            />
                          </div>

                          {/* Content Type Selection */}
                          {currentBounty?.acceptedSubmissionTypes && currentBounty.acceptedSubmissionTypes.length > 1 && (
                            <div className="space-y-2">
                              <Label htmlFor="contentType">Submission Type</Label>
                              <Select
                                value={submissionForm.contentType}
                                onValueChange={(value) => setSubmissionForm(prev => ({ ...prev, contentType: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentBounty.acceptedSubmissionTypes.includes('URL') && (
                                    <SelectItem value="URL">
                                      <div className="flex items-center gap-2">
                                        <Link2 className="h-4 w-4 text-blue-500" />
                                        URL Submission
                                      </div>
                                    </SelectItem>
                                  )}
                                  {currentBounty.acceptedSubmissionTypes.includes('FILE') && (
                                    <SelectItem value="FILE">
                                      <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-green-500" />
                                        File Upload
                                      </div>
                                    </SelectItem>
                                  )}
                                  {currentBounty.acceptedSubmissionTypes.includes('TEXT') && (
                                    <SelectItem value="TEXT">
                                      <div className="flex items-center gap-2">
                                        <Type className="h-4 w-4 text-purple-500" />
                                        Text Content
                                      </div>
                                    </SelectItem>
                                  )}
                                  {currentBounty.acceptedSubmissionTypes.includes('MIXED') && (
                                    <SelectItem value="MIXED">
                                      <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-orange-500" />
                                        Mixed Submission
                                      </div>
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* URL Fields */}
                          {(submissionForm.contentType === 'URL' || submissionForm.contentType === 'MIXED') && (
                            <div className="space-y-2">
                              <Label>URLs</Label>
                              {submissionForm.urls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    placeholder="https://github.com/username/repo or https://demo.example.com"
                                    value={url}
                                    onChange={(e) => {
                                      const newUrls = [...submissionForm.urls]
                                      newUrls[index] = e.target.value
                                      setSubmissionForm(prev => ({ ...prev, urls: newUrls }))
                                    }}
                                    className="flex-1"
                                  />
                                  {submissionForm.urls.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newUrls = submissionForm.urls.filter((_, i) => i !== index)
                                        setSubmissionForm(prev => ({ ...prev, urls: newUrls }))
                                      }}
                                    >
                                      ×
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSubmissionForm(prev => ({ ...prev, urls: [...prev.urls, ''] }))
                                }}
                                className="w-full"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Another URL
                              </Button>
                            </div>
                          )}

                          {/* Text Content */}
                          {(submissionForm.contentType === 'TEXT' || submissionForm.contentType === 'MIXED') && (
                            <div className="space-y-2">
                              <Label htmlFor="textContent">Text Content</Label>
                              <Textarea
                                id="textContent"
                                placeholder="Provide your solution, code, explanation, or additional details..."
                                rows={6}
                                value={submissionForm.textContent}
                                onChange={(e) => setSubmissionForm(prev => ({ ...prev, textContent: e.target.value }))}
                              />
                            </div>
                          )}

                          {/* File Upload */}
                          {(submissionForm.contentType === 'FILE' || submissionForm.contentType === 'MIXED') && (
                            <div className="space-y-2">
                              <Label>File Attachments {submissionForm.contentType === 'MIXED' ? '(Optional)' : ''}</Label>
                              <FileUpload
                                submissionId={submissionId || undefined}
                                onFilesUploaded={handleFilesUploaded}
                                maxFiles={5}
                                triggerUpload={triggerUpload}
                                onPendingFilesChange={setPendingFilesCount}
                              />
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsSubmissionDialogOpen(false)
                                setSubmissionForm({ title: '', description: '', contentType: 'FILE', urls: [''], textContent: '' })
                                setUploadedFiles([])
                                setSubmissionId(null)
                                setPendingFilesCount(0)
                                setTriggerUpload(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Creating...' : 'Create Submission'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button variant="outline" onClick={shareUrl} className="w-full">
                    <Share className="mr-2 h-4 w-4" />
                    Share Bounty
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        {/* </div> */}
      </motion.div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">
            Details
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({submissionsToDisplay?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {currentBounty?.requirements || 'No requirements specified'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          {/* Sign in prompt for unauthenticated users */}
          {!isAuthenticated ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
                <p className="text-muted-foreground mb-4">
                  Please sign in to view and manage your submissions.
                </p>
                <Link href="/auth/signin">
                  <Button>Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          ) : submissionsToDisplay?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No submissions yet
                </h3>
                <p className="text-muted-foreground">
                  Be the first to submit a solution for this bounty!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1">
              {submissionsToDisplay?.map((submission: any, index: number) => {
                const isUserSubmission = user?.id === submission.submitterId
                
                return (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {renderSubmission(submission, isUserSubmission)}
                  </motion.div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Submission Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submissionsToDisplay?.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No submissions to rank yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissionsToDisplay
                    ?.sort((a: any, b: any) => parseFloat(b.score || '0') - parseFloat(a.score || '0'))
                    ?.map((submission: any, index: number) => {
                      const isUserSubmission = user?.id === submission.submitterId
                      const shouldAnonymize = !isUserSubmission && !(isOwner || isAdmin)

                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold break-words">
                              {shouldAnonymize ? 'Anonymous Submission' : submission.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              by {shouldAnonymize 
                                ? 'Anonymous User' 
                                : `@${submission.submitter?.username || submission.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}`
                              }
                              {isUserSubmission && <span className="text-blue-600 ml-2">(You)</span>}
                            </div>
                          </div>
                          <div className="text-right sm:text-right">
                            <div className="font-semibold">
                              {submission.score ? `${submission.score}/100` : 'No score'}
                            </div>
                            <Badge variant="secondary" className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}