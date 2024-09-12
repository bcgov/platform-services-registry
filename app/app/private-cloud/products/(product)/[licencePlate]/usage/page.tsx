'use client';

import { LoadingOverlay, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';
import FormSelect from '@/components/generic/select/FormSelect';
import TableBodyMetrics from '@/components/table/TableBodyMetrics';
import { IS_PROD } from '@/config';
import createClientPage from '@/core/client-page';
import { getPodUsageMetrics } from '@/services/backend/private-cloud/pod-usage-metrics';
import { usePrivateProductState } from '@/states/global';

const selectOptions = [
  {
    name: 'Production namespace',
    value: 'prod',
  },
  {
    name: 'Development namespace',
    value: 'dev',
  },
  {
    name: 'Tools namespace',
    value: 'tools',
  },
  {
    name: 'Test namespace',
    value: 'test',
  },
];

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductUsageMetrics = createClientPage({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductUsageMetrics(({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const [namespacePostfix, setNamespacePostfix] = useState('prod');
  const [, privateSnap] = usePrivateProductState();

  const { data = [], isLoading } = useQuery({
    queryKey: [namespacePostfix, licencePlate],
    queryFn: IS_PROD
      ? () => getPodUsageMetrics(licencePlate, namespacePostfix, privateSnap.currentProduct?.cluster || 'silver')
      : () => getPodUsageMetrics('f6ee34', namespacePostfix, 'klab'),
  });

  const handleNamespaceChange = (namespace: string) => {
    setNamespacePostfix(namespace);
  };

  const titledData = [
    {
      name: 'Pod name',
      usage: { cpu: 'CPU Usage', memory: 'Memory Usage' },
      limits: { cpu: 'CPU Limits', memory: 'Memory Limits' },
      requests: { cpu: 'CPU Requests', memory: 'Memory Requests' },
    },
    ...data,
  ];

  return (
    <div>
      <fieldset className="w-full md:w-48 2xl:w-64 pb-6">
        <FormSelect
          id="id"
          label="Filter by Namespace"
          options={selectOptions.map((v) => ({ label: v.name, value: v.value }))}
          defaultValue={'prod'}
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
            <TableBodyMetrics rows={titledData} resource={'cpu'} title={'CPU Usage'} />
            <TableBodyMetrics rows={titledData} resource={'memory'} title={'Memory Usage'} />
          </>
        )}
      </Box>
    </div>
  );
});
