'use client';

import { Tooltip, Badge } from '@mantine/core';
import _truncate from 'lodash-es/truncate';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import PublicCloudActiveRequestBox from '@/components/form/PublicCloudActiveRequestBox';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { ministryKeyToName } from '@/helpers/product';
import { PublicCloudRequestSimpleDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import RequestStatusProgress from '../RequestStatusProgress';
import EmptySearch from './EmptySearch';
import TruncatedTooltip from './TruncatedTooltip';

interface TableProps {
  rows: PublicCloudRequestSimpleDecorated[];
  isLoading: boolean;
}

export default function TableBodyPublicProducts({ rows, isLoading = false }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cloud = pathname.split('/')[1];

  if (isLoading) {
    return null;
  }

  if (rows.length === 0) {
    return <EmptySearch cloud="public-cloud" type="request" />;
  }

  const onRowClickHandler = (row: PublicCloudRequestSimpleDecorated) => {
    router.push(`/${cloud}/requests/${row.id}/request`);
  };

  return (
    <div className="divide-y divide-grey-200/5">
      {rows.map((row, index) => {
        return (
          <div key={row.id}>
            <div
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' && onRowClickHandler(row)}
              role="button" // Assign an appropriate role
              onClick={() => onRowClickHandler(row)}
              className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-3 sm:px-6 lg:px-8"
            >
              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-x-3">
                  <h2 className="min-w-0 text-base text-gray-700">
                    <div className="">
                      <TruncatedTooltip label={row.decisionData.description}>
                        <span className="font-bold">{_truncate(row.decisionData.name, { length: 100 })}</span>
                      </TruncatedTooltip>
                      {!row.active && (
                        <Badge color="red" radius="sm" className="ml-1 mt-1">
                          CLOSED
                        </Badge>
                      )}
                    </div>
                  </h2>
                </div>
                <div className="mt-1 flex items-center gap-x-2.5 text-sm leading-5 text-gray-700">
                  <div className="whitespace-nowrap">
                    <Tooltip label={ministryKeyToName(row.decisionData.ministry)} offset={10}>
                      <span>Ministry {row.decisionData.ministry}</span>
                    </Tooltip>
                  </div>
                  <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-400">
                    <circle cx={1} cy={1} r={1} />
                  </svg>
                  <div className="whitespace-nowrap">{row.decisionData.provider}</div>
                </div>
                <div className="mt-1">
                  <CopyableButton className="mr-2">{row.licencePlate}</CopyableButton>
                  {row._permissions.viewProduct && (
                    <button
                      className="mt-1 text-sm italic text-blue-500 hover:underline"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        router.push(`/public-cloud/products/${row.licencePlate}/edit`);
                      }}
                    >
                      Go to product
                    </button>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  <div>
                    Updated on <span>{formatDate(row.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <PublicCloudActiveRequestBox request={row} />
              </div>

              <div className="md:col-span-1 lg:col-span-6">
                <RequestStatusProgress request={row} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
