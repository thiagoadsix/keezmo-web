'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { apiClient } from '@/src/lib/api-client';
import { isPublicRoute } from '@/src/lib/utils';
import { User } from '@/types/user';

export function AccessCheck({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    const publicRoute = isPublicRoute(pathname);
    if (publicRoute) {
      setHasAccess(true);
      setOpen(false);
      return;
    }

    const checkAccess = async () => {
      if (!user) return;

      try {
        const response = await apiClient<User>('api/users/me', {
          headers: {
            'x-user-email': user.emailAddresses[0].emailAddress,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const data = await response.json()

        setHasAccess(data.hasAccess);
        if (!data.hasAccess) {
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
      }
    };

    checkAccess();
  }, [pathname, user]);

  const handleReactivate = async () => {
    try {
      const response = await apiClient('api/stripe/create-portal', {
        method: 'POST',
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
        headers: {
          'x-user-email': user?.emailAddresses[0].emailAddress || '',
        },
      });

      window.location.href = response.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (!hasAccess) {
    return (
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acesso Restrito</DialogTitle>
            <DialogDescription>
              Seu acesso à plataforma está restrito. Por favor, reative sua assinatura para continuar usando o Keezmo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleReactivate}>Reativar Assinatura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return <>{children}</>;
}
