import { NextResponse } from 'next/server';
import { s3Client } from '@/src/app/api/clients/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import config from '@/config';

export async function POST(request: Request) {
  const { fileName } = await request.json();
  const userId = request.headers.get('x-user-id');

  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: `${userId}/${fileName}`,
  });

  const uploadUrl = await s3Client.send(command);
  console.log('uploadUrl', uploadUrl)

  return NextResponse.json({ uploadUrl });
}