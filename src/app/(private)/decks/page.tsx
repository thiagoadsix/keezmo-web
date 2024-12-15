import Header from "@/src/components/header";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";

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

  const usersUrl = `${protocol}://${host}/api/users`;

  const usersResponse = await fetch(usersUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId || "",
    },
    cache: "no-store",
  });

  const { user } = await usersResponse.json();
  const isOutOfCredits = true;

  return (
    <div className="gap-5 flex flex-col">
      <Header
        title="Decks"
        mobileTitle="Decks"
        credits={0}
        showRightContentOnMobile={true}
        rightContent={
          isOutOfCredits ? (
            <button
              disabled
              className="flex items-center gap-1 sm:gap-2 border text-neutral-500 border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F]"
            >
              <Plus className="h-4 w-4 text-neutral-500" />
              <p className="text-xs sm:text-sm font-medium text-neutral-500">
                Adicionar deck
              </p>
            </button>
          ) : (
            <Link href="/decks/create">
              <button className="flex items-center gap-1 sm:gap-2 border border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F] hover:border-primary group">
                <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
                <p className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
                  Adicionar deck
                </p>
              </button>
            </Link>
          )
        }
      />
      <DataTable columns={columns} data={decks} />
    </div>
  );
}
