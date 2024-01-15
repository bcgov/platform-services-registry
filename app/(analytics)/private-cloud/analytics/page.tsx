'use client';

import { AreaChart, Card, Title } from '@tremor/react';
import { useState, useEffect } from 'react';
import ExportButton from '@/components/buttons/ExportButton';

const valueFormatter = function (number: number) {
  return new Intl.NumberFormat('us').format(number).toString();
};

export default function EditRequestsGraph() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/private-cloud/analytics/quota-requests');
      const data = await res.json();
      setChartData(data);
    }
    fetchData();
  }, []);

  if (!chartData) {
    return 'Loading...';
  }

  return (
    <div className="flex flex-col m-12 items-end">
      <ExportButton className="mb-4" apiEnpoint="/api/private-cloud/analytics/quota-requests/csv" />
      <Card>
        <Title>Quota requests over time</Title>
        <AreaChart
          className="h-72 mt-4"
          data={chartData}
          index="date"
          yAxisWidth={65}
          categories={['Quota requests']}
          colors={['indigo', 'cyan']}
          valueFormatter={valueFormatter}
        />
      </Card>
    </div>
  );
}
