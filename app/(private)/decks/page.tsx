import Header from "@/app/components/header";
import { Button } from "@/app/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import Link from "next/link";

export default function DecksPage() {
  const data = [
    {
      id: "1",
      title: "Deck 1",
      description: "Descrição do deck 1",
      totalCards: 10,
      createdAt: "2021-01-01",
    },
    {
      id: "2",
      title: "Deck 2",
      description: "Descrição do deck 2",
      totalCards: 20,
      createdAt: "2021-01-02",
    },
    {
      id: "3",
      title: "Deck 3",
      description: "Descrição do deck 3",
      totalCards: 30,
      createdAt: "2021-01-03",
    },
    {
      id: "4",
      title: "Deck 4",
      description: "Descrição do deck 4",
      totalCards: 40,
      createdAt: "2021-01-04",
    },
    {
      id: "5",
      title: "Deck 5",
      description: "Descrição do deck 5",
      totalCards: 50,
      createdAt: "2021-01-05",
    },
  ];

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

      <DataTable columns={columns} data={data} />
    </div>
  );
}
