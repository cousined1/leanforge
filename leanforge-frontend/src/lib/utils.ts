// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getDirectionColor(
  direction: string
): 'text-green-600' | 'text-red-600' | 'text-gray-600' {
  switch (direction) {
    case 'rising':
      return 'text-green-600';
    case 'falling':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

export function getDirectionIcon(direction: string): string {
  switch (direction) {
    case 'rising':
      return '↑';
    case 'falling':
      return '↓';
    default:
      return '→';
  }
}
