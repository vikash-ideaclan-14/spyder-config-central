import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string | number) => {
  // If it's a string, try to parse it as a number first
  const timestamp = typeof date === 'string' ? parseInt(date) : date;
  
  // Create date from timestamp (multiply by 1000 for milliseconds)
  const parsedDate = new Date(timestamp);
  
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
