const { S3Client, CreateBucketCommand, PutBucketCorsCommand } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

async function createBucket() {
  const s3Client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  })

  const bucketName = process.env.S3_BUCKET_NAME || 'bounty-submissions'

  try {
    console.log(`Creating bucket: ${bucketName}`)
    
    // Create the bucket
    const createCommand = new CreateBucketCommand({
      Bucket: bucketName,
    })
    
    await s3Client.send(createCommand)
    console.log(`✅ Bucket '${bucketName}' created successfully!`)

    // Configure CORS for the bucket
    const corsCommand = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
            AllowedOrigins: ['*'], // You may want to restrict this to your domain
            ExposeHeaders: ['ETag'],
          },
        ],
      },
    })

    await s3Client.send(corsCommand)
    console.log(`✅ CORS configured for bucket '${bucketName}'`)

  } catch (error) {
    if (error.name === 'BucketAlreadyExists') {
      console.log(`ℹ️  Bucket '${bucketName}' already exists`)
    } else if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`ℹ️  Bucket '${bucketName}' is already owned by you`)
    } else {
      console.error('❌ Error creating bucket:', error.message)
      process.exit(1)
    }
  }
}

createBucket()
