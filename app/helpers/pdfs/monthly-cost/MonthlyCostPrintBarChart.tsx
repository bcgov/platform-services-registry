import React from 'react';
import { NormalizedDailyCost } from '@/utils/js/normalizeDailyCosts';

export default function MonthlyCostPrintBarChart({ data }: { data: NormalizedDailyCost[] }) {
  const maxCost = Math.max(...data.map((i) => i.totalCost), 0.01);
  const maxBarHeight = 80; // px

  return (
    <div className="bar-chart">
      {data.map((item, idx) => {
        const totalHeight = (item.totalCost / maxCost) * maxBarHeight;

        const cpuHeight = item.totalCost > 0 ? (item.cpuCost / item.totalCost) * totalHeight : 0;

        const storageHeight = item.totalCost > 0 ? (item.storageCost / item.totalCost) * totalHeight : 0;

        return (
          <div key={idx} className="bar-column">
            <div className="bar-value">{item.totalCost}</div>
            <div className="bar-stack" style={{ height: `${totalHeight}px` }}>
              <div className="cpu-bar" style={{ height: `${cpuHeight}px` }}></div>
              <div className="storage-bar" style={{ height: `${storageHeight}px` }}></div>
            </div>
            <div className="bar-label">{item.day}</div>
          </div>
        );
      })}
    </div>
  );
}
