import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiUrl(path: string): string {
  // Using the API URL directly from the types file
  const baseUrl = 'https://care-insight-api-9ed25d3ea3ea.herokuapp.com';
  return `${baseUrl}${path}`;
}
