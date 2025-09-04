
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/submissions/[id] - Get submission by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        bounty: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            status: true,
            rewardDistribution: true
          },
          include: {
            winningSpotConfigs: {
              orderBy: {
                position: 'asc'
              }
            }
          }
        },
        files: true,
        votes: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        },
        validationLogs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Determine if user should see sensitive data
    const isOwner = session?.user?.id === submission.submitterId
    const isBountyCreator = session?.user?.id === submission.bounty.creatorId
    const isAdmin = session?.user?.isAdmin === true
    const isBountyCompleted = submission.bounty.status === 'COMPLETED'
    const canViewSensitiveData = isOwner || isBountyCreator || isAdmin || isBountyCompleted

    const formattedSubmission = {
      ...submission,
      // Filter sensitive data for unauthorized users
      description: canViewSensitiveData ? submission.description : 'Submission content hidden for privacy',
      textContent: canViewSensitiveData ? submission.textContent : null,
      urls: canViewSensitiveData ? submission.urls : [],
      score: submission.score?.toString() || null,
      bounty: {
        ...submission.bounty,
        alphaReward: submission.bounty.winningSpotConfigs.reduce((sum: number, spot: any) => 
          sum + parseFloat(spot.reward.toString()), 0
        ).toString(),
        alphaRewardCap: submission.bounty.winningSpotConfigs.reduce((sum: number, spot: any) => 
          sum + parseFloat(spot.rewardCap.toString()), 0
        ).toString()
      },
      files: submission.files.map(file => ({
        ...file,
        filesize: file.filesize.toString()
      })),
      validationLogs: submission.validationLogs.map(log => ({
        ...log,
        score: log.score?.toString() || null
      })),
      // Add flag to help UI determine anonymization
      isAnonymized: !canViewSensitiveData
    }

    return NextResponse.json({ submission: formattedSubmission })

  } catch (error) {
    console.error('Submission fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

// PUT /api/submissions/[id] - Update submission
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

    const existingSubmission = await prisma.submission.findUnique({
      where: { id: params.id }
    })

    if (!existingSubmission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (existingSubmission.submitterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this submission' },
        { status: 403 }
      )
    }

    const updateData = await req.json()
    
    const submission = await prisma.submission.update({
      where: { id: params.id },
      data: updateData,
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        files: true
      }
    })

    return NextResponse.json({
      message: 'Submission updated successfully',
      submission: {
        ...submission,
        score: submission.score?.toString() || null
      }
    })

  } catch (error) {
    console.error('Submission update error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}
