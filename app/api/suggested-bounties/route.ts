import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/suggested-bounties - Get suggested bounties (admin only for all, users can see their own)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    // Admins can see all suggestions, users can only see their own
    if (session.user.isAdmin) {
      if (status && status !== 'all') {
        where.status = status.toUpperCase()
      }
    } else {
      where.creatorId = session.user.id
      if (status && status !== 'all') {
        where.status = status.toUpperCase()
      }
    }

    const suggestedBounties = await prisma.suggestedBounty.findMany({
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
        winningSpotConfigs: true,
        bounty: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const formattedSuggestions = suggestedBounties

    return NextResponse.json({ suggestions: formattedSuggestions })

  } catch (error) {
    console.error('Suggested bounties fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggested bounties' },
      { status: 500 }
    )
  }
}

// POST /api/suggested-bounties - Create new bounty suggestion
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
      acceptedSubmissionTypes,
      categories,
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

    // Create suggested bounty with transaction to handle categories and winning spots
    const suggestedBounty = await prisma.$transaction(async (tx) => {
      const newSuggestedBounty = await tx.suggestedBounty.create({
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
          categories: categories && categories.length > 0 ? {
            connect: categories.map((catId: string) => ({ id: catId }))
          } : undefined,
          winningSpotConfigs: winningSpotConfigs && winningSpotConfigs.length > 0 ? {
            create: winningSpotConfigs.map((ws: any) => ({
              position: ws.position,
              reward: parseFloat(ws.reward),
              rewardCap: parseFloat(ws.rewardCap),
              coldkey: ws.coldkey
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
          winningSpotConfigs: true
        }
      })
      return newSuggestedBounty
    })

    return NextResponse.json({
      message: 'Bounty suggestion created successfully',
      suggestion: suggestedBounty
    }, { status: 201 })

  } catch (error) {
    console.error('Bounty suggestion creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bounty suggestion' },
      { status: 500 }
    )
  }
}