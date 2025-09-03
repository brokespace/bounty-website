
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
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden border hover:border-primary/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-primary/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-conic from-primary via-accent to-purple opacity-10 rounded-full blur-3xl animate-float" />
        <div className="p-6 lg:p-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl font-bold tracking-tight mb-2"
              >
                Welcome back, <span className="text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">{user?.username || 'Hunter'}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-muted-foreground"
              >
                {user?.walletAddress || user?.email || 'Complete your profile'}
              </motion.p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-2"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  onClick={refreshData} 
                  disabled={isLoading}
                  className="glass-effect hover:glow-border border border-accent/30 hover:border-accent/60 text-accent hover:text-primary transition-all duration-300 rounded-xl px-4 py-2 group shadow-lg shadow-accent/10"
                >
                  <Activity className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-200" />
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </motion.div>
              {user?.isAdmin && (
                <Link href="/create">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 border border-primary/50">
                      <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                      Create Bounty
                    </Button>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Card className="relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card hover:shadow-xl transition-all duration-300 rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute -top-20 -right-20 w-20 h-20 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.p 
                      whileHover={{ scale: 1.1 }}
                      className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      {stat.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                    className={`${stat.color} p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg`}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Tabs defaultValue="bounties" className="space-y-6">
          <TabsList className="grid w-full h-full grid-cols-4 glass-effect border border-primary/30 p-2 rounded-xl shadow-lg">
            <TabsTrigger
              value="bounties"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <Trophy className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">My Bounties</span>
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-purple data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-accent transition-all duration-300"
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Submissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple data-[state=active]:to-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-purple-400 transition-all duration-300"
            >
              <Lightbulb className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Suggestions</span>
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex items-center gap-2 px-2 py-3 rounded-lg text-xs sm:text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple data-[state=active]:text-white data-[state=active]:shadow-lg text-muted-foreground hover:text-primary transition-all duration-300"
            >
              <Activity className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

        {/* Enhanced My Bounties */}
        <TabsContent value="bounties" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
              >
                <Trophy className="h-5 w-5 text-primary" />
              </motion.div>
              My Bounties
            </h2>
            {user?.isAdmin && (
              <Link href="/create">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 border border-primary/50"
                  >
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                    Create New
                  </Button>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {data?.bounties?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-primary/30 bg-card rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
              <div className="text-center py-16 px-6 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Trophy className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">No bounties yet</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  {user?.isAdmin ? 'Create your first bounty to get started' : 'Only admins can create bounties'}
                </p>
                {user?.isAdmin && (
                  <Link href="/create">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                      <Button className="bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 border border-primary/50 animate-glow">
                        Create Bounty
                      </Button>
                    </motion.div>
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {data?.bounties?.map((bounty: any, index: number) => (
                <motion.div
                  key={bounty.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <BountyCard bounty={bounty} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Enhanced My Submissions */}
        <TabsContent value="submissions" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-purple/20"
              >
                <FileText className="h-5 w-5 text-accent" />
              </motion.div>
              My Submissions
            </h2>
            <Link href="/bounties">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="glass-effect hover:glow-border border border-accent/30 hover:border-accent/60 text-accent hover:text-primary transition-all duration-300 rounded-xl px-4 py-2 group shadow-lg shadow-accent/10"
                >
                  <Eye className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Browse Bounties
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {data?.submissions?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-accent/30 bg-card rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-purple/8 to-primary/8 animate-gradient-shift" />
              <div className="text-center py-16 px-6 relative z-10">
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-accent/20 to-purple/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <FileText className="h-8 w-8 text-accent" />
                </motion.div>
                <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
                  No submissions yet!
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Start hunting bounties to build your <span className="text-accent font-bold">portfolio</span>
                </p>
                <Link href="/bounties">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-gradient-to-r from-accent via-blue-600 to-purple hover:from-accent/90 hover:via-blue-700 hover:to-purple/90 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 border border-accent/50 animate-glow">
                      Browse Bounties
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {data?.submissions?.map((submission: any, index: number) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border border-accent/30 hover:border-accent/50 bg-card hover:shadow-xl transition-all duration-300 rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-purple/8 to-primary/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -top-20 -right-20 w-20 h-20 bg-gradient-to-br from-purple/20 to-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gradient bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">{submission.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(submission.status)} shadow-sm`}>
                              {submission.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                            {submission.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1 px-3 py-1.5 glass-effect border border-primary/30 rounded-full"
                            >
                              <Trophy className="h-4 w-4 text-primary" />
                              <span>{submission.bounty?.title}</span>
                            </motion.div>
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              className="flex items-center gap-1 px-3 py-1.5 glass-effect border border-accent/30 rounded-full"
                            >
                              <Calendar className="h-4 w-4 text-accent" />
                              <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                            </motion.div>
                            {submission.score && (
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-1 px-3 py-1.5 glass-effect border border-purple/30 rounded-full"
                              >
                                <TrendingUp className="h-4 w-4 text-purple-400" />
                                <span>Score: {submission.score}/100</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <motion.p 
                            whileHover={{ scale: 1.1 }}
                            className="text-lg font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                          >
                            {submission.bounty?.alphaReward} α
                          </motion.p>
                          <p className="text-xs text-muted-foreground">
                            {submission.voteCount} votes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Enhanced Suggested Bounties */}
        <TabsContent value="suggestions" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple via-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="p-2 rounded-xl bg-gradient-to-br from-purple/20 to-primary/20"
              >
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </motion.div>
              Suggested Bounties
            </h2>
            <Link href="/suggest-bounty">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="glass-effect hover:glow-border border border-yellow-500/30 hover:border-yellow-500/60 text-yellow-500 hover:text-primary transition-all duration-300 rounded-xl px-4 py-2 group shadow-lg shadow-yellow-500/10"
                >
                  <Lightbulb className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  Suggest New
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {data?.suggestedBounties?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-yellow-500/30 bg-card rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/8 via-orange/8 to-primary/8 animate-gradient-shift" />
              <div className="text-center py-16 px-6 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Lightbulb className="h-8 w-8 text-yellow-500" />
                </motion.div>
                <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-yellow-500 via-orange to-primary bg-clip-text text-transparent">
                  No suggestions yet
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Suggest bounties to help <span className="text-yellow-500 font-bold">grow</span> the platform
                </p>
                <Link href="/suggest-bounty">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-gradient-to-r from-yellow-500 via-orange to-red-500 hover:from-yellow-600 hover:via-orange/90 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-yellow-500/25 hover:shadow-yellow-500/40 transition-all duration-300 border border-yellow-500/50 animate-glow">
                      Suggest Bounty
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {data?.suggestedBounties?.map((suggestion: any, index: number) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border border-yellow-500/30 hover:border-yellow-500/50 bg-card hover:shadow-xl transition-all duration-300 rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/8 via-orange/8 to-primary/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -top-20 -right-20 w-20 h-20 bg-gradient-to-br from-orange/20 to-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-6 relative z-10">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gradient bg-gradient-to-r from-yellow-500 to-orange bg-clip-text text-transparent">{suggestion.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(suggestion.status)} shadow-sm`}>
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
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Enhanced Recent Activity */}
        <TabsContent value="activity" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary via-purple to-accent bg-clip-text text-transparent flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple/20"
              >
                <Activity className="h-5 w-5 text-primary" />
              </motion.div>
              Recent Activity
            </h2>
          </motion.div>
          
          {data?.recentActivity?.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="card-enhanced relative border border-primary/30 bg-card rounded-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-purple/8 to-accent/8 animate-gradient-shift" />
              <div className="text-center py-16 px-6 relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple/20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Activity className="h-8 w-8 text-primary" />
                </motion.div>
                <h3 className="font-bold mb-4 text-2xl text-gradient bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent">No recent activity</h3>
                <p className="text-muted-foreground text-lg">
                  Activity on your bounties will appear here
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {data?.recentActivity?.map((activity: any, index: number) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card hover:shadow-xl transition-all duration-300 rounded-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-purple/8 to-accent/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -top-10 -right-10 w-10 h-10 bg-gradient-to-br from-purple/20 to-accent/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                          className="flex-shrink-0 p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20"
                        >
                          <FileText className="h-5 w-5 text-primary" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            New submission on <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold">{activity.bounty?.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by @{activity.submitter?.username || activity.submitter?.walletAddress?.slice(0, 8) || 'Unknown'}
                          </p>
                        </div>
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="text-xs text-muted-foreground px-3 py-1 glass-effect border border-accent/30 rounded-full"
                        >
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  )
}
