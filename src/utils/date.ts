import { format } from 'date-fns';

/**
 * Safely formats a date from multiple sources (Firestore Timestamp, Date object, or ISO string).
 * Returns an empty string or 'N/A' to avoid hydration mismatches during SSR.
 */
export const formatDate = (date: any): string => {
  if (!date) return '...';
  
  try {
    let d: Date;
    if (date.toDate && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else if (typeof date === 'number' || typeof date === 'string') {
      d = new Date(date);
    } else if (date?.seconds) {
      // Manual timestamp handling if toDate is missing
      d = new Date(date.seconds * 1000);
    } else {
      return 'N/A';
    }

    if (isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy');
  } catch (e) {
    return 'N/A';
  }
};

export const formatDateTime = (date: any): string => {
  if (!date) return '...';
  
  try {
    let d: Date;
    if (date.toDate && typeof date.toDate === 'function') {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) return 'N/A';
    return format(d, 'MMM dd, yyyy HH:mm');
  } catch (e) {
    return 'N/A';
  }
};
