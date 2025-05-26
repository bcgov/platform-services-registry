'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import FormSelect from '@/components/generic/select/FormSelect';
import { environmentLongNames, GlobalRole } from '@/constants';
import type { EnvironmentShortName } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';
import NamespaceMetrics from './NamespaceMetrics';

const environmentOptions = [
  {
    label: 'Development',
    value: 'dev',
  },
  {
    label: 'Test',
    value: 'test',
  },
  {
    label: 'Production',
    value: 'prod',
  },
  {
    label: 'Tools',
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

export default privateCloudProductUsageMetrics(({ getPathParams }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const [environment, setEnvironment] = useState('dev');
  const [, privateSnap] = usePrivateProductState();

  const currentProduct = privateSnap.currentProduct!;

  const { licencePlate = '' } = pathParams ?? {};
  const resourceRequests = currentProduct.resourceRequests[environmentLongNames[environment] as EnvironmentShortName];

  return (
    <div>
      <p className="w-full block text-sm font-medium leading-6 text-gray-900 pb-3">
        Average utilization rate for CPU and Memory is being counted based on the metrics of your namespace received in
        last 2 weeks
      </p>

      <div className="max-w-sm mb-4">
        <FormSelect
          id="namespace"
          label="Filter by namespace"
          options={environmentOptions}
          defaultValue={environment}
          onChange={setEnvironment}
        />
      </div>

      <NamespaceMetrics
        licencePlate={licencePlate}
        cluster={currentProduct.cluster}
        environment={environment as EnvironmentShortName}
        resourceRequests={resourceRequests}
      />
    </div>
  );
});
