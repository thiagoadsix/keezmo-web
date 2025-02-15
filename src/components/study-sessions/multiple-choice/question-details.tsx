import { CheckCircle2, XCircle, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Progress } from "@/src/components/ui/progress"

import { QuestionCard } from "./question-card"

interface QuestionDetailsProps {
  questions: Array<{
    id: string
    question: string
    correctAnswer: string
  }>
  incorrectAnswers: Set<string>
  questionsMetadata: Map<string, { attempts: number; errors: number; consecutiveHits: number; interval: number }>
}

export function QuestionDetails({ questions, incorrectAnswers, questionsMetadata }: QuestionDetailsProps) {
  const correctQuestions = questions.filter((q) => !incorrectAnswers.has(q.id))
  const wrongQuestions = questions.filter((q) => incorrectAnswers.has(q.id))

  const accuracy = (correctQuestions.length / questions.length) * 100

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Desempenho</h3>
            <div className="text-sm text-muted-foreground">
              {correctQuestions.length} de {questions.length} questões corretas
            </div>
          </div>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Precisão</span>
              <span className="font-medium">{Math.round(accuracy)}%</span>
            </div>
            <Progress value={accuracy} className="h-2" />
          </div>

          <Tabs defaultValue={incorrectAnswers.size > 0 ? "review" : "correct"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="review" disabled={incorrectAnswers.size === 0} className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Revisar ({wrongQuestions.length})</span>
              </TabsTrigger>
              <TabsTrigger value="correct" disabled={correctQuestions.length === 0} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Corretas ({correctQuestions.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {wrongQuestions.map((question, index) => {
                    const metadata = questionsMetadata.get(question.id)
                    return (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        metadata={metadata}
                        index={index + 1}
                        type="error"
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="correct" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {correctQuestions.map((question, index) => {
                    const metadata = questionsMetadata.get(question.id)
                    return (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        metadata={metadata}
                        index={index + 1}
                        type="success"
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
