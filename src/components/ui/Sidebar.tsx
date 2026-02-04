import React from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn(
        'w-64 h-screen bg-slate-900 border-r border-slate-800',
        'flex flex-col fixed left-0 top-0 z-40',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
);

Sidebar.displayName = 'Sidebar';

export const SidebarHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-4 py-6 border-b border-slate-800', className)} {...props}>
    {children}
  </div>
);

export const SidebarContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto py-4', className)} {...props}>
    {children}
  </div>
);

export const SidebarFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-4 py-4 border-t border-slate-800', className)} {...props}>
    {children}
  </div>
);

interface SidebarItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href?: string;
  active?: boolean;
  icon?: React.ReactNode;
}

export const SidebarItem = React.forwardRef<HTMLAnchorElement, SidebarItemProps>(
  ({ className, href = '#', active, icon, children, ...props }, ref) => (
    <a
      ref={ref}
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors',
        active 
          ? 'bg-indigo-500/10 text-indigo-400' 
          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
        className
      )}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </a>
  )
);

SidebarItem.displayName = 'SidebarItem';

interface SidebarSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
}

export const SidebarSection = ({ title, children, className, ...props }: SidebarSectionProps) => (
  <div className={cn('mb-6', className)} {...props}>
    {title && (
      <h4 className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        {title}
      </h4>
    )}
    <div className="space-y-0.5">{children}</div>
  </div>
);