'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { SubmissionDisclaimer } from '@/components/submission-disclaimer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import ReactMarkdown from 'react-markdown'
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
  Settings,
  Medal,
  Key,
  ChevronDown,
  ArrowRight,
  FileStack,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { getSweRizzoPrice, formatUSDPrice } from '@/lib/coingecko'

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
  const router = useRouter()
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [isDisclaimerVisible, setIsDisclaimerVisible] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bountyData, setBountyData] = useState<any>(bounty?.loading ? null : bounty)
  const [allSubmissions, setAllSubmissions] = useState<any[]>([])
  const [userSubmissions, setUserSubmissions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('information')
  const [requirementsOpen, setRequirementsOpen] = useState(false)
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(true)

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

  // Fetch USD price
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getSweRizzoPrice()
        setUsdPrice(price)
      } catch (error) {
        console.error('Failed to fetch SWE-RIZZO price:', error)
      } finally {
        setIsLoadingPrice(false)
      }
    }

    fetchPrice()
  }, [])

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
      const currentBountyRef = bountyData || bounty
      let contentType = 'FILE' // default
      const hasUrls = submissionForm.urls.some(url => url.trim() !== '')
      const hasText = submissionForm.textContent.trim() !== ''
      const hasFiles = pendingFilesCount > 0

      if (currentBountyRef?.acceptedSubmissionTypes?.includes('MIXED')) {
        contentType = 'MIXED'
      } else if (currentBountyRef?.acceptedSubmissionTypes?.includes('URL') && hasUrls && !hasText && !hasFiles) {
        contentType = 'URL'
      } else if (currentBountyRef?.acceptedSubmissionTypes?.includes('TEXT') && hasText && !hasUrls && !hasFiles) {
        contentType = 'TEXT'
      } else if (currentBountyRef?.acceptedSubmissionTypes?.includes('FILE') && (hasFiles || (!hasUrls && !hasText))) {
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

  const handleSubmitClick = () => {
    const currentBountyRef = bountyData || bounty
    
    // Check if bounty has a disclaimer
    if (currentBountyRef?.submissionDisclaimer && !disclaimerAccepted) {
      setIsDisclaimerVisible(true)
    } else {
      // Proceed directly to submission dialog
      openSubmissionDialog()
    }
  }

  const openSubmissionDialog = () => {
    setTriggerUpload(false)
    setUploadedFiles([])
    setSubmissionId(null)
    const currentBountyRef = bountyData || bounty
    const defaultContentType = currentBountyRef?.acceptedSubmissionTypes?.[0] || 'FILE'
    setSubmissionForm({ title: '', description: '', contentType: defaultContentType, urls: [''], textContent: '' })
    setIsSubmissionDialogOpen(true)
  }

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true)
    setIsDisclaimerVisible(false)
    openSubmissionDialog()
  }

  const handleDisclaimerDecline = () => {
    setIsDisclaimerVisible(false)
  }

  const renderSubmission = (submission: any, isUserSubmission: boolean = false) => {
    // Use server-provided anonymization flag, fallback to client-side logic for compatibility
    const shouldAnonymize = submission.isAnonymized !== undefined 
      ? submission.isAnonymized 
      : (!isUserSubmission && user?.id !== submission.submitterId && !(isOwner || isAdmin))

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="group"
      >
        <Card className="relative overflow-hidden border border-accent/30 hover:border-accent/50 w-full min-w-0 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute -top-40 -right-40 w-40 h-40 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <CardContent className="p-0 relative z-10">
            {/* Header Section */}
            <div className="p-4 sm:p-6 pb-4 border-b border-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-purple transition-all duration-300 break-words">
                      {shouldAnonymize ? '🎭 Anonymous Submission' : submission.title}
                    </h3>
                    <Badge variant="secondary" className={`${getStatusColor(submission.status)} shadow-sm`}>
                      {submission.status}
                    </Badge>
                    {shouldAnonymize && (
                      <Badge variant="outline" className="glass-effect border-muted/50 text-muted-foreground hover:border-primary/50 transition-all duration-300">
                        <EyeOff className="h-3 w-3 mr-1" />
                        🎭 Anonymous
                      </Badge>
                    )}
                    {isUserSubmission && (
                      <Badge variant="outline" className="glass-effect border-accent/50 text-accent hover:border-accent/70 transition-all duration-300 animate-glow">
                        <Eye className="h-3 w-3 mr-1" />
                        🏆 Your Submission
                      </Badge>
                    )}
                  </div>

                  {/* Score Display */}
                  {submission.score && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <FileStack className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-primary">
                          {submission.score}/100
                        </span>
                        <span className="text-xs text-muted-foreground">Score</span>
                      </div>
                    </div>
                  )}

                  {/* Screening Information */}
                  {submission.scoringJobs?.length > 0 && (
                    <div className="">
                      <div className="flex flex-wrap gap-2">
                        {submission.scoringJobs.map((job: any) => (
                          <motion.div
                            key={job.id}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {job.status === 'COMPLETED' ? (
                              <Link href={`/scoring-jobs/${job.id}`}>
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm hover:bg-emerald-100 transition-all">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Scored by {job.screener.name}
                                </Badge>
                              </Link>
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
                  <div className={`w-3 h-3 rounded-full ${submission.status === 'WINNER' ? 'bg-purple-500 shadow-purple-500/50' :
                    submission.status === 'APPROVED' ? 'bg-green-500 shadow-green-500/50' :
                      submission.status === 'REJECTED' ? 'bg-red-500 shadow-red-500/50' :
                        'bg-orange-500 shadow-orange-500/50'
                    } shadow-lg`} />

                  {/* Enhanced Vote Buttons */}
                  {/* {isAuthenticated && user?.id !== submission.submitterId && !(isOwner || isAdmin) && (
                    <div className="flex flex-col gap-2">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(submission.id, 'UPVOTE')}
                          className="glass-effect border border-green-500/30 hover:border-green-500/60 text-green-400 hover:text-green-300 hover:bg-green-500/10 w-10 h-10 p-0 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/20"
                        >
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(submission.id, 'DOWNVOTE')}
                          className="glass-effect border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-10 h-10 p-0 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                        >
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  )} */}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="pl-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-3 text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                Description
              </h3>
              <div className="pl-4 border-l-2 border-primary/30">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {shouldAnonymize ? 'Submission content hidden for privacy' : submission.description}
                </p>
              </div>
            </motion.div>

              {/* Enhanced User Information */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass-effect border border-primary/30 rounded-full hover:border-primary/50 transition-all duration-300"
                >
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gradient">
                    {shouldAnonymize
                      ? '🕵️ Anonymous'
                      : `@${submission.submitter?.username || submission.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}`
                    }
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass-effect border border-accent/30 rounded-full hover:border-accent/50 transition-all duration-300"
                >
                  <Calendar className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-gradient">Submitted {submission.createdAt?.split('T')[0] || 'Unknown date'}</span>
                </motion.div>
                {submission.contentType && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 glass-effect border border-purple/30 rounded-full hover:border-purple/50 transition-all duration-300"
                  >
                    {submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-blue-400" />}
                    {submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-green-400" />}
                    {submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-purple-400" />}
                    {submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-orange-400" />}
                    <span className="text-sm font-medium text-gradient capitalize">{submission.contentType.toLowerCase()}</span>
                  </motion.div>
                )}
                {submission.files?.length > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 glass-effect border border-emerald-500/30 rounded-full hover:border-emerald-500/50 transition-all duration-300"
                  >
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-gradient">
                      {shouldAnonymize ? 'Has attachments' : `${submission.files.length} ${submission.files.length === 1 ? 'file' : 'files'}`}
                    </span>
                  </motion.div>
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
      </motion.div>
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
    <div className="space-y-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 glass-effect hover:glow-border border border-primary/30 hover:border-primary/60 text-primary hover:text-accent transition-all duration-300 rounded-xl group transform hover:scale-105 shadow-lg shadow-primary/10 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium text-gradient">Back</span>
        </button>

        {/* Share Button */}
        {/* <Button
          variant="outline"
          onClick={shareUrl}
          className="glass-effect hover:glow-border border border-accent/30 hover:border-accent/60 text-accent hover:text-primary transition-all duration-300 rounded-xl px-6 py-3 group transform hover:scale-105 shadow-lg shadow-accent/10"
        >
          <Share className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
          <span className="font-medium text-gradient">Share Hunt</span>
        </Button> */}
      </motion.div>

      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden border  hover:border-primary/50  backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-primary/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-conic from-primary via-accent to-purple opacity-10 rounded-full blur-3xl animate-float" />
        <div className="p-6 lg:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            {/* Left Side - Bounty Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getStatusColor(currentBounty?.status || 'DRAFT')} text-xs px-3 py-1 rounded-lg`}>
                  {currentBounty?.status || 'DRAFT'}
                </Badge>
                {currentBounty?.categories?.map((category: any) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="text-xs px-3 py-1 rounded-lg"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl lg:text-4xl font-bold leading-tight"
              >
                <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                  {currentBounty?.title || 'Untitled Bounty'}
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-purple/20 blur-2xl animate-pulse-slow -z-10 rounded-full" />
                <p className="text-xl text-muted-foreground leading-relaxed relative z-10">
                  {currentBounty?.problem || 'No problem statement provided'}
                </p>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap items-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="flex items-center gap-2 px-4 py-2 glass-effect border border-primary/30 rounded-full"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gradient">{submissionsToDisplay?.length || 0} submissions</span>
                </motion.div>
                {currentBounty?.deadline && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 glass-effect border border-accent/30 rounded-full"
                  >
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-gradient">Due {new Date(currentBounty.deadline).toLocaleDateString()}</span>
                  </motion.div>
                )}
                {currentBounty?.createdAt && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 glass-effect border border-purple/30 rounded-full"
                  >
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-gradient">Created {new Date(currentBounty.createdAt).toLocaleDateString()}</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Right Side - Enhanced Reward Display */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:w-72 mr-4"
            >
              <div className="lg:w-80">
                <div className="border border-primary/30 rounded-2xl shadow-sm p-6 bg-primary/5">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-primary">Win Alpha!</span>
                    </div>

                      {currentBounty?.winningSpotConfigs && currentBounty.winningSpotConfigs.length > 1 ? (
                        <div className="space-y-2">
                          {currentBounty.winningSpotConfigs.slice(0, 3).map((spot: any, index: number) => {
                            const getPositionStyles = (position: number) => {
                              switch (position) {
                                case 1: return {
                                  gradient: 'from-primary/15 via-accent/15 to-purple/15',
                                  border: 'border-primary/50',
                                  accent: 'bg-gradient-to-r from-primary to-accent',
                                  textColor: 'text-gradient',
                                  shadowColor: 'shadow-primary/20'
                                }
                                case 2: return {
                                  gradient: 'from-accent/15 via-purple/15 to-primary/15',
                                  border: 'border-accent/50',
                                  accent: 'bg-gradient-to-r from-accent to-purple',
                                  textColor: 'text-gradient',
                                  shadowColor: 'shadow-accent/20'
                                }
                                case 3: return {
                                  gradient: 'from-purple/15 via-primary/15 to-accent/15',
                                  border: 'border-purple/50',
                                  accent: 'bg-gradient-to-r from-purple to-primary',
                                  textColor: 'text-gradient',
                                  shadowColor: 'shadow-purple/20'
                                }
                                default: return {
                                  gradient: 'from-muted/20 via-muted/15 to-muted/10',
                                  border: 'border-muted/50',
                                  accent: 'bg-gradient-to-r from-muted-foreground to-primary',
                                  textColor: 'text-gradient',
                                  shadowColor: 'shadow-muted/20'
                                }
                              }
                            }

                            const getPositionEmoji = (position: number) => {
                              switch (position) {
                                case 1: return '👑'
                                case 2: return '🥈'
                                case 3: return '🥉'
                                default: return '🏆'
                              }
                            }

                            const getPositionLabel = (position: number) => {
                              switch (position) {
                                case 1: return 'Champion'
                                case 2: return 'Runner-up'
                                case 3: return '3rd Place'
                                default: return `${position}th Place`
                              }
                            }

                            // Generate a random URL for demonstration
                            const coldkeyUrl = `https://taostats.io/account/${spot.coldkey}`
                            const styles = getPositionStyles(spot.position)

                            return (
                              <div
                                key={spot.id}
                                className={`flex items-center justify-between p-3 bg-gradient-to-r ${styles.gradient} rounded-xl border ${styles.border} hover:border-primary/50 transition-colors shadow-lg ${styles.shadowColor}`}
                              >
                                {/* Left side - Position info */}
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <span className="text-lg">{getPositionEmoji(spot.position)}</span>
                                    <div className={`absolute -top-1 -right-1 w-4 h-4 ${styles.accent} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                                      {spot.position}
                                    </div>
                                  </div>
                                  <div className="grid gap-1 items-start">
                                    <div className={`text-sm font-medium ${styles.textColor} justify-self-start`}>
                                      {getPositionLabel(spot.position)}
                                    </div>
                                    {/* coldkey display */}
                                    {spot.coldkey && (
                                      <a
                                        href={coldkeyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-primary/30 rounded-full px-2 justify-self-start"
                                      >
                                        <Key className="h-3 w-3" />
                                        <span className="font-mono">
                                          {spot.coldkey.length > 8 ? `${spot.coldkey.slice(0, 8)}...` : spot.coldkey}
                                        </span>
                                      </a>
                                    )}
                                  </div>
                                </div>

                                {/* Right side - Reward */}
                                <div className="text-right">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 justify-end">
                                      <Coins className="h-4 w-4 text-yellow-600" />
                                      <span className={`font-bold ${styles.textColor}`}>{spot.reward}</span>
                                      <span className={`text-sm ${styles.textColor} opacity-70`}>α</span>
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                      <DollarSign className="h-3 w-3 text-green-500" />
                                      <span className="text-xs font-medium text-green-600">
                                        {isLoadingPrice ? '...' : formatUSDPrice(spot.reward, usdPrice)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {currentBounty.winningSpotConfigs.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{currentBounty.winningSpotConfigs.length - 3} more positions
                            </div>
                          )}
                        </div>
                      ) : currentBounty?.winningSpotConfigs && currentBounty.winningSpotConfigs.length === 1 ? (
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Coins className="h-6 w-6 text-yellow-600" />
                            <div className="text-2xl font-bold text-gray-200">
                              {currentBounty.winningSpotConfigs[0]?.reward || currentBounty?.alphaReward || '0'} α
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div className="text-lg font-bold text-green-600">
                              {isLoadingPrice ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                formatUSDPrice(currentBounty.winningSpotConfigs[0]?.reward || currentBounty?.alphaReward || '0', usdPrice)
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Winner takes all
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Coins className="h-6 w-6 text-yellow-600" />
                            <div className="text-2xl font-bold text-gray-200">
                              {currentBounty?.alphaReward || '0'} α
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div className="text-lg font-bold text-green-600">
                              {isLoadingPrice ? (
                                <span className="animate-pulse">Loading...</span>
                              ) : (
                                formatUSDPrice(currentBounty?.alphaReward || '0', usdPrice)
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            Total reward pool
                          </div>
                        </div>
                      )}

                      {/* Premium Submit Button */}
                      {canSubmit && (
                        <>
                          <Button 
                            onClick={handleSubmitClick}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
                          >
                            <Trophy className="mr-2 h-4 w-4" />
                            Submit Your Solution
                          </Button>
                          
                          <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
                            <DialogTrigger asChild>
                              <div style={{ display: 'none' }} />
                            </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[85vh] mx-4 w-[calc(100vw-2rem)] sm:w-full">
                            <DialogHeader>
                              <DialogTitle>Create Submission</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmissionSubmit} className="space-y-4 overflow-y-auto max-h-[calc(85vh-8rem)] px-1">
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
                        </>
                      )}

                      {!canSubmit && !isAuthenticated && (
                        <Link href="/auth/signin">
                          <Button variant="outline" className="w-full py-3 rounded-xl font-medium">
                            Sign In to Submit
                          </Button>
                        </Link>
                      )}

                      {!canSubmit && isAuthenticated && currentBounty?.status !== 'ACTIVE' && (
                        <Button variant="outline" className="w-full py-3 rounded-xl font-medium" disabled>
                          Submissions Closed
                        </Button>
                      )}

                      {isOwner && (
                        <Button variant="outline" className="w-full py-3 rounded-xl font-medium" disabled>
                          You Created This Bounty
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
            </motion.div>
            </div>
            </div>
            </motion.div>
      {/* Enhanced Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full h-full grid-cols-4 glass-effect border border-primary/30 p-2 rounded-xl shadow-lg ">
            <TabsTrigger
              value="information"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Info</span>
            </TabsTrigger>
            <TabsTrigger
              value="requirements"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-purple data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-accent transition-all duration-300"
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Requirements</span>
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="flex items-center gap-1 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-purple-400 transition-all duration-300"
            >
              <span className="truncate">Submissions ({submissionsToDisplay?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <span className="hidden sm:inline">Leaderboard</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="information">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-primary/30 hover:border-primary/50 bg-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
              <div className="p-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                    Information
                  </h2>
                </motion.div>
                <div className="space-y-6">
                  {/* Competition Details */}
                  <div>
                    {/* <h3 className="text-lg font-semibold mb-3">Description</h3> */}
                    <div className="prose prose-base max-w-none text-foreground leading-relaxed">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-primary border-b border-border pb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: ({ children, className }) => {
                            const isInline = !className
                            return isInline ? (
                              <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{children}</code>
                            ) : (
                              <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                                <code className="font-mono text-sm">{children}</code>
                              </pre>
                            )
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          a: ({ children, href }) => (
                            <a href={href} className="text-primary hover:text-primary/80 underline font-medium" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="my-4">
                              <table className="min-w-full border-collapse border border-border">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-border px-4 py-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {currentBounty?.info || 'No description provided'}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* Competition Metadata */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="border-t border-primary/30 pt-6"
                  >
                    <h3 className="font-bold text-xl mb-6 text-gradient bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">Bounty Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Creator Info */}
                      <div className="space-y-3">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="flex items-center gap-3 p-4 glass-effect border border-primary/30 rounded-xl hover:border-primary/50 transition-all duration-300"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">Created by</p>
                            <p className="text-sm text-gradient font-medium">
                              @{currentBounty?.creator?.username || currentBounty?.creator?.walletAddress?.slice(0, 8) || 'Unknown'}
                            </p>
                          </div>
                        </motion.div>

                        {currentBounty?.createdAt && (
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center gap-3 p-4 glass-effect border border-accent/30 rounded-xl hover:border-accent/50 transition-all duration-300"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-accent">Created</p>
                              <p className="text-sm text-gradient font-medium">
                                {new Date(currentBounty.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {currentBounty?.deadline && (
                          <motion.div
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center gap-3 p-4 glass-effect border border-purple/30 rounded-xl hover:border-purple/50 transition-all duration-300"
                          >
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="w-10 h-10 bg-gradient-to-br from-purple to-accent rounded-xl flex items-center justify-center shadow-lg"
                            >
                              <Clock className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-purple-400">Deadline</p>
                              <p className="text-sm text-gradient font-medium">
                                {new Date(currentBounty.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Submission Types */}
                      {currentBounty?.acceptedSubmissionTypes && currentBounty.acceptedSubmissionTypes.length > 0 && (
                        <div>
                          <h4 className="font-bold text-gradient mb-3">Accepted Submission Formats</h4>
                          <div className="space-y-2">
                            {currentBounty.acceptedSubmissionTypes.map((type: string) => (
                              <motion.div
                                key={type}
                                whileHover={{ scale: 1.03, y: -2 }}
                                className="flex items-center gap-3 p-4 glass-effect border border-primary/30 rounded-xl hover:border-primary/50 transition-all duration-300"
                              >
                                <motion.div
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${type === 'URL' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                                    type === 'FILE' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                      type === 'TEXT' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                                        'bg-gradient-to-br from-orange-500 to-yellow-500'
                                    }`}>
                                  {type === 'URL' && <Link2 className="h-5 w-5 text-white" />}
                                  {type === 'FILE' && <Upload className="h-5 w-5 text-white" />}
                                  {type === 'TEXT' && <Type className="h-5 w-5 text-white" />}
                                  {type === 'MIXED' && <Trophy className="h-5 w-5 text-white" />}
                                </motion.div>
                                <span className="font-bold text-gradient">
                                  {type === 'URL' && 'URL Links'}
                                  {type === 'FILE' && 'File Uploads'}
                                  {type === 'TEXT' && 'Text Content'}
                                  {type === 'MIXED' && 'Mixed Content'}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            {/* Sign in prompt for unauthenticated users */}
            {!isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card-enhanced relative border border-primary/30 bg-card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
                <div className="text-center py-16 px-6 relative z-10">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Authentication Required</h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    Join the hunt! Sign in to view submissions and track the competition.
                  </p>
                  <Link href="/auth/signin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 border border-primary/50 animate-glow">
                        <span className="flex items-center">
                          Join the Hunt
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            ) : submissionsToDisplay?.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="card-enhanced relative border border-accent/30 bg-card"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-purple/8 to-primary/8 animate-gradient-shift" />
                <div className="text-center py-16 px-6 relative z-10">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <FileStack className="h-8 w-8 text-accent" />
                  </motion.div>
                  <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
                    No Submissions Yet!
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Be the <span className="text-accent font-bold">first</span> to claim this bounty!
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-accent/30 hover:border-accent/50 bg-card"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-primary/8 to-purple/8 animate-gradient-shift" />
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl animate-pulse-slow" />
              <div className="p-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-3 mb-6"
                >
                  {/* <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-purple/20"
                  >
                    <Trophy className="h-6 w-6 text-accent" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
                    Submissions Leaderboard
                  </h2> */}
                </motion.div>
                {submissionsToDisplay?.length === 0 ? (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Trophy className="h-8 w-8 text-accent" />
                    </motion.div>
                    <p className="text-muted-foreground text-lg">No submissions to rank yet - be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissionsToDisplay
                      ?.sort((a: any, b: any) => parseFloat(b.score || '0') - parseFloat(a.score || '0'))
                      ?.map((submission: any, index: number) => {
                        const isUserSubmission = user?.id === submission.submitterId
                        const shouldAnonymize = submission.isAnonymized !== undefined 
                          ? submission.isAnonymized 
                          : (!isUserSubmission && !(isOwner || isAdmin))

                        return (
                          <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="flex items-center gap-4 p-5 glass-effect border border-primary/30 rounded-xl hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20 relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                            <motion.div
                              animate={{
                                rotate: index === 0 ? [0, 5, -5, 0] : 0,
                                scale: index === 0 ? [1, 1.1, 1] : 1
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              className={`flex items-center justify-center w-10 h-10 rounded-xl font-bold text-white shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500' :
                                  index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                                    'bg-gradient-to-br from-primary to-accent'
                                }`}
                            >
                              {index < 3 ? (index === 0 ? '👑' : index === 1 ? '🥈' : '🥉') : (index + 1)}
                            </motion.div>
                            <div className="flex-1 min-w-0 relative z-10">
                              <div className="font-bold text-lg text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                                {shouldAnonymize ? '🎭 Anonymous Submission' : submission.title}
                              </div>
                              <div className="text-sm text-muted-foreground font-medium">
                                by {shouldAnonymize
                                  ? '🕵️ Anonymous Submission'
                                  : `@${submission.submitter?.username || submission.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}`
                                }
                                {isUserSubmission && <span className="text-accent ml-2 font-bold">(Your Submission)</span>}
                              </div>
                            </div>
                            <div className="text-right relative z-10">
                              <motion.div
                                animate={submission.score ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="font-bold text-xl text-gradient bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent"
                              >
                                {submission.score ? `${submission.score}/100` : '⏳'}
                              </motion.div>
                              <Badge className={`${getStatusColor(submission.status)} text-xs px-3 py-1.5 rounded-lg font-bold shadow-lg`}>
                                {submission.status}
                              </Badge>
                            </div>
                          </motion.div>
                        )
                      })}
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-purple/30 hover:border-purple/50 bg-card overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple/8 via-primary/8 to-accent/8 animate-gradient-shift" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-purple/20 to-primary/20 rounded-full blur-3xl animate-float" />
              <div className="p-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="p-3 rounded-xl bg-gradient-to-br from-purple/20 to-primary/20"
                  >
                    <Target className="h-6 w-6 text-purple-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple via-primary to-accent bg-clip-text text-transparent">
                    Requirements
                  </h2>
                </motion.div>
                {currentBounty?.requirements ? (
                  <div className="prose prose-base max-w-none text-foreground leading-relaxed">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-2xl font-bold mt-8 mb-4 text-primary border-b border-border pb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{children}</code>
                          ) : (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
                              <code className="font-mono text-sm">{children}</code>
                            </pre>
                          )
                        },
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        a: ({ children, href }) => (
                          <a href={href} className="text-primary hover:text-primary/80 underline font-medium" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <div className="my-4">
                            <table className="min-w-full border-collapse border border-border">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-border px-4 py-2">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {currentBounty.requirements}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-16 h-16 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl flex items-center justify-center mx-auto mb-6"
                    >
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </motion.div>
                    <h3 className="font-bold mb-4 text-xl text-gradient bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent">Mission Briefing Pending</h3>
                    <p className="text-muted-foreground text-lg">
                      The bounty creator is still preparing the requirements. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Submission Disclaimer */}
      {(bountyData?.submissionDisclaimer || bounty?.submissionDisclaimer) && (
        <SubmissionDisclaimer
          disclaimer={bountyData?.submissionDisclaimer || bounty?.submissionDisclaimer}
          onAccept={handleDisclaimerAccept}
          onDecline={handleDisclaimerDecline}
          isVisible={isDisclaimerVisible}
        />
      )}
    </div>
  )
}