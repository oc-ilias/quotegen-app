import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table ref={ref} className={cn('w-full text-left', className)} {...props}>
        {children}
      </table>
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-slate-800/50', className)} {...props}>{children}</thead>
);

export const TableBody = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-slate-700', className)} {...props}>{children}</tbody>
);

export const TableRow = ({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr 
    className={cn('hover:bg-slate-800/30 transition-colors', className)} 
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th 
    className={cn('px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider', className)} 
    {...props}
  >
    {children}
  </th>
);

export const TableCell = ({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td 
    className={cn('px-4 py-3 text-sm text-slate-300', className)} 
    {...props}
  >
    {children}
  </td>
);