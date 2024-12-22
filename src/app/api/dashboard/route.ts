import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest, NextResponse } from 'next/server';
import { dynamoDbClient } from '../clients/dynamodb';
import { auth } from '@clerk/nextjs/server';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME || '';

// Função para encontrar decks que precisam de atenção
async function findDecksNeedingAttention(items: any[], userId: string) {
  const deckStats = new Map<string, { errors: number; total: number }>();

  items.forEach(item => {
    const current = deckStats.get(item.deckId) || { errors: 0, total: 0 };
    deckStats.set(item.deckId, {
      errors: current.errors + item.totalErrors,
      total: current.total + item.totalAttempts
    });
  });

  const decksNeedingAttention = Array.from(deckStats.entries())
    .map(([deckId, stats]) => ({
      deckId,
      errorRate: (stats.errors / stats.total) * 100,
      totalAttempts: stats.total
    }))
    .filter(deck => deck.errorRate > 30) // Decks com taxa de erro > 30%
    .sort((a, b) => b.errorRate - a.errorRate);

  // Buscar os detalhes dos decks
  const deckDetails = await Promise.all(
    decksNeedingAttention.map(async deck => {
      const deckCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userId}`,
          sk: `DECK#${deck.deckId}`
        }
      });

      const deckResponse = await dynamoDbClient.send(deckCommand);
      const deckData = deckResponse.Item;

      return {
        ...deck,
        title: deckData?.title || '',
        description: deckData?.description || ''
      };
    })
  );

  return deckDetails;
}

// Função para gerar calendário de revisões
function generateReviewCalendar(items: any[]) {
  const calendar = new Map<string, { count: number; deckId: string }>();
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  items.forEach(item => {
    const reviewDate = new Date(item.nextReview).toISOString().split('T')[0];
    if (next7Days.includes(reviewDate)) {
      const currentEntry = calendar.get(reviewDate);
      if (currentEntry) {
        currentEntry.count++;
      } else {
        calendar.set(reviewDate, { count: 1, deckId: item.deckId });
      }
    }
  });

  return next7Days.map(date => ({
    date,
    reviewCount: calendar.get(date)?.count || 0,
    deckId: calendar.get(date)?.deckId || ''
  }));
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'CARD_PROGRESS#'
      }
    });

    const response = await dynamoDbClient.send(command);

    const dashboardData = {
      decksNeedingAttention: await findDecksNeedingAttention(response.Items || [], userId),
      reviewCalendar: generateReviewCalendar(response.Items || [])
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}