
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import mime from 'mime-types'

export const dynamic = "force-dynamic";

// GET /api/files/[...filename] - Serve uploaded files
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/')
    const filepath = path.join(process.cwd(), 'uploads', filename)

    // Security check - ensure file is within uploads directory
    const normalizedPath = path.normalize(filepath)
    const uploadsPath = path.normalize(path.join(process.cwd(), 'uploads'))
    
    if (!normalizedPath.startsWith(uploadsPath)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    const fileBuffer = await readFile(filepath)
    const mimeType = mime.lookup(filepath) || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  }
}
