import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest, NextResponse } from 'next/server';
import { dynamoDbClient } from '../clients/dynamodb';
import { Dashboard } from '@/types/dashboard';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME

// Função para encontrar decks que precisam de atenção
async function findDecksNeedingAttention(items: any[], userEmail: string) {
  // Vamos agrupar por (deckId + cardType), em vez de somente deckId
  // Assim, se um deck tiver tipos diferentes, cada tipo é um "grupo" diferente
  type DeckKey = `${string}#${string}`; // "deckId#cardType"
  const deckStats = new Map<DeckKey, { errors: number; total: number; cardType: string }>();

  // Percorremos cada item (cada registro de progresso de cartão)
  items.forEach(item => {
    // Gera uma chave única deckId#cardType
    const key = `${item.deckId}#${item.cardType}` as DeckKey;

    // Se não existir no map, inicializa
    const current = deckStats.get(key) || {
      errors: 0,
      total: 0,
      cardType: item.cardType, // Mantém qual é o tipo
    };

    deckStats.set(key, {
      errors: current.errors + (item.totalErrors ?? 0),
      total: current.total + (item.totalAttempts ?? 0),
      cardType: item.cardType,
    });
  });

  // Monta o array final a partir do Map
  const decksNeedingAttention = Array.from(deckStats.entries())
    .map(([key, stats]) => {
      // key = deckId#cardType
      const [deckId] = key.split("#");
      const { cardType, errors, total } = stats;

      const errorRate = total ? (errors / total) * 100 : 0;
      return {
        deckId,
        cardType,           // <<<<< inclui o cardType no objeto
        errorRate,
        totalAttempts: total,
      };
    })
    // Filtra somente decks com taxa de erro > 30%
    .filter(deck => deck.errorRate > 30)
    // Ordena do maior para o menor
    .sort((a, b) => b.errorRate - a.errorRate);

  // Buscar os detalhes de cada deck (title, description) no Dynamo
  const deckDetails = await Promise.all(
    decksNeedingAttention.map(async (deck) => {
      const deckCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userEmail}`,
          sk: `DECK#${deck.deckId}`
        }
      });

      const deckResponse = await dynamoDbClient.send(deckCommand);
      const deckData = deckResponse.Item;

      return {
        ...deck,
        title: deckData?.title || "",
        description: deckData?.description || "",
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
  const userEmail = req.headers.get("x-user-email");
  console.log("[Dashboard] GET route called. userEmail:", userEmail);

  if (!userEmail) {
    console.log("[Dashboard] Missing userEmail in headers");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
      ExpressionAttributeValues: {
        ":pk": `USER#${userEmail}`,
        ":sk": "CARD_PROGRESS#",
      },
    });

    const response = await dynamoDbClient.send(command);

    console.log("[Dashboard] DynamoDB response items:", JSON.stringify(response.Items, null, 2));

    const decksNeedingAttention = await findDecksNeedingAttention(response.Items || [], userEmail);
    console.log("[Dashboard] decksNeedingAttention:", JSON.stringify(decksNeedingAttention, null, 2));

    const reviewCalendar = generateReviewCalendar(response.Items || []);
    console.log("[Dashboard] reviewCalendar:", JSON.stringify(reviewCalendar, null, 2));

    const dashboardData = {
      decksNeedingAttention,
      reviewCalendar,
    };

    console.log("[Dashboard] returning dashboardData:", JSON.stringify(dashboardData, null, 2));

    return NextResponse.json<Dashboard>(dashboardData);
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
