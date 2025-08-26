import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for some S3-compatible services like MinIO
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'bounty-submissions'

export interface S3File {
  key: string
  originalName: string
  mimeType: string
  size: number
  url?: string
}

export async function uploadFileToS3(
  file: Buffer,
  key: string,
  mimeType: string
): Promise<S3File> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    ACL: 'private', // Make files private by default
  })

  await s3Client.send(command)

  return {
    key,
    originalName: key.split('/').pop() || key,
    mimeType,
    size: file.length,
  }
}

export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export function generateS3Key(submissionId: string, originalName: string): string {
  const timestamp = Date.now()
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `submissions/${submissionId}/${timestamp}_${cleanName}`
}
