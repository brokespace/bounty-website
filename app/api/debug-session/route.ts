import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        message: 'No active session',
        session: null
      })
    }
    
    // Get user details and their submissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            submissions: true,
            bounties: true
          }
        }
      }
    })
    
    const submissions = await prisma.submission.findMany({
      where: { submitterId: session.user.id },
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      take: 5
    })
    
    return NextResponse.json({
      session: {
        userId: session.user.id,
        username: session.user.username,
        email: session.user.email
      },
      user: {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        submissionCount: user?._count?.submissions || 0,
        bountyCount: user?._count?.bounties || 0
      },
      recentSubmissions: submissions
    })
    
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({
      error: 'Failed to debug session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}