import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/src/components/ui/card"
import { StudySession } from "./columns"
import { format } from "date-fns"

type StudySessionCardProps = {
  studySession: StudySession
}

export function StudySessionCard({ studySession }: StudySessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{studySession.deck.title}</CardTitle>
        <CardDescription>{format(new Date(studySession.createdAt), "dd/MM/yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Tipo: {studySession.studyType === "multipleChoice" ? "Múltipla escolha" : "Flashcard"}</p>
        <p>Total de questões: {studySession.totalQuestions}</p>
        {studySession.studyType === "multipleChoice" && (
          <>
            <p>Acertos: {studySession.hits}</p>
            <p>Erros: {studySession.misses}</p>
          </>
        )}
        {studySession.studyType === "flashcard" && (
          <>
            <p>Fácil: {studySession.ratings?.filter(r => r.rating === "easy").length}</p>
            <p>Médio: {studySession.ratings?.filter(r => r.rating === "normal").length}</p>
            <p>Difícil: {studySession.ratings?.filter(r => r.rating === "hard").length}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}