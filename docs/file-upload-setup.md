# File Upload Setup

This document describes how to set up file uploads for bounty submissions using S3-compatible storage.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
S3_ENDPOINT=your-s3-endpoint-url
S3_REGION=your-s3-region
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
```

## S3 Bucket Setup

1. Create an S3 bucket named `bounty-submissions` (or update the bucket name in `lib/s3.ts`)
2. Configure the bucket with appropriate permissions
3. Ensure your S3 credentials have the following permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject`
   - `s3:ListBucket`

## Features

### File Upload Component
- Drag and drop file upload interface
- Support for multiple file types (images, videos, documents, code, archives)
- File size and type validation
- Progress tracking during upload
- Automatic file type detection

### File Storage
- Files are stored in S3 with organized folder structure: `submissions/{submissionId}/{timestamp}_{filename}`
- Files are stored with private ACL for security
- Original filenames are preserved in the database

### File Access
- Signed download URLs are generated for secure file access
- Access control based on submission ownership
- 1-hour expiry for download URLs

### File Display
- Files are displayed in submission cards with appropriate icons
- File type badges and size information
- Download functionality with progress tracking

## API Endpoints

### POST /api/upload
Uploads files to S3 and associates them with a submission.

**Required fields:**
- `submissionId`: The ID of the submission
- `files`: Array of files to upload

### GET /api/files/[id]/download
Generates a signed download URL for a file.

**Access control:**
- Submission owner can download
- Bounty creator can download
- Requires authentication

### GET /api/test-s3
Test endpoint to verify S3 connection and configuration.

## Usage

1. Users can select files when creating a submission
2. Files are uploaded to S3 after submission creation
3. Files are displayed in the submission list with download options
4. Access is controlled based on user permissions

## Security Considerations

- Files are stored with private ACL
- Download URLs expire after 1 hour
- Access is restricted to submission owners and bounty creators
- File types are validated on both client and server
- Original filenames are sanitized to prevent path traversal

## Troubleshooting

### Test S3 Connection
Visit `/api/test-s3` to verify your S3 configuration.

### Common Issues
1. **Bucket not found**: Ensure the bucket exists and is accessible
2. **Permission denied**: Check S3 credentials and bucket permissions
3. **Endpoint issues**: Verify the S3 endpoint URL is correct
4. **Region mismatch**: Ensure the region matches your S3 setup
