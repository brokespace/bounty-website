
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/bounties - Get all bounties with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (category) {
      where.categories = {
        some: {
          name: {
            contains: category,
            mode: 'insensitive'
          }
        }
      }
    }

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        categories: true,
        winningSpotConfigs: {
          orderBy: {
            position: 'asc'
          }
        },
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
      take: limit,
      skip: offset
    })

    const formattedBounties = bounties.map((bounty: any) => {
      const totalReward = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.reward.toString()), 0)
      const totalRewardCap = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.rewardCap.toString()), 0)
      
      return {
        ...bounty,
        alphaReward: totalReward.toString(),
        alphaRewardCap: totalRewardCap.toString(),
        submissionCount: bounty._count.submissions,
        winningSpotConfigs: bounty.winningSpotConfigs.map((spot: any) => ({
          ...spot,
          reward: spot.reward.toString(),
          rewardCap: spot.rewardCap.toString()
        }))
      }
    })

    return NextResponse.json({ bounties: formattedBounties })

  } catch (error) {
    console.error('Bounties fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    )
  }
}

// POST /api/bounties - Create new bounty
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required to create bounties' },
        { status: 403 }
      )
    }

    const {
      title,
      problem,
      info,
      requirements,
      rewardDistribution,
      winningSpots,
      deadline,
      categories,
      acceptedSubmissionTypes,
      winningSpotConfigs
    } = await req.json()

    // Validate required fields
    if (!title || !problem || !info || !requirements) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate submission types
    if (!acceptedSubmissionTypes || !Array.isArray(acceptedSubmissionTypes) || acceptedSubmissionTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one submission type must be specified' },
        { status: 400 }
      )
    }

    const validSubmissionTypes = ['URL', 'FILE', 'TEXT', 'MIXED']
    const invalidTypes = acceptedSubmissionTypes.filter(type => !validSubmissionTypes.includes(type))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid submission types: ${invalidTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate winning spots if provided
    if (winningSpotConfigs && Array.isArray(winningSpotConfigs) && winningSpotConfigs.length > 0) {
      const hotkeys = winningSpotConfigs.map((spot: any) => spot.hotkey)
      const duplicateHotkeys = hotkeys.filter((key: string, index: number) => hotkeys.indexOf(key) !== index)
      if (duplicateHotkeys.length > 0) {
        return NextResponse.json(
          { error: `Duplicate hotkeys found: ${duplicateHotkeys.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Create bounty
    const bounty = await prisma.bounty.create({
      data: {
        title,
        problem,
        info,
        requirements,
        rewardDistribution: rewardDistribution || 'ALL_AT_ONCE',
        winningSpots: winningSpots || 1,
        deadline: deadline ? new Date(deadline) : null,
        acceptedSubmissionTypes: acceptedSubmissionTypes,
        creatorId: session.user.id,
        status: 'ACTIVE',
        winningSpotConfigs: winningSpotConfigs && winningSpotConfigs.length > 0 ? {
          create: winningSpotConfigs.map((spot: any) => ({
            position: spot.position,
            reward: parseFloat(spot.reward),
            rewardCap: parseFloat(spot.rewardCap),
            hotkey: spot.hotkey
          }))
        } : undefined
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        categories: true,
        winningSpotConfigs: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    })

    const totalReward = bounty.winningSpotConfigs?.reduce((sum, spot) => sum + parseFloat(spot.reward.toString()), 0) || 0
    const totalRewardCap = bounty.winningSpotConfigs?.reduce((sum, spot) => sum + parseFloat(spot.rewardCap.toString()), 0) || 0
    
    return NextResponse.json({
      message: 'Bounty created successfully',
      bounty: {
        ...bounty,
        alphaReward: totalReward.toString(),
        alphaRewardCap: totalRewardCap.toString(),
        winningSpotConfigs: bounty.winningSpotConfigs?.map(spot => ({
          ...spot,
          reward: spot.reward.toString(),
          rewardCap: spot.rewardCap.toString()
        })) || []
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Bounty creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bounty' },
      { status: 500 }
    )
  }
}
