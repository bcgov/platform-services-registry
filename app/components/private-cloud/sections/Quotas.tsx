import { Loader } from '@mantine/core';
import { Cluster, ResourceRequestsEnv, ResourceRequests } from '@prisma/client';
import { useQueries } from '@tanstack/react-query';
import _startCase from 'lodash-es/startCase';
import { useFormContext } from 'react-hook-form';
import ExternalLink from '@/components/generic/button/ExternalLink';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { cn } from '@/utils';
import QuotasChangeInfo from './QuotasChangeInfo';
import QuotasDescription from './QuotasDescription';

const namespaceSuffixes = {
  development: '-dev',
  test: '-test',
  production: '-prod',
  tools: '-tools',
};

const resourceUnit = {
  cpu: 'Core(s)',
  memory: 'GB',
  storage: 'GB',
};

type ResourceRequestsEnvKeys = Array<keyof ResourceRequestsEnv>;
type ResourceRequestsKeys = Array<keyof ResourceRequests>;

const namespaceKeys: ResourceRequestsEnvKeys = ['development', 'test', 'production', 'tools'];
const resourceKeys: ResourceRequestsKeys = ['cpu', 'memory', 'storage'];

export default function Quotas({
  cluster,
  licencePlate,
  disabled,
  originalResourceRequests,
  quotaContactRequired = false,
}: {
  cluster: Cluster;
  licencePlate: string;
  disabled: boolean;
  originalResourceRequests: ResourceRequestsEnv;
  quotaContactRequired?: boolean;
}) {
  const { watch } = useFormContext();

  const [resourceRequests] = watch(['resourceRequests']);

  const subnetInformation = useQueries({
    queries: ['dev', 'test', 'prod', 'tools'].map((environment) => {
      return {
        queryKey: [licencePlate, environment],
        queryFn: () => getSubnetForEmerald(licencePlate, environment),
        enabled: cluster === Cluster.EMERALD && !!licencePlate,
      };
    }),
  });

  return (
    <>
      <QuotasDescription />

      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-4 xl:gap-x-4 gap-y-8 sm:grid-cols-8 ">
        {namespaceKeys.map((namespace, index) => {
          const originalVal = originalResourceRequests[namespace];
          const newVal = (resourceRequests[namespace] || {}) as ResourceRequests;
          const changed =
            originalVal?.cpu !== newVal?.cpu ||
            originalVal?.memory !== newVal?.memory ||
            originalVal?.storage !== newVal?.storage;

          return (
            <div
              key={namespace}
              className={cn('sm:col-span-2 py-3 px-5 rounded-lg border-2', {
                'border-purple-800 shadow-[0_0_15px_2px_rgba(59,130,246,0.2)]': changed,
                'border-transparent': !changed,
              })}
            >
              <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
                {_startCase(namespace)} Namespace
              </h3>
              <ExternalLink
                href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}${namespaceSuffixes[namespace]}`}
              >
                {licencePlate}
                {namespaceSuffixes[namespace] || ''}
              </ExternalLink>

              {subnetInformation[index].isLoading ? (
                <Loader color="blue" type="dots" />
              ) : subnetInformation[index].data ? (
                <p className="text-base font-semibold mb-3">{subnetInformation[index].data}</p>
              ) : (
                <p className="text-base font-semibold mb-3 text-gray-500">No subnet information available</p>
              )}

              {resourceKeys.map((resourceKey) => {
                const oldval = String(originalVal[resourceKey]);
                const newval = String(newVal[resourceKey]);

                return (
                  <div key={resourceKey}>
                    <HookFormTextInput
                      label={`${resourceKey.toUpperCase()} (${resourceUnit[resourceKey]})`}
                      name={`resourceRequests.${namespace}.${resourceKey}`}
                      type="number"
                      step={resourceKey === 'cpu' ? 0.5 : 1}
                      placeholder="0"
                      required
                      disabled={disabled}
                      classNames={{ wrapper: 'mt-3' }}
                      options={{ valueAsNumber: true }}
                    />
                    {oldval !== newval && (
                      <div>
                        Original value: <span className="font-semibold">{oldval}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      {quotaContactRequired && <QuotasChangeInfo disabled={disabled} />}
    </>
  );
}
