import React from 'react';
import { formatDate } from '@/utils/js';
import { normalizeDailyCosts } from '@/utils/js/normalizeDailyCosts';

export const css = `
@page {
  size: LETTER;
  margin: 0.5cm;

  @top-left {
    content: element(header);
  }

  @top-right {
    content: "Page " counter(page) " of " counter(pages);
    font-style: italic;
  }
}

* {
  font-family: "BCSans", sans-serif;
}

.break {
  page-break-before: always;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #000;
  text-align: center;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f4f4f4;
}

.header {
  position: running(header);
  font-style: italic;
  font-size: 12px;
}

.label {
  color: #6b6b6b;
}

.strong {
  font-weight: bold;
}

.mt-0 {
  margin-top: 0;
}

.text-center {
  text-align: center;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.bar-chart {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 160px;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
  flex-wrap: nowrap;
  width: 100%;
}

.bar-column {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 8px;
  width: 20px;
}

.bar-value {
  font-size: 7px;
  margin-bottom: 2px;
  text-align: center;
  width: 100%;
}

.bar-stack {
  width: 8px;
  display: flex;
  flex-direction: column;
}

.cpu-bar {
  background-color: #6366f1;
  width: 8px;
  display: block;
  min-height: 2px;
}

.storage-bar {
  background-color: #10b981;
  width: 8px;
  display: block;
  min-height: 2px;
}

.bar-label {
  margin-top: 16px;
  transform: rotate(-45deg);
  width: 30px;
  text-align: center;
}

.legend {
  font-size: 10px;
  margin-bottom: 1rem;
}

.legend span {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 4px;
}
`;

export interface MonthlyCostItem {
  startDate: string;
  endDate: string;
  cpuCores: number;
  storageGiB: number;
  cpuCost: string;
  storageCost: string;
  totalCost: string;
}

interface Props {
  yearMonth: string;
  items: MonthlyCostItem[];
  accountCoding: string;
  currentTotal: number;
  estimatedGrandTotal: number;
  grandTotal: number;
}

export default function MonthlyCost({
  yearMonth,
  items,
  accountCoding,
  currentTotal,
  estimatedGrandTotal,
  grandTotal,
}: Props) {
  const [year, month] = yearMonth.split('-').map(Number);

  const normalizedItems = normalizeDailyCosts(items, new Date(year, month - 1, 1), new Date(year, month, 0));

  const maxCost = Math.max(...normalizedItems.map((i) => parseFloat(i.totalCost.toString())), 1);
  const maxBarHeight = 80;

  return (
    <div>
      <div className="header">Printed on {formatDate(new Date())}</div>
      <h1 className="text-center">Monthly Costs Report</h1>
      <p className="text-center font-semibold">Billing Period: {yearMonth}</p>
      <h2 className="mt-0 mb-2">Account Coding: {accountCoding}</h2>

      {currentTotal !== -1 && (
        <div className="mb-2">
          <strong>Current Total:</strong> ${currentTotal.toFixed(2)}
        </div>
      )}
      {estimatedGrandTotal !== -1 && (
        <div className="mb-2">
          <strong>Estimated Grand Total:</strong> ${estimatedGrandTotal.toFixed(2)}
        </div>
      )}
      {grandTotal !== -1 && (
        <div className="mb-2">
          <strong>Grand Total:</strong> ${grandTotal.toFixed(2)}
        </div>
      )}

      <h2 className="mt-0 mb-2">Daily Cost Breakdown</h2>

      <div className="legend">
        <span style={{ backgroundColor: '#6366f1' }}></span> CPU Cost
        <span style={{ backgroundColor: '#10b981', marginLeft: '12px' }}></span> Storage Cost
      </div>

      <div className="bar-chart">
        {normalizedItems.map((item, idx) => {
          const cpuCost = parseFloat(item.cpuCost.toString());
          const storageCost = parseFloat(item.storageCost.toString());
          const totalCost = parseFloat(item.totalCost.toString());

          const totalHeight = (totalCost / maxCost) * maxBarHeight;
          const cpuHeight = Math.max((cpuCost / totalCost) * totalHeight || 0, 2);
          const storageHeight = Math.max((storageCost / totalCost) * totalHeight || 0, 2);

          return (
            <div key={idx} className="bar-column">
              <div className="bar-value">${totalCost.toFixed(2)}</div>
              <div className="bar-stack" style={{ height: `${cpuHeight + storageHeight}px` }}>
                <div className="cpu-bar" style={{ height: `${cpuHeight}px` }}></div>
                <div className="storage-bar" style={{ height: `${storageHeight}px` }}></div>
              </div>
              <div className="bar-label">{item.date}</div>
            </div>
          );
        })}
      </div>

      <table>
        <thead>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>CPU cores</th>
            <th>Storage (GiB)</th>
            <th>CPU Cost ($)</th>
            <th>Storage Cost ($)</th>
            <th>Total Cost ($)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.startDate}</td>
              <td>{item.endDate}</td>
              <td>{item.cpuCores}</td>
              <td>{item.storageGiB}</td>
              <td>{item.cpuCost}</td>
              <td>{item.storageCost}</td>
              <td>{item.totalCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
