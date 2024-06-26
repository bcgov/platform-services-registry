import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { contactChangeRequests } from '@/analytics/private-cloud/contact-changes';
import { ministryDistributions } from '@/analytics/private-cloud/ministry-distributions';
import { numberOfProductsOverTime } from '@/analytics/private-cloud/products';
import { quotaEditRequests } from '@/analytics/private-cloud/quota-changes';
import { requestDecisionTime } from '@/analytics/private-cloud/request-decision-time';
import { combinedRequests } from '@/analytics/private-cloud/requests';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import ExportCard from '@/components/analytics/ExportCard';
import Histogram from '@/components/analytics/Histogram';
import LineGraph from '@/components/analytics/LineGraph';
import PieGraph from '@/components/analytics/PieGraph';
import { authOptions } from '@/core/auth-options';
import { ministryKeyToName } from '@/helpers/product';

function mapMinistryDistributions(items: { _id: string; value: number }[]) {
  return items.map(({ _id, value }) => ({ label: ministryKeyToName(_id), value }));
}

export default async function AnalyticsDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.permissions.viewPrivateAnalytics) {
    redirect('/login?callbackUrl=/home');
  }

  const quotaChangedChartData = await quotaEditRequests();
  const requestsChartData = await combinedRequests();
  const contactChangeData = await contactChangeRequests();
  const projectsChartData = await numberOfProductsOverTime();
  const requestDecisionTimeChartData = await requestDecisionTime();
  const ministryDistributionData = await ministryDistributions();

  const allClusterData = mapMinistryDistributions(ministryDistributionData[0]);
  const silverData = mapMinistryDistributions(ministryDistributionData[1]);
  const goldData = mapMinistryDistributions(ministryDistributionData[2]);
  const emeraldData = mapMinistryDistributions(ministryDistributionData[3]);

  return (
    <div className="">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        Private Cloud Data Analytics
      </h1>
      <div className="flex flex-col gap-y-12 mt-14">
        <CombinedAreaGraph
          title={'Requests over time'}
          subtitle={'This graph shows the number of requests over time for each request type'}
          chartData={requestsChartData}
          categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
          colors={['indigo', 'yellow', 'green', 'red']}
          exportApiEndpoint="/private-cloud/analytics/csv/requests"
        />
        <CombinedAreaGraph
          title={'Quota requests over time'}
          subtitle={'This graph shows edit requests where a quota change was requested and the request decision'}
          chartData={quotaChangedChartData}
          categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
          colors={['indigo', 'green', 'red']}
          exportApiEndpoint="/private-cloud/analytics/csv/quota-requests"
        />
        <CombinedAreaGraph
          title={'Contact change requests over time'}
          subtitle={'This graph shows edit requests where contact change(s) was requested and the request decision'}
          chartData={contactChangeData}
          categories={['Contact changes']}
          colors={['indigo']}
          exportApiEndpoint=""
        />
        <LineGraph
          index="date"
          title={'Active Products'}
          subtitle={'This graph shows the cumulitive total of products provisioned through the registry'}
          chartData={projectsChartData}
          categories={['All Clusters', 'Silver', 'Gold', 'Emerald']}
          exportApiEndpoint="/private-cloud/analytics/csv/products"
        />
        <Histogram
          index="time"
          title={'Request decision time frequency (%)'}
          chartData={requestDecisionTimeChartData}
          categories={['Percentage']}
          colors={['indigo']}
          exportApiEndpoint="/private-cloud/analytics/csv/decision-time"
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
