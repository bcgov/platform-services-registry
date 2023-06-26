"use client";

import { useTransition, DetailedHTMLProps, HTMLAttributes } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import createQueryString from "@/components/utils/createQueryString";

interface PaginationButtonProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  pageCount: number;
  page: string;
  pageSize?: string;
  // isPending: boolean;
  // startTransition: React.TransitionStartFunction;
}

export default function PaginationButton({
  pageCount,
  page,
  pageSize,
  // isPending,
  // startTransition,
  className,
  ...props
}: PaginationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <div {...props}>
      <button
        className="relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString(
                {
                  page: Number(page) - 1,
                  pageSize: pageSize ?? null,
                  // sort,
                },
                searchParams
              )}`
            );
          });
        }}
        disabled={Number(page) === 1 || isPending}
      >
        <span className="sr-only">Previous page</span>
      </button>
      <button
        className="relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300"
        onClick={() => {
          startTransition(() => {
            router.push(
              `${pathname}?${createQueryString(
                {
                  page: Number(page) + 1,
                  pageSize: pageSize ?? null,
                  // sort,
                },
                searchParams
              )}`
            );
          });
        }}
        disabled={Number(page) === (pageCount ?? 10) || isPending}
      >
        <span className="sr-only">Next page</span>
      </button>
    </div>
  );
}
