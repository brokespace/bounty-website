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
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Coins, 
  Target, 
  ArrowLeft,
  Plus,
  FileText,
  User,
  Share,
  Eye,
  EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface PublicBountyClientProps {
  bounty: any
  user?: any
}

export function PublicBountyClient({ bounty, user }: PublicBountyClientProps) {
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
    if (bounty?.loading && bounty?.id) {
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
    const isAnonymized = !isUserSubmission && user?.id !== submission.submitterId

    return (
      <Card key={submission.id} className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">
                  {isAnonymized ? 'Anonymous Submission' : submission.title}
                </h3>
                <Badge variant="secondary" className={getStatusColor(submission.status)}>
                  {submission.status}
                </Badge>
                {submission.score && (
                  <Badge variant="outline">
                    Score: {submission.score}/100
                  </Badge>
                )}
                {isAnonymized && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Anonymous
                  </Badge>
                )}
                {isUserSubmission && (
                  <Badge variant="outline" className="text-blue-600">
                    <Eye className="h-3 w-3 mr-1" />
                    Your Submission
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {isAnonymized ? 'Submission content hidden for privacy' : submission.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>
                    {isAnonymized 
                      ? 'Anonymous User' 
                      : `@${submission.submitter?.username || submission.submitter?.hotkey?.slice(0, 8) || 'Unknown'}`
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{submission.createdAt?.split('T')[0] || 'Unknown date'}</span>
                </div>
                {submission.files?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>
                      {isAnonymized ? 'Has attachments' : `${submission.files.length} files`}
                    </span>
                  </div>
                )}
              </div>

              {/* Display URLs only for user's own submissions */}
              {!isAnonymized && submission.urls && submission.urls.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">URLs:</h4>
                  <div className="space-y-1">
                    {submission.urls.map((url: string, urlIndex: number) => (
                      <div key={urlIndex} className="text-sm">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline break-all"
                        >
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display text content only for user's own submissions */}
              {!isAnonymized && submission.textContent && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Text Content:</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.textContent}
                  </div>
                </div>
              )}

              {/* Display files only for user's own submissions */}
              {!isAnonymized && submission.files?.length > 0 && (
                <div className="mt-4">
                  <FileDisplay files={submission.files} />
                </div>
              )}

              {/* Feedback section for user's own submissions */}
              {!isAnonymized && submission.feedback && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Feedback:</h4>
                  <p className="text-sm text-muted-foreground">
                    {submission.feedback}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentBounty = bountyData || bounty
  const isOwner = user?.id === currentBounty?.creator?.id
  const canSubmit = user && currentBounty?.status === 'ACTIVE' && !isOwner

  // Combine and deduplicate submissions for display
  const combinedSubmissions = [...userSubmissions]
  allSubmissions.forEach((submission: any) => {
    if (!userSubmissions.some((userSub: any) => userSub.id === submission.id)) {
      combinedSubmissions.push(submission)
    }
  })

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
        {user && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              Public View
            </Badge>
            {isOwner && (
              <Link href={`/bounties/${bounty.id}/admin`}>
                <Button variant="outline" size="sm">
                  Admin View
                </Button>
              </Link>
            )}
            <Link href={`/bounties/${bounty.id}/user`}>
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
                      setSubmissionForm({ title: '', description: '', contentType: 'FILE', urls: [''], textContent: '' })
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

                        {/* Dynamic submission inputs based on accepted types */}
                        {currentBounty?.acceptedSubmissionTypes?.includes('URL') && (
                          <div className="space-y-2">
                            <Label htmlFor="urls">URLs</Label>
                            <div className="space-y-2">
                              {submissionForm.urls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    placeholder="Enter URL (GitHub repo, demo link, etc.)"
                                    value={url}
                                    onChange={(e) => {
                                      const newUrls = [...submissionForm.urls]
                                      newUrls[index] = e.target.value
                                      setSubmissionForm(prev => ({ ...prev, urls: newUrls }))
                                    }}
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
                                      Remove
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
                              >
                                Add URL
                              </Button>
                            </div>
                          </div>
                        )}

                        {currentBounty?.acceptedSubmissionTypes?.includes('TEXT') && (
                          <div className="space-y-2">
                            <Label htmlFor="textContent">Text Content</Label>
                            <Textarea
                              id="textContent"
                              placeholder="Enter your solution, code snippets, explanations, etc..."
                              rows={6}
                              value={submissionForm.textContent}
                              onChange={(e) => setSubmissionForm(prev => ({ ...prev, textContent: e.target.value }))}
                            />
                          </div>
                        )}

                        {(currentBounty?.acceptedSubmissionTypes?.includes('FILE') || currentBounty?.acceptedSubmissionTypes?.includes('MIXED')) && (
                          <div className="space-y-2">
                            <Label>File Attachments {currentBounty?.acceptedSubmissionTypes?.includes('FILE') && !currentBounty?.acceptedSubmissionTypes?.includes('MIXED') ? '' : '(Optional)'}</Label>
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
          <TabsTrigger value="details">
            Details
          </TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions ({combinedSubmissions?.length || 0})
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
          {combinedSubmissions?.length === 0 ? (
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
              {combinedSubmissions?.map((submission: any, index: number) => {
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
              {combinedSubmissions?.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No submissions to rank yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {combinedSubmissions
                    ?.sort((a: any, b: any) => parseFloat(b.score || '0') - parseFloat(a.score || '0'))
                    ?.map((submission: any, index: number) => {
                      const isUserSubmission = user?.id === submission.submitterId
                      const isAnonymized = !isUserSubmission

                      return (
                        <div key={submission.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">
                              {isAnonymized ? 'Anonymous Submission' : submission.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              by {isAnonymized 
                                ? 'Anonymous User' 
                                : `@${submission.submitter?.username || submission.submitter?.hotkey?.slice(0, 8) || 'Unknown'}`
                              }
                              {isUserSubmission && <span className="text-blue-600 ml-2">(You)</span>}
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