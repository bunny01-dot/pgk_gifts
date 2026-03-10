import { format } from 'date-fns';

export const formatDate = (date: any): string => {
  if (!date) return 'N/A';
  // Handle Firestore Timestamp
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: any): string => {
  if (!date) return 'N/A';
  const d = date.toDate ? date.toDate() : new Date(date);
  return format(d, 'MMM dd, yyyy HH:mm');
};
