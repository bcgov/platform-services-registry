import _toUpper from 'lodash-es/toUpper';
import { redirect, RedirectType } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { ministryDistributions } from '@/analytics/public-cloud/ministry-distributions';
import { numberOfProductsOverTime } from '@/analytics/public-cloud/products';
import { requestDecisionTime } from '@/analytics/public-cloud/request-decision-time';
import { combinedRequests } from '@/analytics/public-cloud/requests';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import Histogram from '@/components/analytics/Histogram';
import LineGraph from '@/components/analytics/LineGraph';
import PieGraph from '@/components/analytics/PieGraph';
import { authOptions } from '@/core/auth-options';
import { ministryKeyToName } from '@/helpers/product';

function mapProviderDistributions(items: { _id: string; value: number }[]) {
  return items.map(({ _id, value }) => ({ label: ministryKeyToName(_id), value }));
}

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login?callbackUrl=/home');
  } else if (!session.permissions.viewPublicAnalytics) {
    redirect('/home');
  }

  const requestsChartData = await combinedRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();
  const ministryDistributionData = await ministryDistributions();

  const awsData = mapProviderDistributions(ministryDistributionData[0]);

  return (
    <div className="">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        Public Cloud Data Analytics
      </h1>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          title={'Requests over time'}
          subtitle={'This graph shows the number of requests over time for each request type'}
          chartData={requestsChartData}
          categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
          colors={['indigo', 'yellow', 'green', 'red']}
          exportApiEndpoint="/public-cloud/analytics/csv/requests"
        />
        <LineGraph
          index="date"
          title={'Active Products'}
          subtitle={'This graph shows the cumulitive total of products provisioned through the registry'}
          chartData={projectsChartData}
          categories={['AWS']}
          exportApiEndpoint="/public-cloud/analytics/csv/products"
        />
        <Histogram
          index="time"
          title={'Request decision time frequency (%)'}
          chartData={requestDecisionTimeChartData}
          categories={['Percentage']}
          colors={['indigo']}
          exportApiEndpoint="/public-cloud/analytics/csv/decision-time"
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
