
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/bounties/[id] - Get bounty by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const bounty = await prisma.bounty.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        categories: true,
        tasks: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        winningSpotConfigs: {
          orderBy: {
            position: 'asc'
          }
        },
        submissions: {
          include: {
            submitter: {
              select: {
                id: true,
                username: true,
                walletAddress: true
              }
            },
            files: true,
            votes: true,
            _count: {
              select: {
                votes: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!bounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      )
    }

    // Check if bounty is published or user is admin
    if (!bounty.isPublished && !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      )
    }

    const totalReward = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.reward.toString()), 0)
    const totalRewardCap = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.rewardCap.toString()), 0)
    
    const formattedBounty = {
      ...bounty,
      alphaReward: totalReward.toString(),
      alphaRewardCap: totalRewardCap.toString(),
      winningSpotConfigs: bounty.winningSpotConfigs.map((spot: any) => ({
        ...spot,
        reward: spot.reward.toString(),
        rewardCap: spot.rewardCap.toString()
      })),
      submissions: bounty.submissions.map(submission => {
        // Determine if user should see sensitive data
        const isOwner = session?.user?.id === submission.submitterId
        const isBountyCreator = session?.user?.id === bounty.creatorId
        const isAdmin = session?.user?.isAdmin === true
        const isBountyCompleted = bounty.status === 'COMPLETED'
        const canViewSensitiveData = isOwner || isBountyCreator || isAdmin || isBountyCompleted

        return {
          ...submission,
          // Filter sensitive data for unauthorized users (unless bounty is completed)
          description: canViewSensitiveData ? submission.description : 'Submission content hidden for privacy',
          textContent: canViewSensitiveData ? submission.textContent : null,
          urls: canViewSensitiveData ? submission.urls : [],
          score: submission.score?.toString() || null,
          voteCount: submission._count.votes,
          files: submission.files.map(file => ({
            ...file,
            filesize: file.filesize.toString()
          })),
          // Add flag to help UI determine anonymization
          isAnonymized: !canViewSensitiveData
        }
      })
    }

    return NextResponse.json(formattedBounty)

  } catch (error) {
    console.error('Bounty fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bounty' },
      { status: 500 }
    )
  }
}

// PUT /api/bounties/[id] - Update bounty
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the bounty
    const existingBounty = await prisma.bounty.findUnique({
      where: { id: params.id }
    })

    if (!existingBounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      )
    }

    // Allow admins to update any bounty's publish status, but only creators can update other fields
    const isAdmin = session.user.isAdmin === true
    const isCreator = existingBounty.creatorId === session.user.id
    
    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized to update this bounty' },
        { status: 403 }
      )
    }
    
    // Non-admins can't update isPublished field
    if (!isAdmin && updateData.hasOwnProperty('isPublished')) {
      return NextResponse.json(
        { error: 'Only admins can publish/unpublish bounties' },
        { status: 403 }
      )
    }
    
    // Non-creators can only update isPublished field
    if (!isCreator && isAdmin) {
      const allowedFields = ['isPublished']
      const providedFields = Object.keys(updateData)
      const invalidFields = providedFields.filter(field => !allowedFields.includes(field))
      
      if (invalidFields.length > 0) {
        return NextResponse.json(
          { error: `Admins can only update isPublished field. Invalid fields: ${invalidFields.join(', ')}` },
          { status: 403 }
        )
      }
    }

    const updateData = await req.json()
    
    // Convert numeric fields
    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline)
    }

    const bounty = await prisma.bounty.update({
      where: { id: params.id },
      data: updateData,
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

    const totalReward = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.reward.toString()), 0)
    const totalRewardCap = bounty.winningSpotConfigs.reduce((sum: number, spot: any) => sum + parseFloat(spot.rewardCap.toString()), 0)

    return NextResponse.json({
      message: 'Bounty updated successfully',
      bounty: {
        ...bounty,
        alphaReward: totalReward.toString(),
        alphaRewardCap: totalRewardCap.toString(),
        winningSpotConfigs: bounty.winningSpotConfigs.map((spot: any) => ({
          ...spot,
          reward: spot.reward.toString(),
          rewardCap: spot.rewardCap.toString()
        }))
      }
    })

  } catch (error) {
    console.error('Bounty update error:', error)
    return NextResponse.json(
      { error: 'Failed to update bounty' },
      { status: 500 }
    )
  }
}
