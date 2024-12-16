import { DataTable } from "./data-table";
import { columns } from "./columns";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { DeckHeader } from "@/src/components/decks/deck-header";

export default async function DecksPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const decksUrl = `${protocol}://${host}/api/decks`;

  const decksResponse = await fetch(decksUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId || "",
    },
    cache: "no-store",
  });

  const { decks } = await decksResponse.json();

  return (
    <div className="gap-5 flex flex-col px-8 py-4">
      <DeckHeader />
      <DataTable columns={columns} data={decks} />
    </div>
  );
}
