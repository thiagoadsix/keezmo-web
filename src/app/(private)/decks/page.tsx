import { DataTable } from "./data-table";
import { columns } from "./columns";
import { auth } from "@clerk/nextjs/server";
import { DeckHeader } from "@/src/components/decks/deck-header";
import { clerkClient } from "@clerk/nextjs/server";
import { apiClient } from "@/src/lib/api-client";
import { Deck } from "@/types/deck";

export default async function DecksPage() {
  const { getToken, userId } = await auth();
  const userEmail = (await (await clerkClient()).users.getUser(userId!)).emailAddresses[0].emailAddress;

  const response = await apiClient<Deck[]>("api/decks", {
    method: "GET",
    headers: {
      "x-user-email": userEmail,
      Authorization: `Bearer ${await getToken()}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const decks = await response.json();

  return (
    <div className="gap-5 flex flex-col px-8">
      <DeckHeader />
      <DataTable columns={columns} data={decks} />
    </div>
  );
}
