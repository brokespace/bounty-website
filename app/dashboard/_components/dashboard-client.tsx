
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BountyCard } from '@/components/bounty-card'
import { 
  Trophy, 
  FileText, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  Lightbulb,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardClientProps {
  initialData: any
  user: any
}

export function DashboardClient({ initialData, user }: DashboardClientProps) {
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    refreshData()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const newData = await response.json()
        setData(newData)
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'text-green-600 bg-green-100'
      case 'COMPLETED': return 'text-blue-600 bg-blue-100'
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'APPROVED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      case 'WINNER': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const stats = [
    {
      title: 'My Bounties',
      value: data?.stats?.totalBounties || 0,
      icon: <Trophy className="h-5 w-5" />,
      description: 'Created by you',
      color: 'text-blue-600'
    },
    {
      title: 'My Submissions',
      value: data?.stats?.totalSubmissions || 0,
      icon: <FileText className="h-5 w-5" />,
      description: 'Your submissions',
      color: 'text-green-600'
    },
    {
      title: 'Suggested Bounties',
      value: data?.stats?.totalSuggestedBounties || 0,
      icon: <Lightbulb className="h-5 w-5" />,
      description: 'Your suggestions',
      color: 'text-yellow-600'
    },
    {
      title: 'Approved Submissions',
      value: data?.submissions?.filter((s: any) => s.status === 'APPROVED' || s.status === 'WINNER').length || 0,
      icon: <CheckCircle className="h-5 w-5" />,
      description: 'Successful submissions',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome back, <span className="text-primary">{user?.username || 'Hunter'}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {user?.walletAddress || user?.email || 'Complete your profile'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={isLoading}>
            <Activity className="mr-2 h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {user?.isAdmin && (
            <Link href="/create">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Bounty
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="bounties" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="bounties">My Bounties</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="suggestions">Suggested Bounties</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* My Bounties */}
        <TabsContent value="bounties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Bounties</h2>
            {user?.isAdmin && (
              <Link href="/create">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
              </Link>
            )}
          </div>

          {data?.bounties?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bounties yet</h3>
                <p className="text-muted-foreground mb-4">
                  {user?.isAdmin ? 'Create your first bounty to get started' : 'Only admins can create bounties'}
                </p>
                {user?.isAdmin && (
                  <Link href="/create">
                    <Button>Create Bounty</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data?.bounties?.map((bounty: any, index: number) => (
                <BountyCard key={bounty.id} bounty={bounty} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Submissions */}
        <TabsContent value="submissions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">My Submissions</h2>
            <Link href="/bounties">
              <Button size="sm" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Browse Bounties
              </Button>
            </Link>
          </div>

          {data?.submissions?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start hunting bounties to build your portfolio
                </p>
                <Link href="/bounties">
                  <Button>Browse Bounties</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.submissions?.map((submission: any) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{submission.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(submission.status)}>
                            {submission.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {submission.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            <span>{submission.bounty?.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                          </div>
                          {submission.score && (
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>Score: {submission.score}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {submission.bounty?.alphaReward} α
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.voteCount} votes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Suggested Bounties */}
        <TabsContent value="suggestions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Suggested Bounties</h2>
            <Link href="/suggest-bounty">
              <Button size="sm" variant="outline">
                <Lightbulb className="mr-2 h-4 w-4" />
                Suggest New
              </Button>
            </Link>
          </div>

          {data?.suggestedBounties?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Suggest bounties to help grow the platform
                </p>
                <Link href="/suggest-bounty">
                  <Button>Suggest Bounty</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.suggestedBounties?.map((suggestion: any) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{suggestion.title}</h3>
                          <Badge variant="secondary" className={getStatusColor(suggestion.status)}>
                            {suggestion.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                            {suggestion.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {suggestion.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                            {suggestion.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {suggestion.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            <span>{suggestion.alphaReward}α - {suggestion.alphaRewardCap}α</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {suggestion.status === 'APPROVED' && suggestion.convertedBounty && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                              <CheckCircle className="w-4 h-4 inline mr-1" />
                              Approved! View bounty: 
                              <Link href={`/bounties/${suggestion.convertedBounty.id}`} className="ml-1 underline font-medium">
                                {suggestion.convertedBounty.title}
                              </Link>
                            </p>
                          </div>
                        )}

                        {suggestion.reviewNotes && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm"><strong>Admin Notes:</strong> {suggestion.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {suggestion.alphaReward} α
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Suggested reward
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          
          {data?.recentActivity?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">
                  Activity on your bounties will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.recentActivity?.map((activity: any) => (
                <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          New submission on <span className="text-primary">{activity.bounty?.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by @{activity.submitter?.username || activity.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
