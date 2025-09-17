import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update user's TOS acceptance
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        acceptedTos: true,
        tosAcceptedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        acceptedTos: updatedUser.acceptedTos,
        tosAcceptedAt: updatedUser.tosAcceptedAt
      }
    })
  } catch (error) {
    console.error('Error accepting TOS:', error)
    return NextResponse.json(
      { error: 'Failed to accept Terms of Service' },
      { status: 500 }
    )
  }
}