import { NextResponse } from 'next/server';
import { s3Client } from '@/src/app/api/clients/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import config from '@/config';

export async function POST(request: Request) {
  const { fileName } = await request.json();
  console.log('fileName', fileName)

  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: fileName,
  });

  const uploadUrl = await s3Client.send(command);
  console.log('uploadUrl', uploadUrl)

  return NextResponse.json({ uploadUrl });
}