'use client';

import { Tooltip, Badge } from '@mantine/core';
import _truncate from 'lodash-es/truncate';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import PublicCloudActiveRequestBox from '@/components/form/PublicCloudActiveRequestBox';
import CopyableButton from '@/components/generic/button/CopyableButton';
import UserCard from '@/components/UserCard';
import { ministryKeyToName } from '@/helpers/product';
import { ProjectStatus } from '@/prisma/client';
import { PublicCloudProductSimpleDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import EmptySearch from './EmptySearch';
import TruncatedTooltip from './TruncatedTooltip';

interface TableProps {
  rows: PublicCloudProductSimpleDecorated[];
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
    return <EmptySearch cloud="public-cloud" type="product" />;
  }

  const onRowClickHandler = (row: any) => {
    router.push(`/${cloud}/products/${row.licencePlate}/edit`);
  };

  return (
    <div className="divide-y divide-grey-200/5">
      {rows.map((row, index) => (
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
                    <TruncatedTooltip label={row.description}>
                      <span className="font-bold">{_truncate(row.name, { length: 100 })}</span>
                    </TruncatedTooltip>
                    {row.status === ProjectStatus.INACTIVE && (
                      <Badge color="red" radius="sm" className="ml-1 mt-1">
                        DELETED
                      </Badge>
                    )}
                  </div>
                </h2>
              </div>
              <div className="mt-1 flex items-center gap-x-2.5 text-sm leading-5 text-gray-700">
                <div className="whitespace-nowrap">
                  <Tooltip label={ministryKeyToName(row.ministry)} offset={10}>
                    <span>Ministry {row.ministry}</span>
                  </Tooltip>
                </div>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 flex-none fill-gray-400">
                  <circle cx={1} cy={1} r={1} />
                </svg>
                <div className="whitespace-nowrap">{row.provider}</div>
              </div>
              <div className="mt-1 text-sm text-gray-400">
                <div>
                  Created on <span>{formatDate(row.createdAt)}</span>
                </div>
                <div>
                  Updated on <span>{formatDate(row.updatedAt)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              {row.activeRequest && (
                <PublicCloudActiveRequestBox request={{ ...row.activeRequest, licencePlate: row.licencePlate }} />
              )}
            </div>

            <div className="lg:col-span-1 hidden lg:block"></div>

            <div className="md:col-span-1 lg:col-span-2">
              <UserCard user={row.projectOwner} title="Product Owner" />
            </div>

            <div className="md:col-span-1 lg:col-span-2">
              <div className="flex flex-col space-y-4">
                <UserCard user={row.primaryTechnicalLead} title="Technical Lead" />
                <UserCard user={row.secondaryTechnicalLead} title="Technical Lead" />
              </div>
            </div>

            <div className="md:col-span-1">
              <CopyableButton>{row.licencePlate}</CopyableButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
