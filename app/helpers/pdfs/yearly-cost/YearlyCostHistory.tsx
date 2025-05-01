import { YearlyCostDataWithMonthName } from '@/helpers/product';
import { formatDate } from '@/utils/js';

export interface ChartAndTableProps {
  resources: YearlyCostDataWithMonthName[];
  year: string;
}

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
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f4f4f4;
}

.header {
  position: running(header);
  font-style: italic;
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

export default function YearlyCostHistory({ resources, year }: ChartAndTableProps) {
  const rows =
    resources.length &&
    resources.map((resource, index) => (
      <tr key={index}>
        <td>
          {resource.month} {year}
        </td>
        <td>{resource.cpuCost}</td>
        <td>{resource.storageCost}</td>
        <td>{resource.totalCost}</td>
      </tr>
    ));
  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>
      <h1 className="text-center">Cost History for {year}</h1>

      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>CPU Usage Cost (CAD)</th>
            <th>Storage Usage Cost (CAD)</th>
            <th>Total Cost (CAD)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}
