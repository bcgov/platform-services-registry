import _toUpper from 'lodash-es/toUpper';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import LineGraph from '@/components/analytics/LineGraph';
import Histogram from '@/components/analytics/Histogram';
import { combinedRequests } from '@/analytics/public-cloud/requests';
import { numberOfProductsOverTime } from '@/analytics/public-cloud/products';
import { requestDecisionTime } from '@/analytics/public-cloud/request-decision-time';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { ministryDistributions } from '@/analytics/public-cloud/ministry-distributions';
import PieGraph from '@/components/analytics/PieGraph';
import { ministriesNames } from '@/constants';
import { redirect, RedirectType } from 'next/navigation';

function ministryNameToDisplayName(name: string) {
  return ministriesNames.find((item) => item.name === name)?.humanFriendlyName ?? '';
}

function mapProviderDistributions(items: { _id: string; value: number }[]) {
  return items.map(({ _id, value }) => ({ label: ministryNameToDisplayName(_id), value }));
}

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/public-cloud/products/all');
  } else if (!session.permissions.viewAnalytics) {
    redirect('/public-cloud/products/all');
  }

  const requestsChartData = await combinedRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();
  const ministryDistributionData = await ministryDistributions();

  const awsData = mapProviderDistributions(ministryDistributionData[0]);

  return (
    <div className="">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        Public Cloud Data Analytics
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
          title={'Active Products'}
          subtitle={'This graph shows the cumulitive total of products provisioned through the registry'}
          chartData={projectsChartData}
          categories={['AWS']}
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
        <PieGraph
          title="Ministry per Provider"
          subtitle="This graph shows the cluster distributions by providers"
          data={{
            AWS: awsData,
          }}
        />
      </div>
    </div>
  );
}
