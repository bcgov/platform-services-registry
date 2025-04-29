'use client';

import { BarChart, Card, Subtitle, Title } from '@tremor/react';

type DailyCost = {
  date: string;
  'CPU Cost ($)': number;
  'Storage Cost ($)': number;
  'Total Cost ($)': number;
};

interface MonthlyCostChartProps {
  items: {
    startDate: string;
    cpuCost: number;
    storageCost: number;
    totalCost: number;
  }[];
  selectedDate: Date;
}

function normalizeDailyCosts(items: MonthlyCostChartProps['items'], startDate: Date, endDate: Date): DailyCost[] {
  const dailyData: DailyCost[] = [];
  let currentCpuCost = 0;
  let currentStorageCost = 0;
  let currentTotalCost = 0;

  const sortedItems = [...items].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  let itemIndex = 0;
  let currentItem = sortedItems[itemIndex];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    while (currentItem && new Date(currentItem.startDate).getTime() <= d.getTime()) {
      currentCpuCost = currentItem.cpuCost;
      currentStorageCost = currentItem.storageCost;
      currentTotalCost = currentItem.totalCost;
      itemIndex++;
      currentItem = sortedItems[itemIndex];
    }

    dailyData.push({
      date: new Date(d).toLocaleDateString('en-CA'),
      'CPU Cost ($)': currentCpuCost,
      'Storage Cost ($)': currentStorageCost,
      'Total Cost ($)': currentTotalCost,
    });
  }

  return dailyData;
}

const valueFormatter = (number: number) =>
  `$${new Intl.NumberFormat('us', { maximumFractionDigits: 2 }).format(number)}`;

export default function MonthlyCostChart({ items, selectedDate }: MonthlyCostChartProps) {
  const chartData = normalizeDailyCosts(
    items,
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
  );

  return (
    <Card>
      <Title>Daily Cost Breakdown</Title>
      <Subtitle>Provisioned daily CPU and Storage costs for the selected month.</Subtitle>
      <div className="relative">
        <BarChart
          className="mt-6"
          data={chartData}
          index="date"
          categories={['CPU Cost ($)', 'Storage Cost ($)', 'Total Cost ($)']}
          colors={['indigo', 'cyan', 'emerald']}
          valueFormatter={valueFormatter}
          yAxisWidth={80}
        />
      </div>
    </Card>
  );
}
