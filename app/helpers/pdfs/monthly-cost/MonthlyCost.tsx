import React from 'react';
import { formatCurrency, formatDate, getMonthStartEndDate } from '@/utils/js';
import { normalizeDailyCosts } from '@/utils/js/normalizeDailyCosts';
import MonthlyCostPrintBarChart from './MonthlyCostPrintBarChart';

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
  justify-content: space-between;
  align-items: flex-end;
  height: 160px;
  margin: 1rem 0;
  flex-wrap: nowrap;
  width: 100%;
  box-sizing: border-box;
}

.bar-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 8px;
  min-width: 8px;
}

.bar-value {
  font-size: 8px;
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
  const { startDate, endDate } = getMonthStartEndDate(year, month);

  const normalizedChartItems = normalizeDailyCosts(
    items.map((i) => ({
      startDate: i.startDate,
      cpuCost: parseFloat(i.cpuCost),
      storageCost: parseFloat(i.storageCost),
      totalCost: parseFloat(i.totalCost),
    })),
    startDate,
    endDate,
  );

  return (
    <div>
      <div className="header">Printed on {formatDate(new Date())}</div>
      <h1 className="text-center">Monthly Costs Report</h1>
      <p className="text-center font-semibold">Billing Period: {yearMonth}</p>
      <h2 className="mt-0 mb-2">Account Coding: {accountCoding}</h2>

      {currentTotal !== -1 && (
        <div className="mb-2">
          <strong>Current Total:</strong> {formatCurrency(currentTotal)}
        </div>
      )}
      {estimatedGrandTotal !== -1 && (
        <div className="mb-2">
          <strong>Estimated Grand Total:</strong> {formatCurrency(estimatedGrandTotal)}
        </div>
      )}
      {grandTotal !== -1 && (
        <div className="mb-2">
          <strong>Grand Total:</strong> {formatCurrency(grandTotal)}
        </div>
      )}

      <h2 className="mt-0 mb-2">Daily Cost Breakdown</h2>

      <div className="legend">
        <span style={{ backgroundColor: '#6366f1' }}></span> CPU Cost (CA$)
        <span style={{ backgroundColor: '#10b981', marginLeft: '12px' }}></span> Storage Cost (CA$)
      </div>

      <MonthlyCostPrintBarChart data={normalizedChartItems} />

      <table>
        <thead>
          <tr>
            <th>Start Date</th>
            <th>End Date</th>
            <th>CPU cores</th>
            <th>Storage (GiB)</th>
            <th>CPU Cost (CA$)</th>
            <th>Storage Cost (CA$)</th>
            <th>Total Cost (CA$)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.startDate}</td>
              <td>{item.endDate}</td>
              <td>{item.cpuCores}</td>
              <td>{item.storageGiB}</td>
              <td>{formatCurrency(parseFloat(item.cpuCost))}</td>
              <td>{formatCurrency(parseFloat(item.storageCost))}</td>
              <td>{formatCurrency(parseFloat(item.totalCost))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
