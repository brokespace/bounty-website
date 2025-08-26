'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/file-upload'
import { FileDisplay } from '@/components/file-display'
import { 
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  User
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UserBountyClientProps {
  bounty: any
  user?: any
}

export function UserBountyClient({ bounty, user }: UserBountyClientProps) {
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [bountyData, setBountyData] = useState<any>(null)
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
        fetchUserSubmissions()
      }, 1000)
    } else if (files.length > 0 && !submissionId) {
      console.log(`${files.length} files ready for upload when submission is created`)
    }
  }

  // Fetch bounty data and user's submissions
  useEffect(() => {
    if (bounty?.id) {
      fetchBountyData()
      if (user) {
        fetchUserSubmissions()
      }
    }
  }, [bounty?.id, user])

  const fetchBountyData = async () => {
    try {
      const response = await fetch(`/api/bounties/${bounty.id}`)
      if (response.ok) {
        const data = await response.json()
        setBountyData(data)
      }
    } catch (error) {
      console.error('Error fetching bounty data:', error)
    }
  }

  const fetchUserSubmissions = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/bounties/${bounty.id}/submissions?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data || [])
      }
    } catch (error) {
      console.error('Error fetching user submissions:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
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

      if (bountyData?.acceptedSubmissionTypes?.includes('MIXED')) {
        contentType = 'MIXED'
      } else if (bountyData?.acceptedSubmissionTypes?.includes('URL') && hasUrls && !hasText && !hasFiles) {
        contentType = 'URL'
      } else if (bountyData?.acceptedSubmissionTypes?.includes('TEXT') && hasText && !hasUrls && !hasFiles) {
        contentType = 'TEXT'
      } else if (bountyData?.acceptedSubmissionTypes?.includes('FILE') && (hasFiles || (!hasUrls && !hasText))) {
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

      const response = await fetch(`/api/bounties/${bounty?.id}/submissions`, {
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
            <Link href={`/bounties/${bounty.id}/public`}>
              <Button variant="outline" size="sm">
                Public View
              </Button>
            </Link>
            <Badge variant="outline" className="bg-primary text-primary-foreground">
              My Submissions
            </Badge>
          </div>
        )}
      </div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              My Submissions
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your submissions and their status
            </p>
          </div>

          {user && bountyData?.status === 'ACTIVE' && (
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Submission
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
                  {bountyData?.acceptedSubmissionTypes?.includes('URL') && (
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

                  {bountyData?.acceptedSubmissionTypes?.includes('TEXT') && (
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

                  {(bountyData?.acceptedSubmissionTypes?.includes('FILE') || bountyData?.acceptedSubmissionTypes?.includes('MIXED')) && (
                    <div className="space-y-2">
                      <Label>File Attachments {bountyData?.acceptedSubmissionTypes?.includes('FILE') && !bountyData?.acceptedSubmissionTypes?.includes('MIXED') ? '' : '(Optional)'}</Label>
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
        </div>
      </motion.div>

      {/* Submissions List */}
      <div className="space-y-4">
        {!user ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
              <p className="text-muted-foreground">
                Please sign in to view and manage your submissions.
              </p>
            </CardContent>
          </Card>
        ) : submissions?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any solutions for this bounty yet.
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
                    <div className="space-y-4">
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
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {submission.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted: {submission.createdAt?.split('T')[0] || 'Unknown date'}</span>
                            </div>
                            {submission.files?.length > 0 && (
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span>{submission.files.length} files</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Display URLs if any */}
                      {submission.urls && submission.urls.length > 0 && (
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

                      {/* Display text content if any */}
                      {submission.textContent && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Text Content:</h4>
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {submission.textContent}
                          </div>
                        </div>
                      )}

                      {/* Display files if any */}
                      {submission.files?.length > 0 && (
                        <div className="mt-4">
                          <FileDisplay files={submission.files} />
                        </div>
                      )}

                      {/* Feedback section */}
                      {submission.feedback && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Feedback:</h4>
                          <p className="text-sm text-muted-foreground">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}