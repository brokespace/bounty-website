
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
    console.log("bounties", bounties)
    const formattedBounties = bounties.map((bounty: any) => {
      // For each spot, show its percentOfTotal (if any) and reward as-is (no normalization)
      // alphaReward is the reward for 1st place (position 1), or 0 if not present
      // alphaRewardCap is the rewardCap for 1st place (position 1), or 0 if not present

      // Find 1st place (position 1) config
      const firstPlace = bounty.winningSpotConfigs.find((spot: any) => spot.position === 1)
      console.log("firstPlace", firstPlace)
      const alphaReward = firstPlace ? firstPlace.reward.toString() : "0"
      const alphaRewardCap = firstPlace ? firstPlace.rewardCap.toString() : "0"

      return {
        ...bounty,
        alphaReward,
        alphaRewardCap,
        submissionCount: bounty._count.submissions,
        winningSpotConfigs: bounty.winningSpotConfigs.map((spot: any) => ({
          ...spot,
          // Show percentOfTotal as-is (could be >100 for 2nd, 3rd, etc.)
          percentOfTotal: spot.percentOfTotal,
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
      submissionDisclaimer,
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
      const coldkeys = winningSpotConfigs.map((spot: any) => spot.coldkey)
      const duplicatecoldkeys = coldkeys.filter((key: string, index: number) => coldkeys.indexOf(key) !== index)
      if (duplicatecoldkeys.length > 0) {
        return NextResponse.json(
          { error: `Duplicate coldkeys found: ${duplicatecoldkeys.join(', ')}` },
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
        submissionDisclaimer: submissionDisclaimer || null,
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
            coldkey: spot.coldkey
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
