import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isFullscreenRoute(pathname: string) {
  return /^\/decks\/[^/]+\/study/.test(pathname) || pathname === '/decks/create';
}

export const isPublicRoute = (pathname: string) => {
  return pathname === '/' ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up');
};
