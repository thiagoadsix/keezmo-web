import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../clients/s3';
import config from '@/config';
import { PDFDocument } from 'pdf-lib';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const { fileName, file } = await req.json();

  if (!userId) {
    console.warn('⚠️ [Auth] Missing user ID');
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const key = `${userId}/${fileName}`;

  // Load the PDF and get the total page count
  const pdfBytes = await fetch(file).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();

  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
    ContentType: 'application/pdf',
    Metadata: {
      'custom-name': fileName.split('_')[0], // Save the custom name as metadata
      'page-count': pageCount.toString(), // Save the page count as metadata
    },
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return NextResponse.json({ uploadUrl: url }, { status: 200 });
}