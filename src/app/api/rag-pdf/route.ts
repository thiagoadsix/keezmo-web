import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createApiClient } from '@/src/lib/api-client';
import { s3Client } from '@/src/app/api/clients/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import appConfig from '@/config';
const KEEZMO_API_URL = process.env.KEEZMO_API_URL

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/rag-pdf] Request received');

  const userEmail = req.headers.get('x-user-email');
  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

  if (!userEmail) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url, fileUrl, pageStart, pageEnd } = await req.json();

    if (isNaN(pageStart) || isNaN(pageEnd)) throw new Error('Invalid page range');
    if (pageEnd - pageStart + 1 > 30) throw new Error('Page range too large');

    const body = new FormData();
    body.append('user_email', userEmail);

    if (url && !fileUrl) {
      body.append('url', url);
      body.append('input_type', 'url');
    } else {
      console.log('fileUrl', fileUrl);
      // Carregar PDF do S3 e extrair páginas específicas
      const key = decodeURIComponent(fileUrl.split('?')[0].split('/').slice(-1)[0]);
      console.log('key', key);
      const command = new GetObjectCommand({
        Bucket: appConfig.aws.bucket,
        Key: `${userId}/${key}`,
      });
      console.log('command', JSON.stringify(command, null, 2));
      const { Body } = await s3Client.send(command);
      console.log('Body', Body);
      const pdfBytes = await Body?.transformToByteArray();
      console.log('pdfBytes', pdfBytes);
      const pdfDoc = await PDFDocument.load(pdfBytes!);
      console.log('pdfDoc', pdfDoc);

      // Criar novo PDF com apenas as páginas selecionadas
      const newPdfDoc = await PDFDocument.create();
      const pages = await newPdfDoc.copyPages(pdfDoc, Array.from(
        { length: pageEnd - pageStart + 1 },
        (_, i) => pageStart - 1 + i
      ));

      pages.forEach(page => newPdfDoc.addPage(page));

      // Converter para bytes e depois para base64
      const newPdfBytes = await newPdfDoc.save();

      const fileExtension = key.split('.').pop();
      console.log('fileExtension', fileExtension);
      if (fileExtension) {
        body.append('input_type', fileExtension);
      }
      body.append('file', new Blob([newPdfBytes]));
    }

    const keezmoApiClient = createApiClient(String(KEEZMO_API_URL));

    const response = await keezmoApiClient.post<{deckId: string}>('generate-cards', {
      body
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({deckId: result.deckId});

  } catch (error: any) {
    console.error('❌ [Error] Failed to process PDF:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
    });

    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};