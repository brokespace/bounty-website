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
    console.log(`[Logs API] Fetching logs for scoring job: ${params.id}`)
    
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log(`[Logs API] Unauthorized access attempt for job: ${params.id}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[Logs API] User ${session.user.id} requesting logs for job: ${params.id}`)

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
      console.log(`[Logs API] Scoring job not found: ${params.id}`)
      return NextResponse.json({ error: 'Scoring job not found' }, { status: 404 })
    }

    console.log(`[Logs API] Found scoring job: ${params.id}, submission: ${scoringJob.submissionId}`)

    const isAdmin = session.user.isAdmin
    const isSubmitter = scoringJob.submission.submitterId === session.user.id
    const isBountyCreator = scoringJob.submission.bounty.creatorId === session.user.id

    console.log(`[Logs API] Access check - Admin: ${isAdmin}, Submitter: ${isSubmitter}, BountyCreator: ${isBountyCreator}`)

    if (!isAdmin && !isSubmitter && !isBountyCreator) {
      console.log(`[Logs API] Access denied for user ${session.user.id} to job ${params.id}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const seqUrl = process.env.SEQ_URL
    const seqApiKey = process.env.SEQ_API_KEY
    if (!seqUrl) {
      console.error('[Logs API] SEQ_URL environment variable not configured')
      return NextResponse.json({ error: 'Seq server not configured' }, { status: 500 })
    }

    console.log(`[Logs API] Using Seq server: ${seqUrl}`)

    // Seq uses ISO 8601 timestamps, not nanoseconds
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000)) // 1 hour ago
    
    // Seq query syntax - filter by job_id tag
    const filter = `job_id = '${params.id}'`

    console.log(`[Logs API] Querying Seq with filter: ${filter}, from: ${oneHourAgo.toISOString()}, to: ${now.toISOString()}`)

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (seqApiKey) {
      headers['X-Seq-ApiKey'] = seqApiKey
    }

    const seqResponse = await fetch(
      `${seqUrl}/api/events?` +
      new URLSearchParams({
        filter,
        from: oneHourAgo.toISOString(),
        to: now.toISOString(),
        count: '1000'
      }),
      {
        headers
      }
    )

    if (!seqResponse.ok) {
      console.error(`[Logs API] Seq query failed: ${seqResponse.status} ${seqResponse.statusText}`)
      const errorText = await seqResponse.text()
      console.error(`[Logs API] Seq error response: ${errorText}`)
      throw new Error(`Seq query failed: ${seqResponse.statusText}`)
    }

    const seqData = await seqResponse.json()
    console.log(`[Logs API] Successfully retrieved ${seqData.Events?.length || 0} log events for job: ${params.id}`)
    console.log(seqData)
    return NextResponse.json(seqData)
  } catch (error) {
    console.error(`[Logs API] Error fetching logs for job ${params.id}:`, error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}