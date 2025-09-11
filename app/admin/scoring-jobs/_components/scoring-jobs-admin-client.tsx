'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Search,
  Filter,
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
  Trophy,
  RefreshCw,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ScoringJobsAdminClientProps {
  user: any
}

export function ScoringJobsAdminClient({ user }: ScoringJobsAdminClientProps) {
  const router = useRouter()
  const [scoringJobs, setScoringJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [screenerFilter, setScreenerFilter] = useState('ALL')
  const [screeners, setScreeners] = useState<any[]>([])

  useEffect(() => {
    fetchScoringJobs()
    fetchScreeners()
  }, [])

  const fetchScoringJobs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/scoring-jobs')
      if (response.ok) {
        const data = await response.json()
        setScoringJobs(data)
      } else {
        throw new Error('Failed to fetch scoring jobs')
      }
    } catch (error) {
      console.error('Error fetching scoring jobs:', error)
      toast.error('Failed to load scoring jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchScreeners = async () => {
    try {
      const response = await fetch('/api/screeners')
      if (response.ok) {
        const data = await response.json()
        setScreeners(data)
      }
    } catch (error) {
      console.error('Error fetching screeners:', error)
    }
  }

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

  const getStatusCounts = () => {
    const counts = {
      total: scoringJobs.length,
      pending: scoringJobs.filter(job => job.status === 'PENDING').length,
      assigned: scoringJobs.filter(job => job.status === 'ASSIGNED').length,
      scoring: scoringJobs.filter(job => job.status === 'SCORING').length,
      completed: scoringJobs.filter(job => job.status === 'COMPLETED').length,
      failed: scoringJobs.filter(job => job.status === 'FAILED').length,
      cancelled: scoringJobs.filter(job => job.status === 'CANCELLED').length,
    }
    return counts
  }

  const filteredJobs = scoringJobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.submission.bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.screener.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    const matchesScreener = screenerFilter === 'ALL' || job.screenerId === screenerFilter
    
    return matchesSearch && matchesStatus && matchesScreener
  })

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <Badge variant="outline" className="bg-primary text-primary-foreground">
          Admin Panel
        </Badge>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Scoring Jobs</h1>
            <p className="text-muted-foreground">
              Manage and monitor submission scoring processes
            </p>
          </div>
          
          <Button onClick={fetchScoringJobs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{statusCounts.total}</div>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{statusCounts.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.assigned}</div>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{statusCounts.scoring}</div>
                <p className="text-sm text-muted-foreground">Scoring</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.failed}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search by title, bounty, screener, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="SCORING">Scoring</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="screener">Filter by Screener</Label>
              <Select value={screenerFilter} onValueChange={setScreenerFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Screeners</SelectItem>
                  {screeners.map((screener) => (
                    <SelectItem key={screener.id} value={screener.id}>
                      {screener.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Jobs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading scoring jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scoring jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'ALL' || screenerFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'No scoring jobs have been created yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job: any, index: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(job.status)}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(job.status)}
                              {job.status}
                            </div>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Job #{job.id.slice(-8)}
                          </span>
                          {job.score && (
                            <Badge variant="outline">
                              Score: {job.score}/100
                            </Badge>
                          )}
                        </div>

                        {/* Submission and Bounty Info */}
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {job.submission.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Submission for: <span className="font-medium">{job.submission.bounty.title}</span>
                          </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Screener</p>
                              <p className="text-muted-foreground">{job.screener.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Submitter</p>
                              <p className="text-muted-foreground">
                                @{job.submission.submitter.username || job.submission.submitter.walletAddress?.slice(0, 8)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Created</p>
                              <p className="text-muted-foreground">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Duration</p>
                              <p className="text-muted-foreground">
                                {job.completedAt && job.startedAt
                                  ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)}m`
                                  : job.startedAt
                                  ? `${Math.round((Date.now() - new Date(job.startedAt).getTime()) / 60000)}m`
                                  : 'Not started'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Error Message */}
                        {job.errorMessage && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-red-800">Error</p>
                                <p className="text-sm text-red-700">{job.errorMessage}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Retry Information */}
                        {job.retryCount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <RefreshCw className="h-4 w-4" />
                            <span>Retries: {job.retryCount}/{job.maxRetries}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link href={`/scoring-jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        
                        <Link href={`/bounties/${job.submission.bounty.id}`}>
                          <Button variant="ghost" size="sm">
                            <Trophy className="h-4 w-4 mr-2" />
                            View Bounty
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!isLoading && filteredJobs.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {filteredJobs.length} of {scoringJobs.length} scoring jobs
        </div>
      )}
    </div>
  )
}