import Header from "@/src/components/header";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";
import { headers } from 'next/headers';
import { auth } from "@clerk/nextjs/server";

export default async function DecksPage() {
  const { userId } = await auth();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${host}/api/decks`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId || ''
    },
    cache: 'no-store'
  });

  const { decks } = await response.json();

  return (
    <div className="gap-5 flex flex-col">
      <Header
        title="Decks"
        mobileTitle="Decks"
        showRightContentOnMobile={true}
        rightContent={
          <Link href="/decks/create">
            <button className="flex items-center gap-1 sm:gap-2 border border-neutral-400 rounded-3xl p-2 sm:p-3 bg-[#10111F] hover:border-primary group">
              <Plus className="h-4 w-4 text-neutral-200 group-hover:text-primary" />
              <p className="text-xs sm:text-sm font-medium text-neutral-200 group-hover:text-primary">
                Adicionar deck
              </p>
            </button>
          </Link>
        }
      />

      <DataTable columns={columns} data={decks} />
    </div>
  );
}
