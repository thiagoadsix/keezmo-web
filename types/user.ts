export type CreditHistory = {
  amount: number
  source: string
  type: string
  createdAt: string
}

export type Credit = {
  plan: number
  additional: number
}

type Plan = "BASIC" | "PRO" | "PREMIUM"

export type User = {
  lastName: string
  hasAccess: boolean
  clerkId: string
  createdAt: string
  firstName: string
  credits: Credit
  imageUrl: string
  customerId: string
  email: string
  creditHistory: CreditHistory[]
  plan: Plan
}