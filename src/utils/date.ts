import { format } from 'date-fns';
import { DatabaseDate } from '@/types/common';

/**
 * Safely converts a DatabaseDate (Firestore Timestamp, Date, ISO string, or number) to a JS Date.
 */
export const toDate = (date: DatabaseDate | null | undefined): Date => {
  if (!date) return new Date(0);
  
  // Check if it's a Firestore Timestamp with toDate() function
  if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate() as Date;
  }
  
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'number' || typeof date === 'string') {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Fallback for manual Timestamp object
  if (date && typeof date === 'object' && 'seconds' in date && typeof date.seconds === 'number') {
    return new Date(date.seconds * 1000);
  }
  
  return new Date(0);
};

/**
 * Safely formats a date from multiple sources (Firestore Timestamp, Date object, or ISO string).
 * Returns an empty string or 'N/A' to avoid hydration mismatches during SSR.
 */
export const formatDate = (date: DatabaseDate | null | undefined): string => {
  if (!date) return '...';
  
  try {
    const d = toDate(date);
    if (d.getTime() === 0 || isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy');
  } catch (e) {
    return 'N/A';
  }
};

export const formatDateTime = (date: DatabaseDate | null | undefined): string => {
  if (!date) return '...';
  
  try {
    const d = toDate(date);
    if (d.getTime() === 0 || isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy HH:mm');
  } catch (e) {
    return 'N/A';
  }
};
