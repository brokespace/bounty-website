
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BountyCard } from '@/components/bounty-card'
import { Search, Filter, X, SlidersHorizontal, Trophy, Target, Sparkles, DollarSign } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getSweRizzoPrice, formatUSDPrice } from '@/lib/coingecko'

interface BountiesClientProps {
  initialBounties: any[]
  totalRewards: string
}

export function BountiesClient({ initialBounties, totalRewards }: BountiesClientProps) {
  const [bounties, setBounties] = useState(initialBounties)
  const [filteredBounties, setFilteredBounties] = useState(initialBounties)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const [sortBy, setSortBy] = useState('createdAt')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(true)
  
  const filtersRef = useRef(null)
  const gridRef = useRef(null)
  const filtersInView = useInView(filtersRef, { once: true, margin: "-50px" })

  // Fetch bounties on mount
  useEffect(() => {
    const fetchBounties = async () => {
      if (initialBounties.length === 0) {
        setIsLoading(true)
        try {
          const response = await fetch('/api/bounties')
          if (response.ok) {
            const data = await response.json()
            setBounties(data.bounties || [])
          }
        } catch (error) {
          console.error('Error fetching bounties:', error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    
    fetchBounties()
  }, [initialBounties])

  // Fetch USD price on mount
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

  // Apply filters
  useEffect(() => {
    let filtered = [...bounties]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bounty => 
        bounty?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        bounty?.description?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
        bounty?.creator?.username?.toLowerCase()?.includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(bounty => bounty?.status === statusFilter.toUpperCase())
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reward':
          return parseFloat(b?.alphaReward || '0') - parseFloat(a?.alphaReward || '0')
        case 'submissions':
          return (b?.submissionCount || 0) - (a?.submissionCount || 0)
        case 'deadline':
          if (!a?.deadline && !b?.deadline) return 0
          if (!a?.deadline) return 1
          if (!b?.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        default: // createdAt
          return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
      }
    })

    setFilteredBounties(filtered)
  }, [bounties, searchQuery, statusFilter, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSortBy('createdAt')
    setShowFilters(false)
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'reward', label: 'Highest Reward' },
    { value: 'submissions', label: 'Most Submissions' },
    { value: 'deadline', label: 'Deadline' }
  ]



  return (
    <div className="space-y-8 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-purple/5 animate-gradient-shift -z-10" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-float -z-10" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-accent/10 to-purple/10 rounded-full blur-3xl animate-pulse-slow -z-10" />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12 relative z-10"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl mb-6 shadow-lg"
        >
          <Trophy className="h-10 w-10 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl lg:text-5xl font-bold mb-4"
        >
          <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
            Alpha Bounty Hub
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Discover premium bounties, compete with the best, and earn Alpha rewards for your exceptional work.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 px-4 py-2 glass-effect border border-primary/30 rounded-full"
          >
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-gradient">{bounties.length} Active Bounties</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center gap-2 px-4 py-2 glass-effect border border-accent/30 rounded-full"
          >
            <DollarSign className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-gradient">
              {isLoadingPrice ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                formatUSDPrice(totalRewards, usdPrice)
              )} Total Rewards
            </span>
          </motion.div>
        </motion.div>
      </motion.div>
      {/* Enhanced Filters */}
      <motion.div
        ref={filtersRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={filtersInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <Card className="border-primary/30 hover:border-primary/50 backdrop-blur-sm bg-card/80 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 opacity-50" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl" />
          <CardContent className="p-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Search */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary z-10">
                <Search className="h-5 w-5" />
              </div>
              <Input
                placeholder="Search bounties, creators, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 glass-effect border-primary/30 hover:border-primary/50 focus:border-primary/70 bg-background/50 backdrop-blur-sm rounded-xl text-base placeholder:text-muted-foreground/70 transition-all duration-300 shadow-sm hover:shadow-md"
              />
            </div>

            {/* Enhanced Quick Filters */}
            <div className="flex gap-3 lg:hidden">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 glass-effect border-accent/30 hover:border-accent/50 text-accent hover:text-accent/80 px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </motion.div>
              {(searchQuery || statusFilter !== 'all' || sortBy !== 'createdAt') && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-muted-foreground hover:text-destructive glass-effect border-muted/30 hover:border-destructive/30 px-4 py-2 rounded-xl font-medium transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Enhanced Desktop Filters */}
            <div className={`flex-col lg:flex-row gap-3 ${showFilters || !showFilters ? 'flex lg:flex' : 'hidden lg:flex'}`}>
              <motion.div whileHover={{ scale: 1.02 }}>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-44 glass-effect border-primary/30 hover:border-primary/50 bg-background/50 backdrop-blur-sm rounded-xl py-3 px-4 font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-primary/30 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg">
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-primary/10 rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-44 glass-effect border-accent/30 hover:border-accent/50 bg-background/50 backdrop-blur-sm rounded-xl py-3 px-4 font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="glass-effect border-accent/30 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg">
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value} className="hover:bg-accent/10 rounded-lg">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {(searchQuery || statusFilter !== 'all' || sortBy !== 'createdAt') && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-muted-foreground hover:text-destructive glass-effect border-muted/30 hover:border-destructive/30 px-4 py-3 rounded-xl font-medium transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Active Filters */}
      {(searchQuery || statusFilter !== 'all') && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 flex-wrap relative z-10"
        >
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-sm font-medium text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Active filters:
          </motion.span>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="flex items-center gap-2 glass-effect border-primary/30 hover:border-primary/50 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                Search: "{searchQuery}"
                <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                    onClick={() => setSearchQuery('')}
                  />
                </motion.div>
              </Badge>
            </motion.div>
          )}
          {statusFilter !== 'all' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="flex items-center gap-2 glass-effect border-accent/30 hover:border-accent/50 bg-accent/10 text-accent px-3 py-1.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md">
                Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
                <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                    onClick={() => setStatusFilter('all')}
                  />
                </motion.div>
              </Badge>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Enhanced Results Count */}
      {/* <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between relative z-10"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 px-4 py-2 glass-effect border border-primary/20 rounded-xl bg-primary/5"
        >
          <div className="w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
          <p className="text-sm font-medium text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <span className="font-bold text-lg">{filteredBounties.length}</span> {filteredBounties.length === 1 ? 'bounty' : 'bounties'} discovered
          </p>
        </motion.div>
      </motion.div> */}

      {/* Enhanced Bounties Grid */}
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative overflow-hidden"
            >
              <div className="h-80 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl animate-pulse border border-primary/20 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-purple/5 animate-gradient-shift" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded-lg animate-pulse" />
                  <div className="h-6 bg-muted/80 rounded-lg animate-pulse" />
                  <div className="h-16 bg-muted/60 rounded-lg animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted/40 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-muted/40 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : filteredBounties.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative overflow-hidden border border-primary/30 hover:border-primary/50 backdrop-blur-sm bg-card/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl animate-float" />
          <div className="text-center py-20 px-8 relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              <Search className="h-10 w-10 text-primary" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-bold mb-4 text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent"
            >
              No Bounties Found
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed"
            >
              Adjust your search criteria or clear filters to discover more exciting bounties.
            </motion.p>
            {(searchQuery || statusFilter !== 'all') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="glass-effect border-primary/30 hover:border-primary/50 text-primary hover:text-primary/80 px-8 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-primary/20"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          ref={gridRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, staggerChildren: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10"
        >
          {filteredBounties.map((bounty, index) => (
            <BountyCard 
              key={bounty?.id || index}
              bounty={bounty} 
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
