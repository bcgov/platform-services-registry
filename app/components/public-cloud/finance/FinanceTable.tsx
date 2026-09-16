import type { ReactNode, TableHTMLAttributes } from 'react';
import { cn } from '@/utils/js';

export const financeTableRowClassName = 'even:bg-gray-50 hover:bg-gray-100';

export default function FinanceTable({
  children,
  caption,
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { caption?: string; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className={cn('min-w-full text-sm', className)} {...props}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}
