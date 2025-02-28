'use client';

import { LoadingOverlay } from '@mantine/core';
import { Cluster, Ministry } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import CombinedAreaGraph from '@/components/analytics/CombinedAreaGraph';
import Histogram from '@/components/analytics/Histogram';
import LineGraph from '@/components/analytics/LineGraph';
import PieGraph from '@/components/analytics/PieGraph';
import FormDateRangePicker from '@/components/generic/select/FormDateRangePicker';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import FormUserPicker from '@/components/generic/select/FormUserPicker';
import { clusters, GlobalPermissions, ministryOptions } from '@/constants';
import createClientPage from '@/core/client-page';
import { ministryKeyToName } from '@/helpers/product';
import {
  downloadPrivateCloudAnalytics,
  getAnalyticsPrivateCloudData,
} from '@/services/backend/analytics/private-cloud';
import { FetchKey } from '@/validation-schemas/analytics-private-cloud';
import { pageState } from './state';

const analyticsPrivateCloudDashboard = createClientPage({
  permissions: [GlobalPermissions.ViewPrivateAnalytics],
  fallbackUrl: '/login?callbackUrl=/home',
});

const transformMinistryData = (items: { _id: string; value: number }[]) =>
  items.map(({ _id, value }) => ({ label: ministryKeyToName(_id), value }));

const validClusters = (clusters as string[]).filter((cluster): cluster is Cluster =>
  Object.values(Cluster).includes(cluster as Cluster),
);

const mapClusterData = (selectedClusters: Cluster[], ministryData: any[]) => {
  const clusterDataMapping: Record<Cluster, { _id: string; value: number }[]> = {
    CLAB: [],
    KLAB: [],
    SILVER: [],
    GOLD: [],
    GOLDDR: [],
    KLAB2: [],
    EMERALD: [],
  };

  selectedClusters.forEach((cluster) => {
    const clusterIndex = validClusters.indexOf(cluster);
    if (clusterIndex !== -1 && ministryData[clusterIndex + 1]) {
      clusterDataMapping[cluster] = ministryData[clusterIndex + 1];
    } else {
      clusterDataMapping[cluster] = [];
    }
  });

  return Object.fromEntries(
    selectedClusters.map((cluster) => [cluster, transformMinistryData(clusterDataMapping[cluster] || [])]),
  );
};

export default analyticsPrivateCloudDashboard(() => {
  const snap = useSnapshot(pageState);
  const { data, isLoading } = useQuery({
    queryKey: ['analyticsData', snap],
    queryFn: () =>
      getAnalyticsPrivateCloudData({
        dates: snap.dates,
        userId: snap.userId,
        ministries: snap.ministries,
        clusters: snap.clusters,
        temporary: snap.temporary,
      }),
  });

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen relative">
        {isLoading ? (
          <LoadingOverlay
            visible
            zIndex={50}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'pink', type: 'bars' }}
          />
        ) : (
          <span className="text-red-500 text-lg">Failed to load analytics data. Please try again.</span>
        )}
      </div>
    );
  }

  const selectedClusters = snap.clusters?.length ? snap.clusters : clusters;
  const allClusterData = transformMinistryData(data.ministryDistributionData[0]);
  const mappedClusterData = mapClusterData(selectedClusters, data.ministryDistributionData);

  const pieChartData: Record<string, { label: string; value: number }[]> = {
    All: allClusterData,
    ...mappedClusterData,
  };

  return (
    <div>
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">
        Private Cloud Data Analytics
      </h1>
      <Filters snap={snap} />
      <div className="grid grid-cols-1 gap-8 mt-12">
        <GraphSection data={data} isLoading={isLoading} snap={snap} />
        <PieGraph
          title="Ministry per Cluster"
          subtitle="This graph shows the cluster distributions by ministries"
          data={pieChartData}
        />
      </div>
    </div>
  );
});

