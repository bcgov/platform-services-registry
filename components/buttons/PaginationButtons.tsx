'use client';

import { useTransition, DetailedHTMLProps, HTMLAttributes } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import createQueryString from '@/components/utils/createQueryString';

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
  const isPrevDisabled = Number(page) === 1 || isPending;
  const isNextDisabled = Number(page) >= pageCount || isPending;

  return (
    <div {...props}>
      <button
        className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isPrevDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
        onClick={() => {
          startTransition(() => {
            router.replace(
              `${pathname}?${createQueryString(
                {
                  page: Number(page) - 1,
                  pageSize: pageSize ?? null,
                },
                searchParams,
              )}`,
              {
                scroll: false,
              },
            );
          });
        }}
        disabled={isPrevDisabled}
      >
        Previous
      </button>
      <button
        className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300
        ${isNextDisabled ? 'text-gray-500 border-gray-500' : 'text-black border-black'}`}
        onClick={() => {
          startTransition(() => {
            router.replace(
              `${pathname}?${createQueryString(
                {
                  page: Number(page) + 1,
                  pageSize: pageSize ?? null,
                },
                searchParams,
              )}`,
              {
                scroll: false,
              },
            );
          });
        }}
        disabled={isNextDisabled}
      >
        Next
      </button>
    </div>
  );
}
