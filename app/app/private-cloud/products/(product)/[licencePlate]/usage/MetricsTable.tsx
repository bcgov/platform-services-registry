'use client';

import { ResourceType } from '@prisma/client';
import classNames from 'classnames';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import TableHeader from '@/components/generic/table/TableHeader';
import TruncatedTooltip from '@/components/table/TruncatedTooltip';
import { formatBinaryMetric, formatCpu, TransformedPodData, TransformedPVCData } from '@/helpers/resource-metrics';

interface MetricsSummary {
  totalUsage: number;
  totalRequest: number;
  totalLimit: number;
}

interface TableProps {
  rows: (TransformedPodData | TransformedPVCData)[];
  resource: ResourceType;
  title: string;
  totalMetrics: MetricsSummary;
}

const isPVC = (row: TransformedPodData | TransformedPVCData): row is TransformedPVCData => 'pvName' in row;

const formatMetric = (resource: ResourceType, value: number | string) => {
  switch (resource) {
    case ResourceType.cpu:
      return formatCpu(value as number);
    case ResourceType.memory:
    case ResourceType.storage:
      return formatBinaryMetric(value as number);
    default:
      return value.toString();
  }
};

export default function MetricsTable({ rows, resource, title, totalMetrics }: TableProps) {
  return (
    <>
      <div className="border-2 rounded-xl overflow-hidden">
        <TableHeader title={title} />
        <div className="divide-y divide-grey-200/5">
          {rows.map((row, index) => (
            <div key={row.name}>
              <div
                className={classNames(
                  'hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-3 sm:px-6 lg:px-8',
                  { 'bg-gray-100': index === 0 },
                )}
              >
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={row.name}>
                    <span className={classNames({ 'font-bold': index === 0 })}>
                      {_truncate(row.name, { length: 100 })}
                    </span>
                  </TruncatedTooltip>
                </div>
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={isPVC(row) ? row.pvName : row.containerName}>
                    <span className={classNames({ 'font-bold': index === 0 })}>
                      {_truncate(isPVC(row) ? row.pvName : row.containerName, { length: 100 })}
                    </span>
                  </TruncatedTooltip>
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {isPVC(row)
                    ? row.storageClassName
                    : index === 0
                      ? (row.usage as any)?.[resource]
                      : formatMetric(resource, (row.usage as any)?.[resource])}
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {isPVC(row)
                    ? index === 0
                      ? row.usage
                      : formatMetric(resource, row.usage)
                    : index === 0
                      ? (row.requests as any)?.[resource]
                      : formatMetric(resource, (row.requests as any)?.[resource])}
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {isPVC(row)
                    ? index === 0
                      ? row.limits
                      : formatMetric(resource, row.limits)
                    : index === 0
                      ? (row.limits as any)?.[resource]
                      : formatMetric(resource, (row.limits as any)?.[resource])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-2 rounded-xl max-w-2xl my-6">
        <div className="divide-y divide-grey-200/5">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 px-4 py-3 sm:px-6 lg:px-8 bg-gray-100">
            <div className="md:col-span-3 lg:col-span-3 text-center font-bold">
              Total {resource} limit: {formatMetric(resource, totalMetrics.totalLimit)}
            </div>
            <div className="md:col-span-3 lg:col-span-3 text-center font-bold">
              Total {resource} usage: {formatMetric(resource, totalMetrics.totalUsage)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
