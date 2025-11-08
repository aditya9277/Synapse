import { format, isValid } from 'date-fns';

/**
 * Safely formats a date string or Date object
 * @param date - The date to format (string, Date, or null/undefined)
 * @param formatString - The format string (default: "MMM d, yyyy")
 * @param fallback - Fallback text when date is invalid (default: "Date unknown")
 * @returns Formatted date string or fallback
 */
export const safeFormatDate = (
  date: string | Date | null | undefined,
  formatString: string = "MMM d, yyyy",
  fallback: string = "Date unknown"
): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!isValid(dateObj)) {
      return fallback;
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

/**
 * Formats a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - The date to format
 * @param fallback - Fallback text when date is invalid
 * @returns Relative time string or fallback
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined,
  fallback: string = "Unknown time"
): string => {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!isValid(dateObj)) {
      return fallback;
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    
    // For older dates, show formatted date
    return format(dateObj, "MMM d, yyyy");
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return fallback;
  }
};

/**
 * Checks if a date is valid
 * @param date - The date to validate
 * @returns True if date is valid, false otherwise
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
};