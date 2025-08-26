
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadFileToS3, generateS3Key } from '@/lib/s3'

export const dynamic = "force-dynamic";

// POST /api/upload - Handle file uploads
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const submissionId = formData.get('submissionId') as string

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      )
    }

    // Verify submission exists and user owns it
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        submitterId: session.user.id
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or not authorized' },
        { status: 404 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      if (file.size === 0) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate S3 key
      const s3Key = generateS3Key(submissionId, file.name)

      // Upload to S3
      const s3File = await uploadFileToS3(buffer, s3Key, file.type)

      // Determine file type based on mime type
      let fileType: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'CODE' | 'ARCHIVE' | 'OTHER' = 'OTHER'
      if (file.type.startsWith('image/')) fileType = 'IMAGE'
      else if (file.type.startsWith('video/')) fileType = 'VIDEO'
      else if (file.type.includes('pdf') || file.type.includes('document')) fileType = 'DOCUMENT'
      else if (file.type.includes('zip') || file.type.includes('archive')) fileType = 'ARCHIVE'
      else if (file.type.includes('javascript') || file.type.includes('python') || file.type.includes('code')) fileType = 'CODE'

      // Save file record to database
      const fileRecord = await prisma.submissionFile.create({
        data: {
          originalName: file.name,
          filename: s3File.key.split('/').pop() || file.name,
          filepath: s3File.key, // Store S3 key as filepath
          filesize: BigInt(file.size),
          mimeType: file.type,
          fileType,
          submissionId
        }
      })

      uploadedFiles.push({
        ...fileRecord,
        filesize: fileRecord.filesize.toString()
      })
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
