import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

// GET /api/bug-reports - Get all bug reports (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }
    if (priority && priority !== 'all') {
      where.priority = priority.toUpperCase()
    }

    const bugReports = await prisma.bugReport.findMany({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { reportedAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    return NextResponse.json({ bugReports })

  } catch (error) {
    console.error('Bug reports fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bug reports' },
      { status: 500 }
    )
  }
}

// POST /api/bug-reports - Create new bug report
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const {
      title,
      description,
      category,
      priority
    } = await req.json()

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Validate category if provided
    const validCategories = ['UI_UX', 'FUNCTIONALITY', 'PERFORMANCE', 'SECURITY', 'OTHER']
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate priority if provided
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      )
    }

    // Create bug report
    const bugReport = await prisma.bugReport.create({
      data: {
        title,
        description,
        category: category || 'OTHER',
        priority: priority || 'MEDIUM',
        reporterId: session?.user?.id || null
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Bug report submitted successfully',
      bugReport
    }, { status: 201 })

  } catch (error) {
    console.error('Bug report creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    )
  }
}