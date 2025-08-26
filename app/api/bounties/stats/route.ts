import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/bounties/stats - Get bounty statistics
export async function GET() {
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

    // Get additional stats
    const completedBounties = await prisma.bounty.count({
      where: {
        status: 'COMPLETED'
      }
    })

    const pausedBounties = await prisma.bounty.count({
      where: {
        status: 'PAUSED'
      }
    })

    return NextResponse.json({
      stats: {
        totalBounties,
        activeBounties,
        completedBounties,
        pausedBounties,
        totalRewards: totalRewards.toString()
      }
    })

  } catch (error) {
    console.error('Bounty stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bounty statistics' },
      { status: 500 }
    )
  }
}
