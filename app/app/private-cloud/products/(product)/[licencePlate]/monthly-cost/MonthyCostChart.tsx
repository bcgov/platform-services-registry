'use client';

import { BarChart, Card, Title } from '@tremor/react';
import { formatCurrency } from '@/utils/js';
import { getMonthStartEndDate } from '@/utils/js/date';
import { normalizeDailyCosts } from '@/utils/js/normalizeDailyCosts';

type InputItem = {
  startDate: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
};

interface MonthlyCostChartProps {
  items: InputItem[];
  selectedDate: Date;
}

export default function MonthlyCostChart({ items, selectedDate }: MonthlyCostChartProps) {
  const { startDate, endDate } = getMonthStartEndDate(selectedDate.getFullYear(), selectedDate.getMonth() + 1);

  const chartData = normalizeDailyCosts(items, startDate, endDate).map((d) => ({
    day: d.day,
    'CPU Cost (CA$)': d.cpuCost,
    'Storage Cost (CA$)': d.storageCost,
  }));

  return (
    <Card>
      <Title>Daily Cost Breakdown for the selected month</Title>
      <div className="relative">
        <BarChart
          className="mt-6"
          data={chartData}
          index="day"
          categories={['CPU Cost (CA$)', 'Storage Cost (CA$)']}
          colors={['indigo', 'cyan']}
          valueFormatter={formatCurrency}
          yAxisWidth={80}
          stack={true}
        />
      </div>
    </Card>
  );
}
