import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const _cookies = cookies()
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scoringJob = await prisma.scoringJob.findUnique({
      where: { id: params.id },
      include: {
        submission: {
          include: {
            bounty: {
              select: { 
                title: true, 
                id: true, 
                creatorId: true,
                info: true,
                problem: true,
                requirements: true,
                tasks: true
              }
            },
            submitter: {
              select: { id: true, username: true, walletAddress: true }
            },
            files: true
          }
        },
        screener: true,
        scoringTasks: {
          include: {
            task: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!scoringJob) {
      return NextResponse.json({ error: 'Scoring job not found' }, { status: 404 })
    }

    const isAdmin = session.user.isAdmin
    const isSubmitter = scoringJob.submission.submitterId === session.user.id
    const isBountyCreator = scoringJob.submission.bounty.creatorId === session.user.id

    if (!isAdmin && !isSubmitter && !isBountyCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(scoringJob)
  } catch (error) {
    console.error('Error fetching scoring job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}