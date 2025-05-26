'use client';

import _truncate from 'lodash-es/truncate';
import React from 'react';
import TruncatedTooltip from '@/components/table/TruncatedTooltip';
import { formatBinaryMetric, normalizeMemory } from '@/helpers/resource-metrics';
import { getUsageRate } from '@/helpers/resource-metrics';
import { Pod } from '@/types/usage';

export default function MemoryTable({ data, resourceRequest }: { data: Pod[]; resourceRequest: number }) {
  let totalRequest = 0;
  let totalUsage = 0;

  data.forEach((pod) => {
    pod.containers.forEach((container) => {
      totalRequest += Number(container.requests.memory);
      totalUsage += Number(container.usage.memory);
    });
  });

  const quota = normalizeMemory(resourceRequest + 'Gi');

  return (
    <>
      <div className="border border-gray-200 border-solid rounded p-4 bg-gray-50 my-6">
        <div>
          <strong>Memory usage:</strong>
          <span className="ml-2">{formatBinaryMetric(totalUsage)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>Memory quota:</strong>
            <span className="ml-2">{formatBinaryMetric(quota)}</span>
          </div>
          <div>
            <strong>Utilization rate:</strong>
            <span className="ml-2">{getUsageRate(totalUsage, quota)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>Memory request:</strong>
            <span className="ml-2">{formatBinaryMetric(totalRequest)}</span>
          </div>
          <div>
            <strong>Usage rate:</strong>
            <span className="ml-2">{getUsageRate(totalUsage, totalRequest)}</span>
          </div>
        </div>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="p-2 border-b text-left">Pod name</th>
            <th className="p-2 border-b text-left">Container name</th>
            <th className="p-2 border-b text-right">Resource request</th>
            <th className="p-2 border-b text-right">Resource usage</th>
            <th className="p-2 border-b text-right">Resource usage rate</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((pod, idx: number) => {
              return pod.containers.map((container, idx2: number) => {
                return (
                  <tr
                    key={`${pod.name}-${container.name}`}
                    className="even:bg-white even:dark:bg-gray-900 odd:bg-gray-50 odd:dark:bg-gray-800"
                  >
                    <td className="p-2 border-b align-top text-left">
                      <TruncatedTooltip label={pod.name}>
                        <span>{_truncate(pod.name, { length: 100 })}</span>
                      </TruncatedTooltip>
                    </td>
                    <td className="p-2 border-b align-top text-left">
                      <TruncatedTooltip label={container.name}>
                        <span>{_truncate(container.name, { length: 100 })}</span>
                      </TruncatedTooltip>
                    </td>
                    <td className="p-2 border-b align-top text-right">
                      {formatBinaryMetric(container.requests.memory)}
                    </td>
                    <td className="p-2 border-b align-top text-right">{formatBinaryMetric(container.usage.memory)}</td>
                    <td className="p-2 border-b align-top text-right">
                      {getUsageRate(container.usage.memory, container.requests.memory)}
                    </td>
                  </tr>
                );
              });
            })
          ) : (
            <tr>
              <td colSpan={6} className="p-2 border-b italic text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
