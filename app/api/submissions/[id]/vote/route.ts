
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// POST /api/submissions/[id]/vote - Vote on submission
export async function POST(
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

    const { type } = await req.json()

    if (!type || !['UPVOTE', 'DOWNVOTE'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // Check if submission exists
    const submission = await prisma.submission.findUnique({
      where: { id: params.id }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_submissionId: {
          userId: session.user.id,
          submissionId: params.id
        }
      }
    })

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await prisma.vote.delete({
          where: { id: existingVote.id }
        })
        return NextResponse.json({ message: 'Vote removed' })
      } else {
        // Update vote type
        const vote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })
        return NextResponse.json({ message: 'Vote updated', vote })
      }
    } else {
      // Create new vote
      const vote = await prisma.vote.create({
        data: {
          type,
          userId: session.user.id,
          submissionId: params.id
        }
      })
      return NextResponse.json({ message: 'Vote created', vote }, { status: 201 })
    }

  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
