import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/stats - Get comprehensive platform statistics
export async function GET() {
  try {
    // Get bounty statistics
    const totalBounties = await prisma.bounty.count()
    const activeBounties = await prisma.bounty.count({
      where: { status: 'ACTIVE' }
    })
    const completedBounties = await prisma.bounty.count({
      where: { status: 'COMPLETED' }
    })

    // Get total rewards (sum of all alphaReward values)
    const totalRewardsResult = await prisma.bounty.aggregate({
      _sum: { alphaReward: true }
    })
    const totalRewards = totalRewardsResult._sum.alphaReward || 0

    // Get user count
    const totalUsers = await prisma.user.count({
      where: { isActive: true }
    })

    // Get total submissions
    const totalSubmissions = await prisma.submission.count()
    const winningSubmissions = await prisma.submission.count({
      where: { status: 'WINNER' }
    })

    // Calculate success rate (completed bounties / total bounties)
    const successRate = totalBounties > 0 
      ? ((completedBounties / totalBounties) * 100).toFixed(0)
      : '0'

    return NextResponse.json({
      stats: {
        bounties: {
          total: totalBounties,
          active: activeBounties,
          completed: completedBounties,
          successRate: parseFloat(successRate)
        },
        rewards: {
          total: totalRewards.toString(),
          totalNumeric: parseFloat(totalRewards.toString())
        },
        users: {
          total: totalUsers
        },
        submissions: {
          total: totalSubmissions,
          winners: winningSubmissions
        }
      }
    })

  } catch (error) {
    console.error('Platform stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch platform statistics' },
      { status: 500 }
    )
  }
}