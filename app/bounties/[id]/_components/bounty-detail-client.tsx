
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
import { FileUpload } from '@/components/file-upload'
import { FileDisplay } from '@/components/file-display'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  Link2,
  Upload,
  Type
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface BountyDetailClientProps {
  bounty: any
  user?: any
  isAdminView?: boolean
}

export function BountyDetailClient({ bounty, user, isAdminView = false }: BountyDetailClientProps) {
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bountyData, setBountyData] = useState<any>(bounty?.loading ? null : bounty)
  const [submissions, setSubmissions] = useState(bounty?.submissions || [])
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
    // If we have a submission ID and files were actually uploaded (have id field), close the dialog and refresh
    if (submissionId && files.length > 0 && files[0].id) {
      toast.success('Submission and files uploaded successfully!')
      setSubmissionForm({ title: '', description: '', contentType: 'FILE', urls: [''], textContent: '' })
      setUploadedFiles([])
      setSubmissionId(null)
      setTriggerUpload(false)
      setPendingFilesCount(0)
      setIsSubmissionDialogOpen(false)
      // Refresh the submissions list to show the uploaded files
      setTimeout(() => {
        fetchBountyData()
      }, 1000) // Give S3 a moment to propagate
    } else if (files.length > 0 && !submissionId) {
      // Files are ready but no submission ID yet (will be uploaded when submission is created)
      console.log(`${files.length} files ready for upload when submission is created`)
    }
  }

  // Fetch bounty data if not already loaded
  useEffect(() => {
    if (bounty?.loading && bounty?.id) {
      fetchBountyData()
    }
  }, [bounty?.id])

  const fetchBountyData = async () => {
    try {
      const response = await fetch(`/api/bounties/${bounty.id}`)
      if (response.ok) {
        const data = await response.json()
        setBountyData(data)
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Error fetching bounty data:', error)
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
      // First create the submission
      const response = await fetch(`/api/bounties/${bountyData?.id || bounty?.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submissionForm,
          urls: submissionForm.contentType === 'URL' || submissionForm.contentType === 'MIXED' 
            ? submissionForm.urls.filter(url => url.trim() !== '') 
            : [],
          textContent: submissionForm.contentType === 'TEXT' || submissionForm.contentType === 'MIXED'
            ? submissionForm.textContent
            : null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create submission')
      }

      // Set the submission ID for file uploads
      setSubmissionId(data.submission.id)

      // If there are files to upload, trigger automatic upload
      if (pendingFilesCount > 0) {
        toast.success('Submission created successfully! Uploading files...')
        // Trigger the upload after a short delay to ensure state has updated
        setTimeout(() => {
          setTriggerUpload(true)
        }, 100)
        // Don't close the dialog yet - let the FileUpload component handle it
      } else {
        toast.success('Submission created successfully!')
        setSubmissions((prev: any) => [data.submission, ...prev])
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
        // Here you would typically refresh the submissions data
      } else {
        throw new Error('Failed to vote')
      }
    } catch (error) {
      toast.error('Failed to record vote')
    }
  }

  const addUrlField = () => {
    setSubmissionForm(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }))
  }

  const removeUrlField = (index: number) => {
    setSubmissionForm(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index)
    }))
  }

  const updateUrl = (index: number, value: string) => {
    setSubmissionForm(prev => ({
      ...prev,
      urls: prev.urls.map((url, i) => i === index ? value : url)
    }))
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

  const currentBounty = bountyData || bounty
  const isOwner = user?.id === currentBounty?.creator?.id
  const canSubmit = user && currentBounty?.status === 'ACTIVE' && !isOwner

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
        
        {/* View Switcher */}
        {user && isAdminView && (
          <div className="flex items-center gap-2">
            <Link href={`/bounties/${currentBounty?.id || bounty?.id}/public`}>
              <Button variant="outline" size="sm">
                Public View
              </Button>
            </Link>
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              Admin View
            </Badge>
            <Link href={`/bounties/${currentBounty?.id || bounty?.id}/user`}>
              <Button variant="outline" size="sm">
                My Submissions
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Bounty Header */}
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
                <span>by @{currentBounty?.creator?.username || currentBounty?.creator?.hotkey?.slice(0, 8) || 'Unknown'}</span>
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
                      // Set initial content type based on what the bounty accepts
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
                    <DialogContent className="max-w-2xl">
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
                                  onChange={(e) => updateUrl(index, e.target.value)}
                                  className="flex-1"
                                />
                                {submissionForm.urls.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeUrlField(index)}
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
                              onClick={addUrlField}
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
      </motion.div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
            Details
          </TabsTrigger>
          <TabsTrigger value="submissions" onClick={() => setActiveTab('submissions')}>
            Submissions ({submissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" onClick={() => setActiveTab('leaderboard')}>
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
          {submissions?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                  Be the first to submit a solution for this bounty!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions?.map((submission: any, index: number) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{submission.title}</h3>
                            <Badge variant="secondary" className={getStatusColor(submission.status)}>
                              {submission.status}
                            </Badge>
                            {submission.score && (
                              <Badge variant="outline">
                                Score: {submission.score}/100
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {submission.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>@{submission.submitter?.username || submission.submitter?.hotkey?.slice(0, 8)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{submission.createdAt?.split('T')[0] || 'Unknown date'}</span>
                            </div>
                            {submission.contentType && (
                              <div className="flex items-center gap-1">
                                {submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-blue-500" />}
                                {submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-green-500" />}
                                {submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-purple-500" />}
                                {submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-orange-500" />}
                                <span>{submission.contentType}</span>
                              </div>
                            )}
                            {submission.files?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{submission.files.length} files</span>
                              </div>
                            )}
                          </div>

                          {/* Display URLs if any */}
                          {submission.urls && submission.urls.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <Label className="text-sm font-medium">Links:</Label>
                              <div className="space-y-1">
                                {submission.urls.map((url: string, urlIndex: number) => (
                                  <div key={urlIndex} className="flex items-center gap-2">
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
                          {submission.textContent && (
                            <div className="mt-4">
                              <Label className="text-sm font-medium">Additional Content:</Label>
                              <div className="mt-2 p-3 bg-muted/50 rounded-md">
                                <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                                  {submission.textContent}
                                </pre>
                              </div>
                            </div>
                          )}

                          {/* Display files if any */}
                          {submission.files?.length > 0 && (
                            <div className="mt-4">
                              <Label className="text-sm font-medium">Attachments:</Label>
                              <div className="mt-2">
                                <FileDisplay files={submission.files} />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Vote Buttons */}
                        {user && user.id !== submission.submitterId && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(submission.id, 'UPVOTE')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVote(submission.id, 'DOWNVOTE')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
              {submissions?.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No submissions to rank yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions
                    ?.sort((a: any, b: any) => parseFloat(b.score || '0') - parseFloat(a.score || '0'))
                    ?.map((submission: any, index: number) => (
                      <div key={submission.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{submission.title}</div>
                          <div className="text-sm text-muted-foreground">
                            by @{submission.submitter?.username || submission.submitter?.hotkey?.slice(0, 8)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {submission.score ? `${submission.score}/100` : 'No score'}
                          </div>
                          <Badge variant="secondary" className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
