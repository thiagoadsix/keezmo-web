import { NextRequest, NextResponse } from 'next/server';
import { InvokeCommand } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../clients/lambda';

export async function POST(req: NextRequest) {
  console.log('➡️ [POST /api/rag-pdf] Request received');

  const userId = req.headers.get('x-user-id');
  console.log(`📍 [Auth] User ID from request: ${userId || 'none'}`);

  if (!userId) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const numCards = formData.get('numCards') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !numCards) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const pdfBytes = Buffer.from(fileBuffer).toString('base64');

    const payload = {
      userId,
      numCards: parseInt(numCards),
      pdfBytes,
      title,
      description
    };

    const command = new InvokeCommand({
      FunctionName: 'keezmo-dev-rag-pdf-invoke',
      Payload: JSON.stringify(payload)
    });

    console.log('🚀 [Lambda] Invoking rag-pdf-invoke function');
    const response = await lambdaClient.send(command);

    if (response.FunctionError) {
      throw new Error(response.FunctionError);
    }

    const result = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null;
    console.log('✅ [Lambda] Function executed successfully');

    return NextResponse.json({deckId: result.body.deckId});

  } catch (error: any) {
    console.error('❌ [Error] Failed to process PDF:', {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      userId
    });

    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}