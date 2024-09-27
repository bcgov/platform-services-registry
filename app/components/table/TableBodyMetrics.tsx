'use client';

import classNames from 'classnames';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import { getTotalMetrics, ResourceType, Pod } from '@/services/openshift-kubernetis-metrics/helpers';
import TableHeader from '../generic/table/TableHeader';
import TruncatedTooltip from './TruncatedTooltip';

interface TableProps {
  pods: Pod[];
  resource: ResourceType;
  title: string;
  measurementUnit: string;
}

type TransformedData = {
  podName: string;
  containerName: string;
  usage: {
    cpu: number;
    memory: number;
  };
  limits: {
    cpu: number;
    memory: number;
  };
  requests: {
    cpu: number;
    memory: number;
  };
};

const transformPodData = (data: Pod[]) => {
  const transformedData: TransformedData[] = [];
  data.forEach((pod) => {
    pod.containers.forEach((container) => {
      transformedData.push({
        podName: pod.podName,
        containerName: container.name,
        usage: {
          cpu: container.usage.cpu,
          memory: container.usage.memory,
        },
        limits: {
          cpu: container.limits.cpu,
          memory: container.limits.memory,
        },
        requests: {
          cpu: container.requests.cpu,
          memory: container.requests.memory,
        },
      });
    });
  });

  return transformedData;
};

export default function TableBodyMetrics({ pods, resource, title, measurementUnit }: TableProps) {
  const rows = [
    {
      podName: 'Pod Name',
      containerName: 'Container Name',
      usage: { cpu: 'CPU Usage', memory: 'Memory Usage' },
      limits: { cpu: 'CPU Limits', memory: 'Memory Limits' },
      requests: { cpu: 'CPU Requests', memory: 'Memory Requests' },
    },
    ...transformPodData(pods),
  ];
  const { totalUsage, totalLimit } = getTotalMetrics(pods, resource);

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
            <div key={row.podName}>
              <div
                className={classNames(
                  'hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 px-4 py-3 sm:px-6 lg:px-8',
                  {
                    'bg-gray-100': index === 0,
                  },
                )}
              >
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={row.podName}>
                    <span className={`${index === 0 && 'font-bold'}`}>{_truncate(row.podName, { length: 100 })}</span>
                  </TruncatedTooltip>
                </div>
                <div className="md:col-span-1 lg:col-span-3">
                  <TruncatedTooltip label={row.containerName}>
                    <span className={classNames({ 'font-bold': index === 0 })}>
                      {_truncate(row.containerName, { length: 100 })}
                    </span>
                  </TruncatedTooltip>
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {row.usage[resource]}
                  {index !== 0 && measurementUnit}
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {row.limits[resource]}
                  {index !== 0 && measurementUnit}
                </div>
                <div className={classNames('md:col-span-1 lg:col-span-2', { 'font-bold': index === 0 })}>
                  {row.requests[resource]}
                  {index !== 0 && measurementUnit}
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
                <div className={classNames('md:col-span-3 lg:col-span-3 text-center', { 'font-bold': index === 0 })}>
                  {row.totalLimit}
                  {index !== 0 && measurementUnit}
                </div>
                <div className={classNames('md:col-span-3 lg:col-span-3 text-center', { 'font-bold': index === 0 })}>
                  {row.totalUsage}
                  {index !== 0 && measurementUnit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
