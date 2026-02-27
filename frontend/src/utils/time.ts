import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(date: string | Date): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;

  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  }

  if (isYesterday(messageDate)) {
    return 'Yesterday ' + format(messageDate, 'HH:mm');
  }

  return format(messageDate, 'dd/MM/yyyy HH:mm');
}

export function formatRelativeTime(date: string | Date): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(messageDate, { addSuffix: true });
}

export function formatLastSeen(date: string | Date): string {
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  return formatRelativeTime(messageDate);
}
