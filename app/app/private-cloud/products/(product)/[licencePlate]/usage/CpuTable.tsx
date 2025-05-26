'use client';

import _truncate from 'lodash-es/truncate';
import React from 'react';
import TruncatedTooltip from '@/components/table/TruncatedTooltip';
import { formatCpu } from '@/helpers/resource-metrics';
import { getUsageRate } from '@/helpers/resource-metrics';
import { Pod } from '@/types/usage';

export default function CpuTable({ data, resourceRequest }: { data: Pod[]; resourceRequest: number }) {
  let totalRequest = 0;
  let totalUsage = 0;

  data.forEach((pod) => {
    pod.containers.forEach((container) => {
      totalRequest += Number(container.requests.cpu);
      totalUsage += Number(container.usage.cpu);
    });
  });

  const quota = resourceRequest * 1000;

  return (
    <>
      <div className="border border-gray-200 border-solid rounded p-4 bg-gray-50 my-6">
        <div>
          <strong>CPU usage:</strong>
          <span className="ml-2">{formatCpu(totalUsage)}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>CPU quota:</strong>
            <span className="ml-2">{formatCpu(quota)}</span>
          </div>
          <div>
            <strong>Utilization rate:</strong>
            <span className="ml-2">{getUsageRate(totalUsage, quota)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <strong>CPU request:</strong>
            <span className="ml-2">{formatCpu(totalRequest)}</span>
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
                    <td className="p-2 border-b align-top text-right">{formatCpu(container.requests.cpu)}</td>
                    <td className="p-2 border-b align-top text-right">{formatCpu(container.usage.cpu)}</td>
                    <td className="p-2 border-b align-top text-right">
                      {getUsageRate(container.usage.cpu, container.requests.cpu)}
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
