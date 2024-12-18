'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <SignIn
        appearance={{
          elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border-border text-foreground hover:bg-muted',
          socialButtonsBlockButtonText: 'text-foreground',
          dividerLine: 'bg-border',
          dividerText: 'text-muted-foreground',
          formFieldLabel: 'text-foreground',
          formFieldInput: 'bg-background border-input text-foreground',
          footerActionLink: 'text-primary hover:text-primary/90',
          identityPreviewText: 'text-foreground',
          formFieldErrorText: 'text-destructive',
        },
        variables: {
          borderRadius: 'var(--radius)',
          colorBackground: 'hsl(230, 86%, 6%)',
          colorInputBackground: 'hsl(230, 86%, 6%)',
          colorInputText: 'hsl(0, 0%, 98%)',
            colorText: "hsl(0, 0%, 98%)",
          },
        }}
        signUpUrl="/sign-up"
      />
    </div>
  );
}
