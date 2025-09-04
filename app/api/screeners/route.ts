import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const screeners = await prisma.screener.findMany({
      include: {
        supportedBounties: {
          include: {
            bounty: {
              select: {
                id: true,
                title: true,
                status: true
              }
            },
            category: {
              include: {
                bounties: {
                  where: {
                    status: 'ACTIVE'
                  },
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(screeners)
  } catch (error) {
    console.error('Error fetching screeners:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}