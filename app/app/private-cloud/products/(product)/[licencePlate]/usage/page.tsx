'use client';

import { LoadingOverlay, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import FormSelect from '@/components/generic/select/FormSelect';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  getTotalMetrics,
  transformPVCData,
  TransformedPVCData,
  transformPodData,
  TransformedPodData,
} from '@/helpers/resource-metrics';
import { getPodUsageMetrics } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import MetricsTable from './MetricsTable';

const selectOptions = [
  {
    name: 'Development namespace',
    value: 'dev',
  },
  {
    name: 'Test namespace',
    value: 'test',
  },
  {
    name: 'Production namespace',
    value: 'prod',
  },
  {
    name: 'Tools namespace',
    value: 'tools',
  },
];

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductUsageMetrics = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductUsageMetrics(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [environment, setenvironment] = useState('dev');
  const [, privateSnap] = usePrivateProductState();

  const { licencePlate = '' } = pathParams ?? {};

  const { data = { podMetrics: [], pvcMetrics: [] }, isLoading } = useQuery({
    queryKey: [environment, licencePlate],
    queryFn: () => getPodUsageMetrics(licencePlate, environment, privateSnap.currentProduct?.cluster || ''),
  });

  const handleNamespaceChange = (namespace: string) => {
    setenvironment(namespace);
  };

  const rowsPod: TransformedPodData[] = [
    {
      name: 'Pod name',
      containerName: 'Container name',
      usage: { cpu: 'CPU usage', memory: 'Memory usage' },
      requests: { cpu: 'CPU requests', memory: 'Memory requests' },
      limits: { cpu: 'CPU limits', memory: 'Memory limits' },
    },
    ...transformPodData(data.podMetrics),
  ];
  const rowsPVC: TransformedPVCData[] = [
    {
      name: 'PVC name',
      storageClassName: 'Storage class name',
      pvName: 'PV name',
      usage: 'PVC usage',
      limits: 'PVC limits',
      freeInodes: 'Free inodes',
    },
    ...transformPVCData(data.pvcMetrics),
  ];

  return (
    <div>
      <fieldset className="w-full md:w-48 2xl:w-64 pb-6">
        <FormSelect
          id="id"
          label="Filter by namespace"
          options={selectOptions.map((v) => ({ label: v.name, value: v.value }))}
          defaultValue={'dev'}
          onChange={handleNamespaceChange}
        />
      </fieldset>
      <Box pos="relative" className="min-h-96">
        {data.length === 0 && !isLoading ? (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-5 bg-gray-100 rounded-lg">
            This Namespace doesn&apos;t contain any running pods
          </span>
        ) : (
          <>
            <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            <MetricsTable
              rows={rowsPod}
              resource="cpu"
              title="CPU Usage"
              totalMetrics={getTotalMetrics(data.podMetrics, 'cpu')}
            />
            <MetricsTable
              rows={rowsPod}
              resource="memory"
              title="Memory Usage"
              totalMetrics={getTotalMetrics(data.podMetrics, 'memory')}
            />
            <MetricsTable
              rows={rowsPVC}
              resource="storage"
              title="Storage Usage"
              totalMetrics={getTotalMetrics(data.pvcMetrics, 'storage')}
            />
          </>
        )}
      </Box>
    </div>
  );
});
