import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '../../clients/s3';
import config from '@/config';

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

  console.log({listParams});

  const listCommand = new ListObjectsV2Command(listParams);
  const listResponse = await s3Client.send(listCommand);

  console.log({listResponse: JSON.stringify(listResponse, null, 2)});

  const pdfs = listResponse.Contents?.filter((object) => object.Key?.endsWith('.pdf'))
    .map((object) => ({
      name: object.Key?.split('/').pop() || '',
      uploadDate: object.LastModified,
      url: `${config.aws.bucketUrl}${object.Key}`,
    })) || [];

  console.log({pdfs});

  return NextResponse.json(pdfs, { status: 200 });
}