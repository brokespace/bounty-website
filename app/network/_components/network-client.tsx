'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, Clock, Users, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Screener } from '@/lib/types'

interface ScreenerWithSupport extends Screener {
  supportedBounties?: Array<{
    bounty?: { id: string; title: string; status: string } | null
    category?: { 
      id: string; 
      name: string;
      bounties: Array<{ id: string; title: string; status: string }>
    } | null
    submissionTypes: string[]
  }>
}

export function NetworkClient() {
  const [screeners, setScreeners] = useState<ScreenerWithSupport[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState({
    available: 0,
    busy: 0,
    total: 0
  })

  const toggleExpanded = (screenerId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(screenerId)) {
        newSet.delete(screenerId)
      } else {
        newSet.add(screenerId)
      }
      return newSet
    })
  }

  useEffect(() => {
    const fetchScreeners = async () => {
      try {
        const response = await fetch('/api/screeners')
        
        if (!response.ok) {
          throw new Error('Failed to fetch screeners')
        }

        const data = await response.json()
        
        // Filter out offline/inactive screeners
        const activeScreeners = data.filter((s: ScreenerWithSupport) => s.isActive)
        setScreeners(activeScreeners)
        
        // Calculate stats only for active screeners
        const available = activeScreeners.filter((s: ScreenerWithSupport) => s.currentJobs < s.maxConcurrent).length
        const busy = activeScreeners.filter((s: ScreenerWithSupport) => s.currentJobs >= s.maxConcurrent).length
        
        setStats({
          available,
          busy,
          total: activeScreeners.length
        })
      } catch (error) {
        console.error('Error fetching screeners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScreeners()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchScreeners, 30000)
    return () => clearInterval(interval)
  }, [])

  const getScreenerStatus = (screener: ScreenerWithSupport) => {
    if (screener.currentJobs >= screener.maxConcurrent) return { text: 'Busy', color: 'bg-red-500', variant: 'destructive' as const }
    if (screener.currentJobs > 0) return { text: 'Scoring', color: 'bg-yellow-500', variant: 'default' as const }
    return { text: 'Available for work', color: 'bg-green-500', variant: 'default' as const }
  }

  const getActiveBounties = (screener: ScreenerWithSupport) => {
    if (!screener.supportedBounties || screener.supportedBounties.length === 0) {
      return []
    }

    const activeBounties: any[] = []

    // Add specific active bounties
    screener.supportedBounties.forEach(support => {
      if (support.bounty && support.bounty.status === 'ACTIVE') {
        activeBounties.push(support.bounty)
      }
      
      // Add active bounties from supported categories
      if (support.category && support.category.bounties) {
        support.category.bounties.forEach(bounty => {
          if (bounty.status === 'ACTIVE' && !activeBounties.some(b => b.id === bounty.id)) {
            activeBounties.push(bounty)
          }
        })
      }
    })

    return activeBounties
  }

  const statsData = [
    { label: "Available for work", value: loading ? "..." : stats.available.toString(), icon: <Activity className="h-5 w-5" />, color: "text-green-500" },
    { label: "Busy", value: loading ? "..." : stats.busy.toString(), icon: <Clock className="h-5 w-5" />, color: "text-red-500" },
    { label: "Total", value: loading ? "..." : stats.total.toString(), icon: <Users className="h-5 w-5" />, color: "text-primary" }
  ]

  return (
    <main className="relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-purple/5 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Header Section */}
      <section className="relative container mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-3xl animate-gradient-shift -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              Network Grader Status
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
          >
            Network grader status and activity.
          </motion.p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.8, duration: 0.5 }}
              whileHover={{ y: -4, scale: 1.05 }}
              className="group"
            >
              <Card className="card-enhanced text-center relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="px-6 py-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-primary p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        {stat.icon}
                      </div>
                    </motion.div>
                    <div className="text-left">
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {loading ? (
                          <div className="animate-pulse bg-primary/20 h-6 w-8 rounded"></div>
                        ) : (
                          stat.value
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Screeners Grid */}
      <section className="container mx-auto max-w-6xl px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="card-enhanced border border-primary/30 bg-card h-full">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-primary/20 rounded w-2/3"></div>
                      <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                      <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                      <div className="h-4 bg-primary/20 rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            screeners.map((screener, index) => {
              const status = getScreenerStatus(screener)
              
              return (
                <motion.div
                  key={screener.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 + 1.4, duration: 0.6 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group h-full"
                >
                  <Card className="card-enhanced relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute -top-40 -right-40 w-40 h-40 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    
                    <CardHeader className="relative z-10 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <motion.div 
                          className="text-primary p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300"
                          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Zap className="h-8 w-8" />
                        </motion.div>
                      </div>
                      
                      <CardTitle className="text-xl font-bold group-hover:text-gradient transition-all duration-300 mb-1">
                        {screener.name}
                      </CardTitle>
                      
                      <p className="text-sm text-muted-foreground font-mono">
                        {/* {screener.id} */}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="relative z-10 space-y-6 text-center">
                      {/* Usage Circle */}
                      <div className="flex items-center justify-center">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                            {/* Background circle */}
                            <path
                              className="text-muted-foreground/20"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="transparent"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            {/* Progress circle */}
                            <motion.path
                              className={screener.currentJobs >= screener.maxConcurrent ? "text-red-500" : screener.currentJobs > 0 ? "text-yellow-500" : "text-green-500"}
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="transparent"
                              strokeDasharray={`${(screener.currentJobs / screener.maxConcurrent) * 100}, 100`}
                              strokeLinecap="round"
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${(screener.currentJobs / screener.maxConcurrent) * 100}, 100` }}
                              transition={{ duration: 1.5, delay: index * 0.2 }}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-lg font-bold">{screener.currentJobs}</div>
                              <div className="text-xs text-muted-foreground">of {screener.maxConcurrent}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <div className="flex justify-center">
                        <Badge 
                          variant={status.variant}
                          className="text-sm px-4 py-2 rounded-full"
                        >
                          {status.text}
                        </Badge>
                      </div>
                      
                      {/* Active Bounties Dropdown */}
                      <div className="space-y-3">
                        {(() => {
                          const activeBounties = getActiveBounties(screener)
                          const isExpanded = expandedCards.has(screener.id)
                          
                          return (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpanded(screener.id)}
                                className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border border-primary/20 hover:border-primary/30 transition-all duration-300"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10 flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">Active Bounties</div>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-green-500/10 border-green-500/30 text-green-600">
                                      {activeBounties.length}
                                    </Badge>
                                  </div>
                                  <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </motion.div>
                                </div>
                              </Button>
                              
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-2 p-4 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/50">
                                      {activeBounties.length === 0 ? (
                                        <div className="text-center py-4">
                                          <div className="text-sm text-muted-foreground">No active bounties</div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                          {activeBounties.map((bounty, idx) => (
                                            <motion.div
                                              key={bounty.id}
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: idx * 0.05, duration: 0.2 }}
                                              className="group/bounty"
                                            >
                                              <div className="flex items-center gap-3 p-2 rounded-md bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20 hover:from-green-500/10 hover:to-emerald-500/10 hover:border-green-500/30 transition-all duration-200">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                  <div className="text-xs font-medium text-green-600 truncate" title={bounty.title}>
                                                    {bounty.title}
                                                  </div>
                                                </div>
                                              </div>
                                            </motion.div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </section>
    </main>
  )
}