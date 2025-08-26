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
      where.suggestedById = session.user.id
      if (status && status !== 'all') {
        where.status = status.toUpperCase()
      }
    }

    const suggestedBounties = await prisma.suggestedBounty.findMany({
      where,
      include: {
        suggestedBy: {
          select: {
            id: true,
            username: true,
            hotkey: true
          }
        },
        categories: true,
        convertedBounty: {
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

    const formattedSuggestions = suggestedBounties.map(suggestion => ({
      ...suggestion,
      alphaReward: suggestion.alphaReward.toString(),
      alphaRewardCap: suggestion.alphaRewardCap.toString()
    }))

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
      description,
      requirements,
      alphaReward,
      alphaRewardCap,
      rewardDistribution,
      winningSpots,
      deadline,
      acceptedSubmissionTypes
    } = await req.json()

    // Validate required fields
    if (!title || !description || !requirements || !alphaReward || !alphaRewardCap) {
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

    // Create suggested bounty
    const suggestedBounty = await prisma.suggestedBounty.create({
      data: {
        title,
        description,
        requirements,
        alphaReward: parseFloat(alphaReward),
        alphaRewardCap: parseFloat(alphaRewardCap),
        rewardDistribution: rewardDistribution || 'ALL_AT_ONCE',
        winningSpots: winningSpots || 1,
        deadline: deadline ? new Date(deadline) : null,
        acceptedSubmissionTypes: acceptedSubmissionTypes,
        suggestedById: session.user.id
      },
      include: {
        suggestedBy: {
          select: {
            id: true,
            username: true,
            hotkey: true
          }
        },
        categories: true
      }
    })

    return NextResponse.json({
      message: 'Bounty suggestion created successfully',
      suggestion: {
        ...suggestedBounty,
        alphaReward: suggestedBounty.alphaReward.toString(),
        alphaRewardCap: suggestedBounty.alphaRewardCap.toString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Bounty suggestion creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create bounty suggestion' },
      { status: 500 }
    )
  }
}