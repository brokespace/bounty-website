
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/dashboard - Get user dashboard data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's bounties
    const userBounties = await prisma.bounty.findMany({
      where: { creatorId: userId },
      include: {
        _count: {
          select: {
            submissions: true
          }
        },
        categories: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user's submissions
    const userSubmissions = await prisma.submission.findMany({
      where: { submitterId: userId },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            alphaReward: true,
            status: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user stats
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            bounties: true,
            submissions: true
          }
        }
      }
    })

    // Get recent activity (submissions on user's bounties)
    const recentActivity = await prisma.submission.findMany({
      where: {
        bounty: {
          creatorId: userId
        }
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            hotkey: true
          }
        },
        bounty: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Format data
    const formattedBounties = userBounties.map(bounty => ({
      ...bounty,
      alphaReward: bounty.alphaReward.toString(),
      alphaRewardCap: bounty.alphaRewardCap.toString(),
      submissionCount: bounty._count.submissions
    }))

    const formattedSubmissions = userSubmissions.map(submission => ({
      ...submission,
      score: submission.score?.toString() || null,
      voteCount: submission._count.votes,
      bounty: {
        ...submission.bounty,
        alphaReward: submission.bounty.alphaReward.toString()
      }
    }))

    const formattedActivity = recentActivity.map(activity => ({
      ...activity,
      score: activity.score?.toString() || null
    }))

    return NextResponse.json({
      user: {
        id: session.user.id,
        hotkey: session.user.hotkey,
        username: session.user.username
      },
      stats: {
        totalBounties: stats?._count?.bounties || 0,
        totalSubmissions: stats?._count?.submissions || 0
      },
      bounties: formattedBounties,
      submissions: formattedSubmissions,
      recentActivity: formattedActivity
    })

  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
