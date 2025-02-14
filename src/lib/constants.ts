import { Award, BarChart, RefreshCcw, Repeat } from "lucide-react"

export const difficultyConfig = {
  again: {
    label: "De novo",
    color: "text-red-500",
    bgColor: "bg-red-100",
    icon: Repeat,
  },
  easy: {
    label: "Fácil",
    color: "text-green-500",
    bgColor: "bg-green-100",
    icon: Award,
  },
  medium: {
    label: "Normal",
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
    icon: BarChart,
  },
  hard: {
    label: "Difícil",
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    icon: RefreshCcw,
  },
} as const

// Add these CSS variables to your globals.css or tailwind.config.js
export const chartColors = {
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  alert: "hsl(var(--alert))",
  destructive: "hsl(var(--destructive))",
} as const

