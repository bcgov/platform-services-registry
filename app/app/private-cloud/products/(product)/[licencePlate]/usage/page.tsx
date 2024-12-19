'use client';

import { LoadingOverlay, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import FormSelect from '@/components/generic/select/FormSelect';
import { environmentLongNames, environmentShortNames, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  getTotalMetrics,
  transformPVCData,
  TransformedPVCData,
  transformPodData,
  TransformedPodData,
  normalizeCpu,
  normalizeMemory,
} from '@/helpers/resource-metrics';
import { getPodUsageMetrics } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import MetricsTable from './MetricsTable';

const selectOptions: { name: string; value: EnvironmentShort }[] = [
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

type EnvironmentShort = keyof typeof environmentLongNames;
type EnvironmentLong = keyof typeof environmentShortNames;

export default privateCloudProductUsageMetrics(({ getPathParams }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [environment, setEnvironment] = useState<EnvironmentShort>('dev');

  const [, privateSnap] = usePrivateProductState();
  const productRequest =
    privateSnap.currentProduct?.resourceRequests[environmentLongNames[environment] as EnvironmentLong];

  const { licencePlate = '' } = pathParams ?? {};

  const { data = { podMetrics: [], pvcMetrics: [] }, isLoading } = useQuery({
    queryKey: [environment, licencePlate],
    queryFn: () => getPodUsageMetrics(licencePlate, environment, privateSnap.currentProduct?.cluster || ''),
  });

  const handleNamespaceChange = (namespace: EnvironmentShort) => {
    setEnvironment(namespace);
  };

  const rowsPod: TransformedPodData[] = [
    {
      name: 'Pod name',
      containerName: 'Container name',
      usage: { cpu: 'CPU usage', memory: 'Memory usage' },
      requests: { cpu: 'CPU request', memory: 'Memory request' },
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
      requests: 'PVC request',
      freeInodes: 'Free inodes',
    },
    ...transformPVCData(data.pvcMetrics),
  ];

  return (
    <div>
      <p className="w-full block text-sm font-medium leading-6 text-gray-900 pb-3">
        Average utilization rate for CPU and Memory is being counted based on the metrics of your namespace received in
        last 2 weeks
      </p>
      <fieldset className="w-full md:w-48 2xl:w-64 pb-6">
        <FormSelect
          id="id"
          label="Filter by namespace"
          options={selectOptions.map((v) => ({ label: v.name, value: v.value }))}
          defaultValue={environment}
          onChange={(value) => handleNamespaceChange(value as EnvironmentShort)}
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
              productRequest={normalizeCpu((productRequest?.cpu ?? 0) + 'c')}
              resource="cpu"
              totalMetrics={getTotalMetrics(data.podMetrics, 'cpu')}
            />
            <MetricsTable
              rows={rowsPod}
              productRequest={normalizeMemory((productRequest?.memory ?? 0) + 'Gi')}
              resource="memory"
              totalMetrics={getTotalMetrics(data.podMetrics, 'memory')}
            />
            <MetricsTable
              rows={rowsPVC}
              productRequest={normalizeMemory((productRequest?.storage ?? 0) + 'Gi')}
              resource="storage"
              totalMetrics={getTotalMetrics(data.pvcMetrics, 'storage')}
            />
          </>
        )}
      </Box>
    </div>
  );
});
