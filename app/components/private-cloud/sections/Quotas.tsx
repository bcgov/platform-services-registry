import { Loader, Tooltip } from '@mantine/core';
import { useQueries } from '@tanstack/react-query';
import _startCase from 'lodash-es/startCase';
import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import ExternalLink from '@/components/generic/button/ExternalLink';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { namespaceKeys, resourceKeys } from '@/constants';
import { Cluster, ResourceRequestsEnv, ResourceRequests } from '@/prisma/client';
import { getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { cn } from '@/utils/js';
import QuotasBudgetEstimation from './QuotasBudgetEstimation';
import QuotasChangeInfo from './QuotasChangeInfo';
import QuotasDescription from './QuotasDescription';

const namespaceSuffixes = {
  development: '-dev',
  test: '-test',
  production: '-prod',
  tools: '-tools',
};

const resourceUnit = {
  cpu: 'Core',
  memory: 'GiB',
  storage: 'GiB',
};

export default function Quotas({
  disabled,
  cluster,
  licencePlate,
  originalResourceRequests,
  quotaContactRequired = false,
}: {
  disabled: boolean;
  cluster?: Cluster;
  licencePlate?: string;
  originalResourceRequests?: ResourceRequestsEnv;
  quotaContactRequired?: boolean;
}) {
  const { watch } = useFormContext();

  const [resourceRequests] = watch(['resourceRequests']);

  const subnetInformation = useQueries({
    queries: ['dev', 'test', 'prod', 'tools'].map((environment) => {
      return {
        queryKey: [licencePlate, environment],
        queryFn: () => getSubnetForEmerald(licencePlate!, environment),
        enabled: cluster === Cluster.EMERALD && !!licencePlate,
      };
    }),
  });

  return (
    <>
      <QuotasDescription />

      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-4 xl:gap-x-4 gap-y-8 sm:grid-cols-8 ">
        {namespaceKeys.map((namespace, index) => {
          const originalVal = originalResourceRequests?.[namespace];
          const hasOriginalVal = !!originalVal;

          const newVal = (resourceRequests[namespace] || {}) as ResourceRequests;
          const changed =
            hasOriginalVal &&
            (originalVal?.cpu !== newVal?.cpu ||
              originalVal?.memory !== newVal?.memory ||
              originalVal?.storage !== newVal?.storage);

          let subnetInfo: ReactNode = null;
          if (cluster === Cluster.EMERALD) {
            if (subnetInformation[index].isLoading) {
              subnetInfo = <Loader color="blue" type="dots" />;
            } else {
              if (subnetInformation[index].data) {
                subnetInfo = (
                  <Tooltip arrowSize={10} label="IP address range for this namespace" withArrow position="top-start">
                    <p className="text-base font-semibold mb-3">{subnetInformation[index].data}</p>
                  </Tooltip>
                );
              } else {
                subnetInfo = (
                  <p className="text-base font-semibold mb-3 text-gray-500">No subnet information available</p>
                );
              }
            }
          }

          let clusterLink: ReactNode = null;
          if (licencePlate && cluster) {
            clusterLink = (
              <ExternalLink
                href={`https://console.apps.${cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}${namespaceSuffixes[namespace]}`}
              >
                {licencePlate}
                {namespaceSuffixes[namespace] || ''}
              </ExternalLink>
            );
          }

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

              {clusterLink}
              {subnetInfo}

              {resourceKeys.map((resourceKey) => {
                const oldval = String(originalVal?.[resourceKey]);
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
                      min={0}
                      max={resourceKey === 'cpu' ? 64 : resourceKey === 'memory' ? 128 : 512}
                    />
                    {hasOriginalVal && oldval !== newval && (
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

      <QuotasBudgetEstimation className="mt-10" originalData={originalResourceRequests} formData={resourceRequests} />
      {quotaContactRequired && <QuotasChangeInfo disabled={disabled} />}
    </>
  );
}
