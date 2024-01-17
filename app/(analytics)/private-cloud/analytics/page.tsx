import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import LineGraph from '@/components/analytics/LineGraph';
import Histogram from '@/components/analytics/Histogram';
import { combinedQuotaEditRequests } from '@/analytics/private-cloud/quotaChanges';
import { combinedRequests } from '@/analytics/private-cloud/requests';
import { numberOfProductsOverTime } from '@/analytics/private-cloud/products';
import { requestDecisionTime } from '@/analytics/private-cloud/requestDecisionTime';
import { useSession } from 'next-auth/react';

export default async function AnalyticsDashboard() {
  const { data: session, status } = useSession({
    required: true,
  });

  const quotaChangedChartData = await combinedQuotaEditRequests();
  const requestsChartData = await combinedRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();

  return (
    <div className="flex flex-col gap-y-12 m-12 ">
      <CombinedAreaGraph
        title={'Requests over time'}
        chartData={requestsChartData}
        categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
        colors={['indigo', 'yellow', 'green', 'red']}
        exportApiEndpoint="/api/private-cloud/analytics/csv/requests"
      />
      <CombinedAreaGraph
        title={'Quota requests over time'}
        chartData={quotaChangedChartData}
        categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
        colors={['indigo', 'green', 'red']}
        exportApiEndpoint="/api/private-cloud/analytics/csv/quota-requests"
      />
      <LineGraph
        index="date"
        title={'Products provisioned over time (including deleted)'}
        chartData={projectsChartData}
        categories={['Products']}
        colors={['indigo']}
        exportApiEndpoint="/api/private-cloud/analytics/csv/products"
      />
      <Histogram
        index="time"
        title={'Request decision time frequency (%)'}
        chartData={requestDecisionTimeChartData}
        categories={['Percentage']}
        colors={['indigo']}
        exportApiEndpoint="/api/private-cloud/analytics/csv/request-decision-time"
      />
    </div>
  );
}
