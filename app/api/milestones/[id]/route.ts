import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = "force-dynamic";

const updateMilestoneSchema = z.object({
  completed: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  targetDate: z.string().optional().nullable(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateMilestoneSchema.parse(body)

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id }
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    const updateData: any = {}
    
    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed
      updateData.completedAt = validatedData.completed ? new Date() : null
    }
    
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.targetDate !== undefined) {
      updateData.targetDate = validatedData.targetDate ? new Date(validatedData.targetDate) : null
    }

    const updatedMilestone = await prisma.milestone.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedMilestone)
  } catch (error) {
    console.error('Milestone update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const milestone = await prisma.milestone.findUnique({
      where: { id: params.id }
    })

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 })
    }

    await prisma.milestone.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    console.error('Milestone deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}