import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStudyRoute(pathname: string) {
  return /^\/decks\/[^/]+\/study/.test(pathname) || pathname === '/decks/create';
}
