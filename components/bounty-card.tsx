
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Trophy, Users, Coins, Medal, Key, User, ArrowRight, DollarSign, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getSweRizzoPrice, formatUSDPrice } from '@/lib/coingecko'

interface BountyCardProps {
  bounty: {
    id: string
    title: string
    problem: string
    description: string
    alphaReward: string
    alphaRewardCap: string
    rewardDistribution: 'ALL_AT_ONCE' | 'OVER_TIME'
    winningSpots: number
    status: string
    isPublished?: boolean
    deadline?: string
    createdAt: string
    submissionCount: number
    creator: {
      username: string
      walletAddress: string | null
    }
    categories?: Array<{
      name: string
      color?: string
    }>
    winningSpotConfigs?: Array<{
      id: string
      position: number
      reward: string
      rewardCap: string
      coldkey: string
    }>
  }
  index?: number
}

export function BountyCard({ bounty, index = 0 }: BountyCardProps) {
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(true)

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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-500 text-white'
      case 'COMPLETED': return 'bg-blue-500 text-white'
      case 'PAUSED': return 'bg-yellow-500 text-white'
      case 'CANCELLED': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getRewardDistributionText = (distribution: string) => {
    return distribution === 'ALL_AT_ONCE' ? '60% at once' : '100% over time'
  }

  const getPositionLabel = (position: number) => {
    const suffixes = ['st', 'nd', 'rd']
    const remainder = position % 10
    const hundredRemainder = position % 100
    
    if (hundredRemainder >= 11 && hundredRemainder <= 13) {
      return `${position}th`
    }
    
    return `${position}${suffixes[remainder - 1] || 'th'}`
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-gray-400' 
      case 3: return 'text-amber-600'
      default: return 'text-blue-500'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.3,
          delay: index * 0.03,
          ease: "easeOut"
        }
      }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="h-full group"
    >
      <Link href={`/bounties/${bounty.id}`} className="block h-full">
        <Card className={`h-full relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${
          bounty.isPublished === false 
            ? 'border-2 border-red-300 hover:border-red-400 bg-red-50/30 backdrop-blur-sm group-hover:shadow-red-200' 
            : 'border border-primary/30 hover:border-primary/50 bg-card/80 backdrop-blur-sm group-hover:shadow-primary/20'
        }`}>
          {/* Background Effects */}
          <div className={`absolute inset-0 opacity-50 group-hover:opacity-100 transition-all duration-500 ${
            bounty.isPublished === false 
              ? 'bg-gradient-to-br from-red-200/20 via-orange-200/20 to-red-300/20' 
              : 'bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8'
          }`} />
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ${
            bounty.isPublished === false 
              ? 'bg-gradient-to-br from-red-300/30 to-orange-300/30' 
              : 'bg-gradient-to-br from-accent/20 to-purple/20'
          }`} />
          
          {/* Unpublished Overlay */}
          {bounty.isPublished === false && (
            <>
              <div className="absolute inset-0 bg-red-100/10 border-t-4 border-red-400" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-5 pointer-events-none">
                <div className="text-6xl font-black text-red-800 whitespace-nowrap select-none">
                  UNPUBLISHED
                </div>
              </div>
            </>
          )}
          {/* Header Section */}
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2"
              >
                <Badge 
                  className={`${getStatusColor(bounty.status)} shadow-sm px-3 py-1 rounded-lg font-medium`}
                >
                  {bounty.status}
                </Badge>
                {bounty.isPublished !== undefined && !bounty.isPublished && (
                  <Badge 
                    className="bg-red-100 text-red-800 border-red-300 shadow-md px-3 py-1 rounded-lg font-bold animate-pulse border-2"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    UNPUBLISHED
                  </Badge>
                )}
              </motion.div>
              <div className="flex gap-2 flex-wrap">
                {bounty.categories?.slice(0, 2)?.map((category) => (
                  <Badge 
                    key={category.name} 
                    variant="outline" 
                    className="text-xs glass-effect border-primary/30 hover:border-primary/50 transition-all duration-300"
                    style={{ borderColor: category.color || undefined }}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <CardTitle className="text-xl font-bold leading-tight line-clamp-2 mb-3">
              <span className="text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent group-hover:from-accent group-hover:to-purple transition-all duration-300">
                {bounty.title}
              </span>
            </CardTitle>
            
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {bounty.problem}
            </p>
            
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {bounty.description}
            </p>
          </CardHeader>

          <CardContent className="pt-0 relative z-10">
            <div className="space-y-4">
              {/* Enhanced Reward Display */}
              <div className="p-4 glass-effect border border-primary/20 rounded-xl bg-primary/5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <Coins className="h-4 w-4 text-primary" />
                    <span>Alpha Rewards</span>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 p-3 glass-effect border border-primary/20 rounded-lg">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <div className="flex-1">
                      <div className="font-bold text-lg">{bounty.alphaReward} α</div>
                      <div className="text-xs text-muted-foreground">Total Alpha Reward</div>
                    </div>
                  </motion.div>
                  {/* USD Price Display */}
                  <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-2 p-3 glass-effect border border-green-500/20 rounded-lg bg-green-500/5">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <div className="font-bold text-lg text-green-600">
                        {isLoadingPrice ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          formatUSDPrice(bounty.alphaReward, usdPrice)
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">USD Value</div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-2 p-3 glass-effect border border-primary/30 rounded-xl hover:border-primary/50 transition-all duration-300"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-sm font-bold text-gradient">{bounty.submissionCount}</div>
                    <div className="text-xs text-muted-foreground">Submissions</div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-2 p-3 glass-effect border border-accent/30 rounded-xl hover:border-accent/50 transition-all duration-300"
                >
                  <Trophy className="h-4 w-4 text-accent" />
                  <div>
                    <div className="text-sm font-bold text-gradient">{bounty.winningSpotConfigs?.length || bounty.winningSpots}</div>
                    <div className="text-xs text-muted-foreground">Places to win</div>
                  </div>
                </motion.div>
              </div>

              {/* Timeline Info */}
              <div className="flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-3 py-2 glass-effect border border-purple/30 rounded-full"
                >
                  {bounty.deadline ? (
                    <>
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-medium text-gradient">
                        {new Date(bounty.deadline).toLocaleDateString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <Calendar className="h-3 w-3 text-purple-400" />
                      <span className="text-xs font-medium text-gradient">No deadline</span>
                    </>
                  )}
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-3 py-2 glass-effect border border-primary/30 rounded-full"
                >
                  <User className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-gradient">
                    @{bounty.creator.username || bounty.creator.walletAddress?.slice(0, 8) || 'Unknown'}
                  </span>
                </motion.div>
              </div>

              {/* Enhanced Action Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4"
              >
                <div className="w-full bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 group-hover:shadow-xl">
                  <span>Explore Bounty</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
