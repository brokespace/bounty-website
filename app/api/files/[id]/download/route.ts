import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSignedDownloadUrl } from '@/lib/s3'

export const dynamic = "force-dynamic";

// GET /api/files/[id]/download - Get signed download URL for a file
export async function GET(
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

    const fileId = params.id

    // Get file record
    const file = await prisma.submissionFile.findUnique({
      where: { id: fileId },
      include: {
        submission: {
          include: {
            bounty: true
          }
        }
      }
    })

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this file
    // User can access if they:
    // 1. Own the submission
    // 2. Own the bounty
    // 3. Are an admin
    // 4. Bounty is completed (public access)
    const canAccess = 
      file.submission.submitterId === session.user.id ||
      file.submission.bounty.creatorId === session.user.id ||
      session.user.isAdmin === true ||
      file.submission.bounty.status === 'COMPLETED'

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate signed download URL
    const downloadUrl = await getSignedDownloadUrl(file.filepath, 3600) // 1 hour expiry

    return NextResponse.json({
      downloadUrl,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.filesize.toString()
    })

  } catch (error) {
    console.error('Download URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    )
  }
}
