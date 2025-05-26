'use client';

import { Alert, Tabs } from '@mantine/core';
import { IconInfoCircle, IconExclamationCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import LoadingBox from '@/components/generic/LoadingBox';
import type { EnvironmentShortName } from '@/constants';
import { Cluster, ResourceRequests } from '@/prisma/client';
import { getUsageMetrics } from '@/services/backend/private-cloud/products';
import CpuTable from './CpuTable';
import MemoryTable from './MemoryTable';
import PvcTable from './PvcTable';

const tabClassname = `
  relative bg-white hover:bg-gray-50 border border-solid border-gray-500
  first:rounded-l-md rtl:first:rounded-r-md last:rounded-r-md rtl:last:rounded-l-md -ml-px first:ml-0 rtl:-mr-px rtl:first:mr-0
  data-[active=true]:z-10 data-[active=true]:bg-bcblue data-[active=true]:border-bcblue data-[active=true]:text-white data-[active=true]:hover:bg-bcblue
`;

export default function NamespaceMetrics({
  resourceRequests,
  licencePlate,
  cluster,
  environment,
}: {
  resourceRequests: ResourceRequests;
  licencePlate: string;
  cluster: Cluster;
  environment: EnvironmentShortName;
}) {
  const {
    data: metrics = { podMetrics: [], pvcMetrics: [] },
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    error: metricsError,
  } = useQuery({
    queryKey: [licencePlate, cluster, environment],
    queryFn: () => getUsageMetrics(licencePlate, cluster, environment),
    enabled: !!(licencePlate && cluster && environment),
  });

  if (isMetricsError) {
    return (
      <Alert color="danger" title="API error" icon={<IconExclamationCircle />} className="max-w-xl mx-auto">
        The metrics are not available at this time.
      </Alert>
    );
  }

  return (
    <LoadingBox isLoading={isMetricsLoading}>
      {metrics.podMetrics.length === 0 ? (
        <Alert color="info" title="" icon={<IconInfoCircle />} className="max-w-xl mx-auto">
          This Namespace doesn&apos;t contain any running pods.
        </Alert>
      ) : (
        <>
          <Tabs variant="unstyled" defaultValue="cpu" className="mt-2">
            <Tabs.List grow className="max-w-2xl">
              <Tabs.Tab value="cpu" className={tabClassname}>
                CPU
              </Tabs.Tab>
              <Tabs.Tab value="memory" className={tabClassname}>
                Memory
              </Tabs.Tab>
              <Tabs.Tab value="pvc" className={tabClassname}>
                PVC
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="cpu" pt="xs">
              <CpuTable data={metrics.podMetrics} resourceRequest={resourceRequests.cpu} />
            </Tabs.Panel>

            <Tabs.Panel value="memory" pt="xs">
              <MemoryTable data={metrics.podMetrics} resourceRequest={resourceRequests.memory} />
            </Tabs.Panel>

            <Tabs.Panel value="pvc" pt="xs">
              <PvcTable data={metrics.pvcMetrics} resourceRequest={resourceRequests.storage} />
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </LoadingBox>
  );
}
