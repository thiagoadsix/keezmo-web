import Header from "@/src/components/header";
import { columns, StudySession } from "./columns";
import { DataTable } from "./data-table";

export default function StudySessionsPage() {
  const data: StudySession[] = [
    {
      id: "1",
      deck: {
        id: "1",
        title: "Deck 1",
        description: "Description 1",
        totalCards: 10,
        createdAt: "2021-01-01",
      },
      deckId: "1",
      hits: 10,
      misses: 0,
      createdAt: "2021-01-01",
    },
  ];

  return (
    <div>
      <Header title="Sessões de estudo" mobileTitle="Sessões de estudo" />

      <DataTable columns={columns} data={data} />
    </div>
  );
}
