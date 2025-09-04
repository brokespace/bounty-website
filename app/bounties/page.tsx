

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navigation } from '@/components/navigation'
import { BountyCard } from '@/components/bounty-card'
import { BountiesClient } from './_components/bounties-client'
import { AnimatedSection } from '@/components/animated-section'
import { Search, Filter, Plus, Trophy, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function getBountyStats() {
  try {
    // Get total bounties count
    const totalBounties = await prisma.bounty.count()

    // Get active bounties count
    const activeBounties = await prisma.bounty.count({
      where: {
        status: 'ACTIVE'
      }
    })

    // Get total rewards (sum of all alphaReward values)
    const totalRewardsResult = await prisma.bounty.aggregate({
      _sum: {
        alphaReward: true
      }
    })

    const totalRewards = totalRewardsResult._sum.alphaReward || 0

    return {
      totalBounties,
      activeBounties,
      totalRewards: totalRewards.toString()
    }
  } catch (error) {
    console.error('Error fetching bounty stats:', error)
    return {
      totalBounties: 0,
      activeBounties: 0,
      totalRewards: '0'
    }
  }
}

async function getInitialBounties() {
  try {
    const bounties = await prisma.bounty.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            hotkey: true
          }
        },
        categories: true,
        submissions: {
          select: {
            id: true,
            status: true
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    return bounties.map((bounty: any) => ({
      ...bounty,
      alphaReward: bounty.alphaReward.toString(),
      alphaRewardCap: bounty.alphaRewardCap.toString(),
      submissionCount: bounty._count.submissions
    }))
  } catch (error) {
    console.error('Error fetching initial bounties:', error)
    return []
  }
}

export default async function BountiesPage() {
  // Fetch session, stats and initial bounties on the server side
  const [session, stats, initialBounties] = await Promise.all([
    getServerSession(authOptions),
    getBountyStats(),
    getInitialBounties()
  ])

  const statsCards = [
    { label: "Total Bounties", value: stats.totalBounties.toString(), icon: <Trophy className="h-4 w-4" />, color: "text-blue-600" },
    { label: "Active", value: stats.activeBounties.toString(), icon: <TrendingUp className="h-4 w-4" />, color: "text-green-600" },
    { label: "Total Rewards", value: `${parseFloat(stats.totalRewards).toFixed(2)} α`, icon: <Trophy className="h-4 w-4" />, color: "text-yellow-600" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Navigation />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Admin Create Button */}
        {session?.user?.isAdmin && (
          <div className="flex justify-end mb-8">
            <Link href="/create">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" />
                Create Bounty
              </Button>
            </Link>
          </div>
        )}

        {/* Bounties List */}
        <BountiesClient initialBounties={initialBounties} totalRewards={stats.totalRewards} />
      </main>
    </div>
  )
}
