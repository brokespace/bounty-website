import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// POST /api/submissions/[id]/rescore - Rescore a submission (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check admin authorization
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      include: {
        scoringJobs: {
          include: {
            scoringTasks: true
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

    // Perform rescoring within a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all ScoringTasks for this submission
      for (const scoringJob of submission.scoringJobs) {
        await tx.scoringTask.deleteMany({
          where: {
            scoringJobId: scoringJob.id
          }
        })
      }

      // Delete all ScoringJobs for this submission
      await tx.scoringJob.deleteMany({
        where: {
          submissionId: params.id
        }
      })

      // Reset submission status and clear error/score fields
      await tx.submission.update({
        where: { id: params.id },
        data: {
          status: 'PENDING',
          score: null,
          scoredBy: []
        }
      })
    })

    return NextResponse.json({
      message: 'Submission rescored successfully. All scoring jobs and tasks have been cleared.'
    })

  } catch (error) {
    console.error('Rescore submission error:', error)
    return NextResponse.json(
      { error: 'Failed to rescore submission' },
      { status: 500 }
    )
  }
}