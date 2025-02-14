"use client"

import Link from "next/link"
import { Clock, Trophy } from "lucide-react"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { cn } from "@/src/lib/utils"

interface StudyModeStats {
  completionRate: number
  averageTime: string
  totalAttempts: number
}

interface StudyModeCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  stats: StudyModeStats
  recommended?: boolean
}

export function StudyModeClient(props: StudyModeCardProps) {
  const { href, icon, title, description, stats, recommended } = props
  console.log({ href, icon, title, description, stats, recommended })

  return (
    <Link href={href}>
      <Card
        className={cn(
          "group relative h-full overflow-hidden transition-all duration-300 hover:shadow-lg",
          "hover:-translate-y-1 active:translate-y-0",
          recommended && "border-primary/50 shadow-md",
        )}
      >
        {recommended && (
          <div className="absolute right-4 top-4">
            <Badge variant="default" className="shadow-sm">
              Recomendado
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "rounded-lg p-2.5 transition-colors",
                "bg-primary/5 text-primary group-hover:bg-primary/10",
              )}
            >
              {icon}
            </div>
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground/70" />
                <span className="text-sm text-muted-foreground">{stats.averageTime}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              <Progress
                value={stats.completionRate}
                className={cn("h-2 transition-all", "group-hover:[&>div]:bg-primary")}
              />
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary/70" />
              <span className="text-sm text-muted-foreground">{stats.totalAttempts.toLocaleString()} tentativas</span>
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={cn(
            "border-t p-0 transition-colors",
            "bg-gradient-to-b from-muted/30 to-muted/60",
            "group-hover:from-muted/50 group-hover:to-muted/80",
          )}
        >
          <div className="flex w-full items-center justify-between relative overflow-hidden transition-all duration-300">
            <div
              className={cn(
                "absolute inset-0 opacity-0",
                "bg-gradient-to-r from-primary/5 to-primary/10",
                "transition-opacity duration-300",
                "group-hover:opacity-100",
              )}
            />
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
