
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Trophy, Users, Coins, Target } from 'lucide-react'
import Link from 'next/link'

interface BountyCardProps {
  bounty: {
    id: string
    title: string
    description: string
    alphaReward: string
    alphaRewardCap: string
    rewardDistribution: 'ALL_AT_ONCE' | 'OVER_TIME'
    winningSpots: number
    status: string
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
  }
  index?: number
}

export function BountyCard({ bounty, index = 0 }: BountyCardProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'COMPLETED': return 'bg-blue-500'
      case 'PAUSED': return 'bg-yellow-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getRewardDistributionText = (distribution: string) => {
    return distribution === 'ALL_AT_ONCE' ? '60% at once' : '100% over time'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: {
          duration: 0.8,
          delay: 0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      whileHover={{ 
        y: -12,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-muted/50 bg-card/50 backdrop-blur-sm transform-gpu">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(bounty.status)} text-white text-xs`}
            >
              {bounty.status}
            </Badge>
            <div className="flex gap-1 flex-wrap">
              {bounty.categories?.slice(0, 2)?.map((category) => (
                <Badge 
                  key={category.name} 
                  variant="outline" 
                  className="text-xs"
                  style={{ borderColor: category.color || undefined }}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {bounty.title}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
            {bounty.description}
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Reward Information */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="font-medium">{bounty.alphaReward} α</div>
                  <div className="text-xs text-muted-foreground">Current</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="font-medium">{bounty.alphaRewardCap} α</div>
                  <div className="text-xs text-muted-foreground">Cap</div>
                </div>
              </div>
            </div>

            {/* Distribution and Spots */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4 text-purple-500" />
                <span className="text-xs">{getRewardDistributionText(bounty.rewardDistribution)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-xs">{bounty.winningSpots} {bounty.winningSpots === 1 ? 'winner' : 'winners'}</span>
              </div>
            </div>

            {/* Deadline and Submissions */}
            <div className="flex items-center justify-between text-sm">
              {bounty.deadline ? (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">
                    {new Date(bounty.deadline).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">No deadline</span>
                </div>
              )}
              
              <span className="text-xs font-medium">
                {bounty.submissionCount} submissions
              </span>
            </div>

            {/* Creator */}
            <div className="pt-2 border-t border-muted/30">
              <div className="text-xs text-muted-foreground">
                by @{bounty.creator.username || bounty.creator.walletAddress?.slice(0, 8) || 'Unknown'}
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/bounties/${bounty.id}`} className="block w-full">
              <Button 
                className="w-full mt-3 bg-primary hover:bg-primary/90 transition-colors"
                size="sm"
              >
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
