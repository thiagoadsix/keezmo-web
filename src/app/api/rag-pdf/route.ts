import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import { createApiClient } from '@/src/lib/api-client';

const KEEZMO_API_URL = process.env.KEEZMO_API_URL

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/rag-pdf] Request received');

  const userEmail = req.headers.get('x-user-email');
  console.log(`📍 [Auth] User email from request: ${userEmail || 'none'}`);

  if (!userEmail) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const pageStart = parseInt(formData.get('pageStart') as string);
    const pageEnd = parseInt(formData.get('pageEnd') as string);

    console.log('📝 [Request] Page start:', pageStart);
    console.log('📝 [Request] Page end:', pageEnd);

    // Validações
    if (!file) throw new Error('No file provided');
    if (isNaN(pageStart) || isNaN(pageEnd)) throw new Error('Invalid page range');
    if (pageEnd - pageStart + 1 > 30) throw new Error('Page range too large');

    // Carregar PDF e extrair páginas específicas
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Criar novo PDF com apenas as páginas selecionadas
    const newPdfDoc = await PDFDocument.create();
    const pages = await newPdfDoc.copyPages(pdfDoc, Array.from(
      { length: pageEnd - pageStart + 1 },
      (_, i) => pageStart - 1 + i
    ));

    pages.forEach(page => newPdfDoc.addPage(page));

    // Converter para bytes e depois para base64
    const newPdfBytes = await newPdfDoc.save();
    const pdfBase64 = Buffer.from(newPdfBytes).toString('base64');

    const numCards = formData.get('numCards') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!numCards) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const body = new FormData();
    body.append('user_email', userEmail);
    body.append('num_cards', numCards);
    body.append('pdf_file', new Blob([newPdfBytes]));
    body.append('title', title);
    body.append('description', description);

    console.log('🚀 [API] Calling generate-cards endpoint');
    const keezmoApiClient = createApiClient(String(KEEZMO_API_URL));

    const response = await keezmoApiClient.post<{deckId: string}>('generate-cards', {
      body
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [API] Request successful');

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