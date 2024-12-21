import { DataTable } from "./data-table";
import { columns } from "./columns";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { DeckHeader } from "@/src/components/decks/deck-header";

export default async function DecksPage() {
  const { getToken } = await auth();
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const decksUrl = `${protocol}://${host}/api/decks`;

  console.log('Fetching decks from:', decksUrl);

  try {
    const decksResponse = await fetch(decksUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await getToken()}`,
      },
      cache: "no-store",
    });

    if (!decksResponse.ok) {
      console.error('Error fetching decks:', {
        status: decksResponse.status,
        statusText: decksResponse.statusText,
        headers: Object.fromEntries(decksResponse.headers),
        url: decksResponse.url
      });

      // Try to read the response body for more details
      const text = await decksResponse.text();
      console.error('Response body:', text);

      throw new Error(`HTTP error! status: ${decksResponse.status}`);
    }

    const { decks } = await decksResponse.json();

    return (
      <div className="gap-5 flex flex-col px-8">
        <DeckHeader />
        <DataTable columns={columns} data={decks} />
      </div>
    );
  } catch (error) {
    console.error('Error details:', error);
    // ... error handling
  }
}
