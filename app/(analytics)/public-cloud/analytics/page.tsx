import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import LineGraph from '@/components/analytics/LineGraph';
import Histogram from '@/components/analytics/Histogram';
import { combinedRequests } from '@/analytics/public-cloud/requests';
import { numberOfProductsOverTime } from '@/analytics/public-cloud/products';
import { requestDecisionTime } from '@/analytics/public-cloud/requestDecisionTime';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);

  const requestsChartData = await combinedRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();

  return (
    <div className="m-12">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        public Cloud Data Analytics
      </h1>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          title={'Requests over time'}
          subtitle={'This graph shows the number of requests over time for each request type'}
          chartData={requestsChartData}
          categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
          colors={['indigo', 'yellow', 'green', 'red']}
          exportApiEndpoint="/api/public-cloud/analytics/csv/requests"
        />
        <LineGraph
          index="date"
          title={'Products provisioned over time'}
          subtitle={'This graph shows the cumulitive total of products provisioned through the registry'}
          chartData={projectsChartData}
          categories={['Products']}
          colors={['indigo']}
          exportApiEndpoint="/api/public-cloud/analytics/csv/products"
        />
        <Histogram
          index="time"
          title={'Request decision time frequency (%)'}
          chartData={requestDecisionTimeChartData}
          categories={['Percentage']}
          colors={['indigo']}
          exportApiEndpoint="/api/public-cloud/analytics/csv/decision-time"
        />
      </div>
    </div>
  );
}
