'use client';

import _truncate from 'lodash-es/truncate';
import React from 'react';
import { totalMetrics, ResourceType } from '@/services/openshift-kubernetis-metrics/helpers';
import TableHeader from '../generic/table/TableHeader';
import TruncatedTooltip from './TruncatedTooltip';

interface TableProps {
  rows: any[];
  resource: ResourceType;
  title: string;
}

export default function TableBodyPrivateRequests({ rows, resource, title }: TableProps) {
  const { totalUsage, totalLimit } = totalMetrics(rows, resource);

  const summaryNums = [
    {
      totalLimit: `Total ${resource} limit for all pods`,
      totalUsage: `Total ${resource} usage for all pods`,
    },
    {
      totalLimit: totalLimit,
      totalUsage: totalUsage,
    },
  ];

  return (
    <>
      <div className="border-2 rounded-xl overflow-hidden">
        <TableHeader title={title} />
        <div className="divide-y divide-grey-200/5">
          {rows.map((row, index) => (
            <div key={row.name}>
              <div
                className={`hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-3 sm:px-6 lg:px-8 ${
                  index === 0 && 'bg-gray-100'
                }`}
              >
                <div className="md:col-span-2 lg:col-span-6">
                  <TruncatedTooltip label={row.name}>
                    <span className={`${index === 0 && 'font-bold'}`}>{_truncate(row.name, { length: 100 })}</span>
                  </TruncatedTooltip>
                </div>
                <div className={`md:col-span-1 lg:col-span-2 ${index === 0 && 'font-bold'}`}>{row.usage[resource]}</div>
                <div className={`md:col-span-1 lg:col-span-2 ${index === 0 && 'font-bold'}`}>
                  {row.limits[resource]}
                </div>
                <div className={`md:col-span-1 lg:col-span-2 ${index === 0 && 'font-bold'}`}>
                  {row.requests[resource]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border-2 rounded-xl max-w-2xl my-6">
        <div className="divide-y divide-grey-200/5 ">
          {summaryNums.map((row, index) => (
            <div key={row.totalLimit}>
              <div
                className={`grid grid-cols-1 md:grid-cols-6  lg:grid-cols-6 gap-4 px-4 py-3 sm:px-6 lg:px-8 ${
                  index === 0 && 'bg-gray-100'
                }`}
              >
                <div className={`md:col-span-3 lg:col-span-3 text-center ${index === 0 && 'font-bold'}`}>
                  {row.totalLimit}
                </div>
                <div className={`md:col-span-3 lg:col-span-3 text-center ${index === 0 && 'font-bold'}`}>
                  {row.totalUsage}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
