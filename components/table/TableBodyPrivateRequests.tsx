'use client';

import path from 'path';
import { Tooltip, Badge } from '@mantine/core';
import { $Enums } from '@prisma/client';
import _truncate from 'lodash-es/truncate';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import ActiveRequestBox from '@/components/form/ActiveRequestBox';
import CopyableButton from '@/components/generic/button/CopyableButton';
import LightButton from '@/components/generic/button/LightButton';
import UserCard from '@/components/UserCard';
import { ministryKeyToName } from '@/helpers/product';
import { PrivateCloudRequestSearchedItemPayload } from '@/queries/private-cloud-requests';
import { formatDate } from '@/utils/date';
import EmptySearch from './EmptySearch';

interface TableProps {
  rows: PrivateCloudRequestSearchedItemPayload[];
  isLoading: boolean;
}

export default function TableBodyPrivateRequests({ rows, isLoading = false }: TableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const cloud = pathname.split('/')[1];

  if (isLoading) {
    return null;
  }

  if (rows.length === 0) {
    return <EmptySearch cloud="private-cloud" type="request" />;
  }

  const onRowClickHandler = (row: PrivateCloudRequestSearchedItemPayload) => {
    router.push(`/${cloud}/requests/${row.id}/decision`);
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
                    <div className="flex gap-x-2">
                      <span className="">
                        <Tooltip label={row.decisionData.description} offset={10}>
                          <span className="font-bold">{_truncate(row.decisionData.name, { length: 100 })}</span>
                        </Tooltip>
                        {!row.active && (
                          <Badge color="red" radius="sm" className="ml-1">
                            {$Enums.ProjectStatus.INACTIVE}
                          </Badge>
                        )}
                      </span>
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
                  <div className="whitespace-nowrap">{row.decisionData.cluster}</div>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  <div>
                    Created on <span>{formatDate(row.created)}</span>
                  </div>
                  <div>
                    Updated on <span>{formatDate(row.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <ActiveRequestBox data={{ ...row, cloud: 'private-cloud' }} />
              </div>

              <div className="lg:col-span-1 hidden lg:block"></div>

              <div className="md:col-span-1 lg:col-span-2">
                <UserCard user={row.decisionData.projectOwner} title="Product Owner" />
              </div>

              <div className="md:col-span-1 lg:col-span-2">
                <div className="flex flex-col space-y-4">
                  <UserCard user={row.decisionData.primaryTechnicalLead} title="Technical Lead" />
                  <UserCard user={row.decisionData.secondaryTechnicalLead} title="Technical Lead" />
                </div>
              </div>

              <div className="md:col-span-1">
                <CopyableButton>{row.licencePlate}</CopyableButton>
                {row.type !== $Enums.RequestType.CREATE && (
                  <button
                    className="mt-1 text-sm italic text-blue-500 hover:underline"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      router.push(`/private-cloud/products/${row.licencePlate}/edit`);
                    }}
                  >
                    Go to product
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
