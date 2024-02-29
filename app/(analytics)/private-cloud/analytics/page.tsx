import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import LineGraph from '@/components/analytics/LineGraph';
import Histogram from '@/components/analytics/Histogram';
import { quotaEditRequests } from '@/analytics/private-cloud/quotaChanges';
import { combinedRequests } from '@/analytics/private-cloud/requests';
import { numberOfProductsOverTime } from '@/analytics/private-cloud/products';
import { requestDecisionTime } from '@/analytics/private-cloud/requestDecisionTime';
import ExportCard from '@/components/analytics/ExportCard';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { redirect } from 'next/navigation';
import { ministryDistributions } from '@/analytics/private-cloud/ministryDistributions';
import PieGraph from '@/components/analytics/PieGraph';
import { ministriesNames } from '@/constants';

function ministryNameToDisplayName(name: string) {
  return ministriesNames.find((item) => item.name === name)?.humanFriendlyName ?? '';
}

function mapMinistryDistributions(items: { _id: string; value: number }[]) {
  return items.map(({ _id, value }) => ({ label: ministryNameToDisplayName(_id), value }));
}

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.isAdmin) {
    redirect('/login?callbackUrl=/private-cloud/products/all');
  }

  const quotaChangedChartData = await quotaEditRequests();
  const requestsChartData = await combinedRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();
  const ministryDistributionData = await ministryDistributions();

  const allClusterData = mapMinistryDistributions(ministryDistributionData[0]);
  const silverData = mapMinistryDistributions(ministryDistributionData[1]);
  const goldData = mapMinistryDistributions(ministryDistributionData[2]);
  const emeraldData = mapMinistryDistributions(ministryDistributionData[3]);

  return (
    <div className="m-12">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        Private Cloud Data Analytics
      </h1>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          title={'Requests over time'}
          subtitle={'This graph shows the number of requests over time for each request type'}
          chartData={requestsChartData}
          categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
          colors={['indigo', 'yellow', 'green', 'red']}
          exportApiEndpoint="/api/private-cloud/analytics/csv/requests"
        />
        <CombinedAreaGraph
          title={'Quota requests over time'}
          subtitle={'This graph shows edit requests where a quota change was requested and the request decision'}
          chartData={quotaChangedChartData}
          categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
          colors={['indigo', 'green', 'red']}
          exportApiEndpoint="/api/private-cloud/analytics/csv/quota-requests"
        />
        <LineGraph
          index="date"
          title={'Products provisioned over time'}
          subtitle={'This graph shows the cumulitive total of products provisioned through the registry'}
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
          exportApiEndpoint="/api/private-cloud/analytics/csv/decision-time"
        />
        <PieGraph
          title="Ministry per Cluster"
          subtitle="This graph shows the cluster distributions by ministries"
          data={{
            All: allClusterData,
            Silver: silverData,
            Gold: goldData,
            Emerald: emeraldData,
          }}
        />
        <ExportCard
          title="Users with quota edit requests"
          apiEnpoint="/api/private-cloud/analytics/csv/quota-request-users"
        />
      </div>
    </div>
  );
}
