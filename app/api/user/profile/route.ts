import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  walletAddress: z.string().optional(),
  isNewUser: z.boolean().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // For new users, wallet address is required
    if (validatedData.isNewUser && (!validatedData.walletAddress || validatedData.walletAddress.trim() === '')) {
      return NextResponse.json({ error: 'Wallet address is required for new users' }, { status: 400 })
    }

    // Check if username is already taken (if provided)
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          id: { not: session.user.id }
        }
      })
      
      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.username && { username: validatedData.username }),
        ...(validatedData.walletAddress && { walletAddress: validatedData.walletAddress })
      },
      select: {
        id: true,
        username: true,
        email: true,
        walletAddress: true,
        isActive: true,
        isAdmin: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        walletAddress: true,
        isActive: true,
        isAdmin: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}