import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../clients/s3';
import config from '@/config';
import { mimeWordsDecode } from 'emailjs-mime-codec';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email');

  if (!email) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const clerkId = req.headers.get('x-user-id');

  if (!clerkId) {
    console.warn('⚠️ [Auth] Missing Clerk ID');
    return NextResponse.json({ error: 'Missing Clerk ID' }, { status: 400 });
  }

  const listParams = {
    Bucket: config.aws.bucket,
    Prefix: clerkId,
  };

  const listCommand = new ListObjectsV2Command(listParams);
  const listResponse = await s3Client.send(listCommand);

  if (!listResponse.Contents) {
    return NextResponse.json([], { status: 200 });
  }

  const pdfs: any[] = [];
  for (const object of listResponse.Contents) {
    if (object.Key?.endsWith('.pdf')) {
      const headCommand = new HeadObjectCommand({
        Bucket: config.aws.bucket,
        Key: object.Key,
      });
      const headResponse = await s3Client.send(headCommand);

      const metadata = headResponse.Metadata || {};

      pdfs.push({
        name: mimeWordsDecode(metadata['custom-name'] ?? (object.Key?.split('/')?.pop()?.split('_')?.[0] || '')),
        uploadDate: object.LastModified,
        url: `${config.aws.bucketUrl}${object.Key}`,
        pageCount: metadata['page-count'] ? parseInt(metadata['page-count'], 10) : 0,
      });
    }
  }

  return NextResponse.json(pdfs, { status: 200 });
}
