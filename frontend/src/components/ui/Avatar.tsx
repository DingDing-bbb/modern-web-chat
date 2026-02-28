import { HTMLAttributes } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
  fallback?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export default function Avatar({
  src,
  alt,
  size = 'md',
  status,
  fallback,
  className,
  ...props
}: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold flex items-center justify-center',
          sizes[size],
        )}
      >
        {src ? (
          <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
        ) : fallback ? (
          <span>{getInitials(fallback)}</span>
        ) : (
          <User size={size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 32} />
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}
