import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { useParams } from "next/navigation";

export default function StudyModeSelectionPage() {
  const { deckId } = useParams();

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto mt-8">
      <h1 className="text-3xl font-bold">Select Study Mode</h1>
      <div className="flex flex-col gap-4">
        <Link href={`/decks/${deckId}/study-mode/multiple-choice`}>
          <Button variant="outline" className="w-full">
            Multiplas escolhas
          </Button>
        </Link>
        <Link href={`/decks/${deckId}/study-mode/flashcard`}>
          <Button variant="outline" className="w-full">
            Flashcard
          </Button>
        </Link>
      </div>
    </div>
  );
}