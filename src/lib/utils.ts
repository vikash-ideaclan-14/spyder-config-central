import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | number) => {
  const parsedDate = typeof date === 'string' ? new Date(date) : new Date(Number(date));
  
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
