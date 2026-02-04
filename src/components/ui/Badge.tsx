import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusColor } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border',
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'bg-slate-100 text-slate-700 border-slate-200': variant === 'default',
            'bg-emerald-100 text-emerald-700 border-emerald-200': variant === 'success',
            'bg-amber-100 text-amber-700 border-amber-200': variant === 'warning',
            'bg-red-100 text-red-700 border-red-200': variant === 'error',
            'bg-blue-100 text-blue-700 border-blue-200': variant === 'info',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
}

export const StatusBadge = ({ status, className, ...props }: StatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pending: { label: 'Pending', variant: 'warning' },
    quoted: { label: 'Quoted', variant: 'info' },
    sent: { label: 'Sent', variant: 'info' },
    accepted: { label: 'Accepted', variant: 'success' },
    declined: { label: 'Declined', variant: 'error' },
    draft: { label: 'Draft', variant: 'default' },
  };

  const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'default' };

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};