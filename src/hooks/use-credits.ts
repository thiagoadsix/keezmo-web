'use client'

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { apiClient } from "@/src/lib/api-client"

export function useCredits() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return

      try {
        const response = await apiClient('/api/users/me', {
          headers: {
            'x-user-email': user.emailAddresses[0].emailAddress
          }
        })

        setCredits(response.user.credits)
      } catch (err) {
        console.error('Error fetching credits:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch credits'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCredits()
  }, [user])

  return { credits, isLoading, error }
}