'use client'

import { useState } from 'react'

import { Loader2 } from 'lucide-react'
import { Button } from './ui/button'

interface ButtonCheckoutProps {
  priceId: string
  mode?: 'payment' | 'subscription'
  children?: React.ReactNode
}

export function ButtonCheckout({
  priceId,
  mode = 'payment',
  children
}: ButtonCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
          mode,
        }),
      })

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || 'Upgrade Now'
      )}
    </Button>
  )
}
