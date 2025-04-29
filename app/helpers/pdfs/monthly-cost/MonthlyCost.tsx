import React from 'react';
import { formatDate } from '@/utils/js';

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
}

export default function MonthlyCost({ yearMonth, items, accountCoding }: Props) {
  return (
    <div>
      <div className="header">Printed on {formatDate(new Date())}</div>
      <h1 className="text-center">Monthly Costs Report</h1>
      <p className="text-center font-semibold">Billing Period: {yearMonth}</p>
      <h2 className="mt-0 mb-2">Account Coding: {accountCoding}</h2>
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
