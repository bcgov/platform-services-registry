'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DetailedHTMLProps, HTMLAttributes, useTransition } from 'react';
import { createQueryString } from '@/utils';

interface PaginationButtonProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  pageCount: number;
  page: number;
  pageSize?: number;
  // isPending: boolean;
  // startTransition: React.TransitionStartFunction;
}

export default function PaginationButton({ pageCount, page, pageSize, className, ...props }: PaginationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  page = Number(page);
  const isPrevDisabled = page === 1 || isPending;
  const isNextDisabled = page >= pageCount || isPending;

  const handlePaginationUpdate = (newPage: number, newPageSize?: number) => {
    startTransition(() => {
      router.replace(
        `${pathname}?${createQueryString({ page: newPage, pageSize: newPageSize ?? pageSize ?? null }, searchParams)}`,
        { scroll: false },
      );
    });
  };

  return (
    <div {...props}>
      <span>Rows per page: </span>
      <select
        id="pageSize"
        name="pageSize"
        value={String(pageSize)}
        className="rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        onChange={(e) => handlePaginationUpdate(1, Number(e.target.value))}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="200">200</option>
      </select>
      <button
        className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isPrevDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
        onClick={() => handlePaginationUpdate(page - 1)}
        disabled={isPrevDisabled}
      >
        Previous
      </button>
      <button
        className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isNextDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
        onClick={() => handlePaginationUpdate(page + 1)}
        disabled={isNextDisabled}
      >
        Next
      </button>
    </div>
  );
}
