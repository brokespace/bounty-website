import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
              select: { creatorId: true }
            },
            submitter: {
              select: { id: true }
            }
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

    const lokiUrl = process.env.LOKI_URL
    if (!lokiUrl) {
      return NextResponse.json({ error: 'Loki server not configured' }, { status: 500 })
    }

    const query = `{job_id="${params.id}"}`
    const now = Date.now() * 1000000 // Convert to nanoseconds
    const oneHourAgo = now - (60 * 60 * 1000 * 1000000) // 1 hour ago in nanoseconds

    const lokiResponse = await fetch(
      `${lokiUrl}/loki/api/v1/query_range?` +
      new URLSearchParams({
        query,
        start: oneHourAgo.toString(),
        end: now.toString(),
        direction: 'forward',
        limit: '1000'
      })
    )

    if (!lokiResponse.ok) {
      throw new Error(`Loki query failed: ${lokiResponse.statusText}`)
    }

    const lokiData = await lokiResponse.json()
    return NextResponse.json(lokiData.data)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}