'use client';

import { ResourceType } from '@prisma/client';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import TableHeader from '@/components/generic/table/TableHeader';
import TruncatedTooltip from '@/components/table/TruncatedTooltip';
import { formatBinaryMetric, formatCpu, TransformedPodData, TransformedPVCData } from '@/helpers/resource-metrics';
import { cn } from '@/utils';
import { capitalizeFirstLetter } from '@/utils/string';

interface MetricsSummary {
  totalUsage: number;
  totalRequest: number;
  totalLimit: number;
}

interface TableProps {
  rows: (TransformedPodData | TransformedPVCData)[];
  resource: ResourceType;
  totalMetrics: MetricsSummary;
}

const isPVC = (row: TransformedPodData | TransformedPVCData): row is TransformedPVCData => 'pvName' in row;

const formatMetric = (resource: ResourceType, value: number | string): string => {
  if (resource === ResourceType.cpu) return formatCpu(Number(value));
  return formatBinaryMetric(Number(value));
};

const getPodMetricValue = (
  row: TransformedPodData,
  resource: ResourceType,
  key: 'usage' | 'requests' | 'limits',
): string | number => {
  const metrics = row[key];
  if (resource === ResourceType.cpu || resource === ResourceType.memory) {
    return metrics[resource] ?? '-';
  }
  return '-';
};

const getPVCMetricValue = (row: TransformedPVCData, key: 'usage' | 'limits'): string | number => row[key] ?? '-';

export default function MetricsTable({ rows, resource, totalMetrics }: TableProps) {
  return (
    <>
      <div className="border-2 rounded-xl overflow-hidden">
        <TableHeader
          title={`${resource === ResourceType.cpu ? resource.toUpperCase() : capitalizeFirstLetter(resource)} metrics`}
        />
        <div className="divide-y divide-grey-200/5">
          {rows.map((row, index) => {
            const isPvcRow = isPVC(row);
            return (
              <div
                key={row.name}
                className={cn(
                  'hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-3 sm:px-6 lg:px-8',
                  { 'bg-gray-100': index === 0 },
                )}
              >
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={row.name}>
                    <span className={cn({ 'font-bold': index === 0 })}>{_truncate(row.name, { length: 100 })}</span>
                  </TruncatedTooltip>
                </div>
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={isPvcRow ? row.pvName : row.containerName}>
                    <span className={cn({ 'font-bold': index === 0 })}>
                      {_truncate(isPvcRow ? row.pvName : row.containerName, { length: 100 })}
                    </span>
                  </TruncatedTooltip>
                </div>
                {isPvcRow ? (
                  <>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0 ? row.storageClassName : row.storageClassName}
                    </div>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0
                        ? getPVCMetricValue(row, 'usage')
                        : formatMetric(resource, getPVCMetricValue(row, 'usage'))}
                    </div>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0
                        ? getPVCMetricValue(row, 'limits')
                        : formatMetric(resource, getPVCMetricValue(row, 'limits'))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0
                        ? getPodMetricValue(row, resource, 'usage')
                        : formatMetric(resource, getPodMetricValue(row, resource, 'usage'))}
                    </div>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0
                        ? getPodMetricValue(row, resource, 'requests')
                        : formatMetric(resource, getPodMetricValue(row, resource, 'requests'))}
                    </div>
                    <div className={cn('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                      {index === 0
                        ? getPodMetricValue(row, resource, 'limits')
                        : formatMetric(resource, getPodMetricValue(row, resource, 'limits'))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-2 rounded-xl max-w-2xl my-6">
        <div className="divide-y divide-grey-200/5">
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 px-4 py-3 sm:px-6 lg:px-8 bg-gray-100">
            <div className="md:col-span-3 lg:col-span-3 text-center font-bold">Total {resource} limit:</div>
            <div className="md:col-span-3 lg:col-span-3 text-center font-bold">Total {resource} usage:</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 px-4 py-3 sm:px-6 lg:px-8 ">
            <div className={cn('md:col-span-3 lg:col-span-3 text-center')}>
              {formatMetric(resource, totalMetrics.totalLimit)}
            </div>
            <div className={cn('md:col-span-3 lg:col-span-3 text-center')}>
              {formatMetric(resource, totalMetrics.totalUsage)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
