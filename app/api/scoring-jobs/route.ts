import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')
    const status = searchParams.get('status')

    let where: any = {}
    
    if (submissionId) {
      where.submissionId = submissionId
    }
    
    if (status) {
      where.status = status
    }

    if (!session.user.isAdmin && submissionId) {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        select: { submitterId: true }
      })
      
      if (submission?.submitterId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else if (!session.user.isAdmin && !submissionId) {
      where.submission = {
        submitterId: session.user.id
      }
    }

    const scoringJobs = await prisma.scoringJob.findMany({
      where,
      include: {
        submission: {
          include: {
            bounty: {
              select: { title: true, id: true }
            },
            submitter: {
              select: { id: true, username: true }
            }
          }
        },
        screener: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(scoringJobs)
  } catch (error) {
    console.error('Error fetching scoring jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}