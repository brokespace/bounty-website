
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/bounties/[id]/submissions - Get submissions for a bounty
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const sortBy = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const where: any = {
      bountyId: params.id
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (userId) {
      where.submitterId = userId
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            hotkey: true
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
        [sortBy]: order as 'asc' | 'desc'
      }
    })

    const formattedSubmissions = submissions.map(submission => ({
      ...submission,
      score: submission.score?.toString() || null,
      voteCount: submission._count.votes,
      files: submission.files.map(file => ({
        ...file,
        filesize: file.filesize.toString()
      }))
    }))

    return NextResponse.json(formattedSubmissions)

  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST /api/bounties/[id]/submissions - Create submission for bounty
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

    // Check if bounty exists and is active
    const bounty = await prisma.bounty.findUnique({
      where: { id: params.id }
    })

    if (!bounty) {
      return NextResponse.json(
        { error: 'Bounty not found' },
        { status: 404 }
      )
    }

    if (bounty.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Bounty is not accepting submissions' },
        { status: 400 }
      )
    }

    const { title, description, contentType, urls, textContent } = await req.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    if (!contentType) {
      return NextResponse.json(
        { error: 'Content type is required' },
        { status: 400 }
      )
    }

    // Validate content type is accepted by the bounty
    if (!bounty.acceptedSubmissionTypes.includes(contentType) && !bounty.acceptedSubmissionTypes.includes('MIXED')) {
      return NextResponse.json(
        { error: `This bounty does not accept ${contentType} submissions` },
        { status: 400 }
      )
    }

    // Validate content based on type
    if (contentType === 'URL' && (!urls || urls.length === 0)) {
      return NextResponse.json(
        { error: 'At least one URL is required for URL submissions' },
        { status: 400 }
      )
    }

    const submission = await prisma.submission.create({
      data: {
        title,
        description,
        contentType: contentType || 'FILE',
        urls: urls || [],
        textContent: textContent || null,
        bountyId: params.id,
        submitterId: session.user.id
      },
      include: {
        submitter: {
          select: {
            id: true,
            username: true,
            hotkey: true
          }
        },
        files: true
      }
    })

    return NextResponse.json({
      message: 'Submission created successfully',
      submission: {
        ...submission,
        score: submission.score?.toString() || null
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Submission creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
