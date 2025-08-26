
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BountyCard } from '@/components/bounty-card'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BountiesClientProps {
  initialBounties: any[]
}

export function BountiesClient({ initialBounties }: BountiesClientProps) {
  const [bounties, setBounties] = useState(initialBounties)
  const [filteredBounties, setFilteredBounties] = useState(initialBounties)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const filtersRef = useRef(null)
  const gridRef = useRef(null)
  const filtersInView = useInView(filtersRef, { once: true, margin: "-50px" })
  const gridInView = useInView(gridRef, { once: true, margin: "0px 0px 300px 0px" })

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0,
        delayChildren: 0
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        ref={filtersRef}
        initial="hidden"
        animate={filtersInView ? "visible" : "hidden"}
        variants={itemVariants}
      >
        <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search bounties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              {(searchQuery || statusFilter !== 'all' || sortBy !== 'createdAt') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            {/* Desktop Filters */}
            <div className={`flex-col lg:flex-row gap-2 ${showFilters || !showFilters ? 'flex lg:flex' : 'hidden lg:flex'}`}>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== 'all' || sortBy !== 'createdAt') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Filters */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {statusOptions.find(opt => opt.value === statusFilter)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setStatusFilter('all')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredBounties.length} {filteredBounties.length === 1 ? 'bounty' : 'bounties'} found
        </p>
      </div>

      {/* Bounties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredBounties.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No bounties found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
          {(searchQuery || statusFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBounties.map((bounty, index) => (
            <BountyCard 
              key={bounty?.id || index} 
              bounty={bounty} 
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
