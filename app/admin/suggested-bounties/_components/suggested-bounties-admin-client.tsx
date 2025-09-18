'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ArrowLeft, CheckCircle, XCircle, Clock, Eye, Users, Coins, Calendar, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface SuggestedBounty {
  id: string
  title: string
  problem: string
  info: string
  requirements: string
  rewardDistribution: string
  winningSpots: number
  deadline: string | null
  acceptedSubmissionTypes: string[]
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    username: string | null
    walletAddress: string | null
  }
  bounty: {
    id: string
    title: string
    status: string
  } | null
  winningSpotConfigs: {
    position: number
    reward: number
    rewardCap: number
    coldkey: string
  }[]
}

interface SuggestedBountiesAdminClientProps {
  user: any
}

export function SuggestedBountiesAdminClient({ user }: SuggestedBountiesAdminClientProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<SuggestedBounty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestedBounty | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/suggested-bounties?status=${filter}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suggestions')
      }

      setSuggestions(data.suggestions || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [filter])

  const handleReview = async (suggestionId: string, action: 'approve' | 'reject') => {
    try {
      setIsReviewing(true)
      const response = await fetch(`/api/suggested-bounties/${suggestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} suggestion`)
      }

      toast.success(
        action === 'approve' 
          ? 'Suggestion approved and bounty created!' 
          : 'Suggestion rejected'
      )
      
      setSelectedSuggestion(null)
      fetchSuggestions()
      
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} suggestion`)
    } finally {
      setIsReviewing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSubmissionTypeBadges = (types: string[]) => {
    const typeColors = {
      URL: 'bg-blue-100 text-blue-800',
      FILE: 'bg-green-100 text-green-800',
      TEXT: 'bg-purple-100 text-purple-800',
      MIXED: 'bg-orange-100 text-orange-800'
    }

    return types.map(type => (
      <Badge key={type} variant="secondary" className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    ))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-fit p-3 bg-primary/10 rounded-full mb-4"
        >
          <AlertCircle className="h-8 w-8 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Suggested <span className="text-primary">Bounties</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Review and manage bounty suggestions from the community
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suggestions</SelectItem>
            <SelectItem value="PENDING">Pending Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Suggestions List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No suggestions found</h3>
            <p className="text-muted-foreground">
              {filter === 'PENDING' ? 'No pending suggestions to review' : `No ${filter.toLowerCase()} suggestions`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                      {getStatusBadge(suggestion.status)}
                    </div>
                    <p className="text-muted-foreground mb-2 line-clamp-2">{suggestion.problem}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {suggestion.creator.username || `User ${suggestion.creator.walletAddress?.slice(0, 8) || 'Unknown'}...`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {suggestion.winningSpotConfigs.length > 0 
                          ? `${suggestion.winningSpotConfigs[0].reward}α - ${suggestion.winningSpotConfigs[0].rewardCap}α`
                          : 'No rewards configured'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSuggestion(suggestion)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {getSubmissionTypeBadges(suggestion.acceptedSubmissionTypes)}
                </div>

                {suggestion.status === 'APPROVED' && suggestion.bounty && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Approved and converted to bounty: 
                      <Link href={`/bounties/${suggestion.bounty.id}`} className="ml-1 underline font-medium">
                        {suggestion.bounty.title}
                      </Link>
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedSuggestion} onOpenChange={(open) => !open && setSelectedSuggestion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSuggestion && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSuggestion.title}</DialogTitle>
                <DialogDescription>
                  Suggested by {selectedSuggestion.creator.username || `User ${selectedSuggestion.creator.walletAddress?.slice(0, 8) || 'Unknown'}...`} • 
                  {formatDistanceToNow(new Date(selectedSuggestion.createdAt), { addSuffix: true })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Problem Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedSuggestion.problem}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Technical Details</h4>
                  <p className="text-sm text-muted-foreground">{selectedSuggestion.info}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground">{selectedSuggestion.requirements}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Reward Structure</h4>
                    <div className="text-sm space-y-1">
                      <p>Distribution: {selectedSuggestion.rewardDistribution === 'ALL_AT_ONCE' ? 'All at Once' : 'Over Time'}</p>
                      <p>Winning Spots: {selectedSuggestion.winningSpots}</p>
                      {selectedSuggestion.winningSpotConfigs.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Reward Configuration:</p>
                          {selectedSuggestion.winningSpotConfigs.map((config, index) => (
                            <p key={index} className="ml-2">
                              Position {config.position}: {config.reward}α - {config.rewardCap}α
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Submission Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {getSubmissionTypeBadges(selectedSuggestion.acceptedSubmissionTypes)}
                    </div>
                  </div>
                </div>

                {selectedSuggestion.deadline && (
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Deadline</h4>
                    <p className="text-sm">{new Date(selectedSuggestion.deadline).toLocaleString()}</p>
                  </div>
                )}

                {selectedSuggestion.status === 'PENDING' && (
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        disabled={isReviewing}
                        onClick={() => handleReview(selectedSuggestion.id, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {isReviewing ? 'Processing...' : 'Reject'}
                      </Button>
                      <Button
                        className="flex-1"
                        disabled={isReviewing}
                        onClick={() => handleReview(selectedSuggestion.id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {isReviewing ? 'Processing...' : 'Approve & Create Bounty'}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedSuggestion.status !== 'PENDING' && (
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedSuggestion.status === 'APPROVED' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-semibold">
                        {selectedSuggestion.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedSuggestion.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}