import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/suggested-bounties/[id] - Get specific suggested bounty
export async function GET(
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

    const suggestedBounty = await prisma.suggestedBounty.findUnique({
      where: { id: params.id },
      include: {
        suggestedBy: {
          select: {
            id: true,
            username: true,
            walletAddress: true
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
      }
    })

    if (!suggestedBounty) {
      return NextResponse.json(
        { error: 'Suggested bounty not found' },
        { status: 404 }
      )
    }

    // Users can only view their own suggestions, admins can view all
    if (!session.user.isAdmin && suggestedBounty.suggestedById !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      suggestion: {
        ...suggestedBounty,
        alphaReward: suggestedBounty.alphaReward.toString(),
        alphaRewardCap: suggestedBounty.alphaRewardCap.toString()
      }
    })

  } catch (error) {
    console.error('Suggested bounty fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggested bounty' },
      { status: 500 }
    )
  }
}

// PUT /api/suggested-bounties/[id] - Update suggested bounty (approve/reject - admin only)
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

    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { action, reviewNotes } = await req.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Find the suggested bounty
    const suggestedBounty = await prisma.suggestedBounty.findUnique({
      where: { id: params.id },
      include: {
        suggestedBy: true
      }
    })

    if (!suggestedBounty) {
      return NextResponse.json(
        { error: 'Suggested bounty not found' },
        { status: 404 }
      )
    }

    if (suggestedBounty.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Suggested bounty has already been reviewed' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      // Create the actual bounty and update suggestion status
      const result = await prisma.$transaction(async (tx) => {
        // Create the bounty
        const newBounty = await tx.bounty.create({
          data: {
            title: suggestedBounty.title,
            description: suggestedBounty.description,
            requirements: suggestedBounty.requirements,
            alphaReward: suggestedBounty.alphaReward,
            alphaRewardCap: suggestedBounty.alphaRewardCap,
            rewardDistribution: suggestedBounty.rewardDistribution,
            winningSpots: suggestedBounty.winningSpots,
            deadline: suggestedBounty.deadline,
            acceptedSubmissionTypes: suggestedBounty.acceptedSubmissionTypes,
            creatorId: suggestedBounty.suggestedById, // The user who suggested becomes the creator
            status: 'ACTIVE'
          }
        })

        // Update the suggestion status
        const updatedSuggestion = await tx.suggestedBounty.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewNotes,
            convertedBountyId: newBounty.id
          },
          include: {
            suggestedBy: {
              select: {
                id: true,
                username: true,
                walletAddress: true
              }
            },
            convertedBounty: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        })

        return { suggestion: updatedSuggestion, bounty: newBounty }
      })

      return NextResponse.json({
        message: 'Bounty suggestion approved and bounty created',
        suggestion: {
          ...result.suggestion,
          alphaReward: result.suggestion.alphaReward.toString(),
          alphaRewardCap: result.suggestion.alphaRewardCap.toString()
        },
        bounty: {
          ...result.bounty,
          alphaReward: result.bounty.alphaReward.toString(),
          alphaRewardCap: result.bounty.alphaRewardCap.toString()
        }
      })

    } else { // reject
      const updatedSuggestion = await prisma.suggestedBounty.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewNotes
        },
        include: {
          suggestedBy: {
            select: {
              id: true,
              username: true,
              walletAddress: true
            }
          }
        }
      })

      return NextResponse.json({
        message: 'Bounty suggestion rejected',
        suggestion: {
          ...updatedSuggestion,
          alphaReward: updatedSuggestion.alphaReward.toString(),
          alphaRewardCap: updatedSuggestion.alphaRewardCap.toString()
        }
      })
    }

  } catch (error) {
    console.error('Suggested bounty update error:', error)
    return NextResponse.json(
      { error: 'Failed to update suggested bounty' },
      { status: 500 }
    )
  }
}

// DELETE /api/suggested-bounties/[id] - Delete suggested bounty (creator only, if pending)
export async function DELETE(
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

    const suggestedBounty = await prisma.suggestedBounty.findUnique({
      where: { id: params.id }
    })

    if (!suggestedBounty) {
      return NextResponse.json(
        { error: 'Suggested bounty not found' },
        { status: 404 }
      )
    }

    // Only the creator can delete their own suggestion, and only if it's still pending
    if (suggestedBounty.suggestedById !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own suggestions' },
        { status: 403 }
      )
    }

    if (suggestedBounty.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete suggestion that has already been reviewed' },
        { status: 400 }
      )
    }

    await prisma.suggestedBounty.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Suggested bounty deleted successfully'
    })

  } catch (error) {
    console.error('Suggested bounty deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete suggested bounty' },
      { status: 500 }
    )
  }
}