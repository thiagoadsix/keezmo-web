import { QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { NextRequest, NextResponse } from 'next/server';
import { dynamoDbClient } from '../clients/dynamodb';
import { Dashboard } from '@/types/dashboard';

const TABLE_NAME = process.env.DYNAMODB_KEEZMO_TABLE_NAME

// Função para encontrar decks que precisam de atenção
async function findDecksNeedingAttention(items: any[], userEmail: string) {
  type DeckKey = `${string}#${string}`;
  const deckStats = new Map<
    DeckKey,
    { errors: number; total: number; cardType: string }
  >();

  // Percorre cada registro
  items.forEach((item) => {
    const key = `${item.deckId}#${item.cardType}` as DeckKey;

    const current = deckStats.get(key) || {
      errors: 0,
      total: 0,
      cardType: item.cardType,
    };

    let addErrors = 0;
    let addTotal = 0;

    if (item.cardType === "multipleChoice") {
      // Usa as propriedades totalErrors e totalAttempts
      addErrors = item.totalErrors ?? 0;
      addTotal = item.totalAttempts ?? 0;
    } else if (item.cardType === "flashcard") {
      // Define sua regra para flashcards
      // Exemplo: rating = "hard" => +1 erro, +1 tentativa
      //          rating = "normal"/"easy" => 0 erro, +1 tentativa
      addTotal = 1;
      if (item.rating === "hard") {
        addErrors = 1;
      }
    }

    deckStats.set(key, {
      errors: current.errors + addErrors,
      total: current.total + addTotal,
      cardType: item.cardType,
    });
  });

  // Converte o Map em um array
  const decksNeedingAttention = Array.from(deckStats.entries())
    .map(([key, stats]) => {
      const [deckId] = key.split("#");
      const { cardType, errors, total } = stats;

      const errorRate = total > 0 ? (errors / total) * 100 : 0;

      return {
        deckId,
        cardType,
        errorRate,
        totalAttempts: total,
      };
    })
    // Filtra decks com taxa de erro acima de 30%
    .filter((deck) => deck.errorRate > 30)
    // Ordena decrescente
    .sort((a, b) => b.errorRate - a.errorRate);

  // Buscar detalhes no Dynamo
  const deckDetails = await Promise.all(
    decksNeedingAttention.map(async (deck) => {
      const deckCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userEmail}`,
          sk: `DECK#${deck.deckId}`,
        },
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
  const calendar = new Map<string, {
    multipleChoiceCards: {
      id: string;
      front: string;
      hits: number;
      misses: number;
    }[];
    flashcardCards: {
      id: string;
      front: string;
      easyCount: number;
      normalCount: number;
      hardCount: number;
    }[];
    deckId: string;
  }>();

  items.forEach(item => {
    const reviewDate = new Date(item.nextReview).toISOString().split('T')[0];
    const currentEntry = calendar.get(reviewDate);
    if (currentEntry) {
      if (item.cardType === "multipleChoice") {
        currentEntry.multipleChoiceCards.push({
          id: item.cardId,
          front: item.front,
          hits: item.hits,
          misses: item.misses
        });
      } else if (item.cardType === "flashcard") {
        const easyCount = item.ratings?.filter((r: any) => r.rating === "easy").length || 0;
        const normalCount = item.ratings?.filter((r: any) => r.rating === "normal").length || 0;
        const hardCount = item.ratings?.filter((r: any) => r.rating === "hard").length || 0;
        currentEntry.flashcardCards.push({
          id: item.cardId,
          front: item.front,
          easyCount,
          normalCount,
          hardCount
        });
      }
    } else {
      calendar.set(reviewDate, {
        multipleChoiceCards: item.cardType === "multipleChoice" ? [{
          id: item.cardId,
          front: item.front,
          hits: item.hits,
          misses: item.misses
        }] : [],
        flashcardCards: item.cardType === "flashcard" ? [{
          id: item.cardId,
          front: item.front,
          easyCount: item.ratings?.filter((r: any) => r.rating === "easy").length || 0,
          normalCount: item.ratings?.filter((r: any) => r.rating === "normal").length || 0,
          hardCount: item.ratings?.filter((r: any) => r.rating === "hard").length || 0
        }] : [],
        deckId: item.deckId
      });
    }
  });

  // Filter out dates with no reviews and sort in ascending order
  return Array.from(calendar.entries())
    .filter(([_, value]) => value.multipleChoiceCards.length > 0 || value.flashcardCards.length > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, cards]) => ({
      date,
      ...cards
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
