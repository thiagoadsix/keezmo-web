import { NextRequest, NextResponse } from 'next/server';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDbClient } from '../../clients/dynamodb';
import {  ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '../../clients/s3';
import config from '@/config';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email');

  if (!email) {
    console.warn('⚠️ [Auth] Unauthorized access attempt');
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const command = new QueryCommand({
    TableName: process.env.DYNAMODB_KEEZMO_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk AND sk = :sk',
    ExpressionAttributeValues: {
      ':pk': `USER#${email}`,
      ':sk': `USER#${email}`,
    },
  });

  const response = await dynamoDbClient.send(command);
  const user = response.Items?.[0] || null;

  if (user) {
    // Obter a contagem de PDFs enviados no mês atual diretamente do S3
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const listParams = {
      Bucket: config.aws.bucket,
      Prefix: user.clerkId,
    };

    // const listCommand = new ListObjectsV2Command(listParams);
    // const listResponse = await s3Client.send(listCommand);

    // console.log({listResponse: JSON.stringify(listResponse, null, 2)});

    // const pdfsUploadedThisMonth = listResponse.Contents?.filter((object) => {
    //   const uploadDate = new Date(object.LastModified!);
    //   return uploadDate.getMonth() === currentMonth && uploadDate.getFullYear() === currentYear;
    // }).length || 0;

    // user.pdfsUploadedThisMonth = pdfsUploadedThisMonth;
    user.pdfsUploadedThisMonth = 0;
  }

  return NextResponse.json(user, { status: 200 });
}
