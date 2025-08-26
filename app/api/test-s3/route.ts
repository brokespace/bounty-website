import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'

export const dynamic = "force-dynamic";

// GET /api/test-s3 - Test S3 connection
export async function GET(req: NextRequest) {
  try {
    const s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })

    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)

    return NextResponse.json({
      success: true,
      buckets: response.Buckets?.map(bucket => bucket.Name) || [],
      message: 'S3 connection successful'
    })

  } catch (error) {
    console.error('S3 test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'S3 connection failed'
    }, { status: 500 })
  }
}