const Filters = ({ snap }: { snap: typeof pageState }) => (
  <div className="grid grid-cols-7 gap-4 w-full">
    <div className="col-span-3">
      <FormMultiSelect
        name="ministry"
        label="Ministry"
        value={snap.ministries ?? []}
        data={ministryOptions}
        onChange={(value) => (pageState.ministries = value as Ministry[])}
      />
    </div>

    <div className="col-span-3">
      <FormMultiSelect
        name="cluster"
        label="Cluster"
        value={snap.clusters ?? []}
        data={clusters.map((v) => ({ label: v, value: v }))}
        onChange={(value) => (pageState.clusters = value as Cluster[])}
      />
    </div>

    <div className="col-span-1">
      <FormMultiSelect
        name="temporary"
        label="Temporary"
        value={snap.temporary ?? []}
        data={['YES', 'NO']}
        onChange={(value) => (pageState.temporary = value as ('YES' | 'NO')[])}
      />
    </div>

    <div className="col-span-2">
      <FormUserPicker label="User" onChange={(user) => (pageState.userId = user?.id ?? '')} />
    </div>

    <div className="col-span-3">
      <FormDateRangePicker
        value={(snap.dates.map((d) => new Date(d)) as [Date | null, Date | null]) ?? [null, null]}
        label="Date Range"
        onChange={(dates) => {
          pageState.dates = dates.filter((v): v is Date => v !== null).map((v) => v.toISOString());
        }}
      />
    </div>
  </div>
);

const GraphSection = ({ data, isLoading, snap }: { data: any; isLoading: boolean; snap: typeof pageState }) => (
  <>
    <CombinedAreaGraph
      isLoading={isLoading}
      title="Requests over time"
      subtitle="This graph shows the number of requests over time for each request type"
      chartData={data.allRequests}
      categories={['All requests', 'Edit requests', 'Create requests', 'Delete requests']}
      colors={['indigo', 'yellow', 'green', 'red']}
      onExport={async () => {
        const exportParams = {
          data: { ...snap, fetchKey: FetchKey.ALL_REQUESTS },
        };
        return await downloadPrivateCloudAnalytics(exportParams);
      }}
    />
    <CombinedAreaGraph
      title="Quota requests over time"
      subtitle="This graph shows edit requests where a quota change was requested and the request decision"
      chartData={data.quotaChange}
      categories={['All quota requests', 'Approved quota requests', 'Rejected quota requests']}
      colors={['indigo', 'green', 'red']}
      onExport={async () => {
        const exportParams = {
          data: { ...snap, fetchKey: FetchKey.QUOTA_CHANGE },
        };
        return await downloadPrivateCloudAnalytics(exportParams);
      }}
    />
    <CombinedAreaGraph
      isLoading={isLoading}
      title="Contact change requests over time"
      subtitle="This graph shows edit requests where contact change(s) was requested and the request decision"
      chartData={data.contactsChange}
      categories={['Contact changes']}
      colors={['indigo']}
      onExport={async () => {
        const exportParams = {
          data: { ...snap, fetchKey: FetchKey.CONTACTS_CHANGE },
        };
        return await downloadPrivateCloudAnalytics(exportParams);
      }}
    />
    <LineGraph
      isLoading={isLoading}
      index="date"
      title="Active Products"
      subtitle="This graph shows the cumulative total of products provisioned through the registry"
      chartData={data.activeProducts}
      categories={['All Clusters'].concat(snap.clusters?.length ? snap.clusters : clusters)}
      onExport={async () => {
        const exportParams = {
          data: { ...snap, fetchKey: FetchKey.ACTIVE_PRODUCTS },
        };
        return await downloadPrivateCloudAnalytics(exportParams);
      }}
    />

    <Histogram
      isLoading={isLoading}
      index="time"
      title="Request decision time frequency (%)"
      chartData={data.requestDecisionTime}
      categories={['Percentage']}
      colors={['indigo']}
      onExport={async () => {
        const exportParams = {
          data: { ...snap, fetchKey: FetchKey.REQUEST_DECISION_TIME },
        };
        return await downloadPrivateCloudAnalytics(exportParams);
      }}
    />
  </>
);
