import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic";

const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  targetDate: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  try {
    const milestones = await prisma.milestone.findMany({
      where: {
        isPublic: true
      },
      orderBy: [
        { completed: 'asc' },
        { targetDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(milestones)
  } catch (error) {
    console.error('Milestones fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createMilestoneSchema.parse(body)

    const milestone = await prisma.milestone.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        targetDate: validatedData.targetDate ? new Date(validatedData.targetDate) : null,
        isPublic: true
      }
    })

    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Milestone creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}