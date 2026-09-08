import { Alert, Loader, Tooltip } from '@mantine/core';
import { IconExclamationCircle } from '@tabler/icons-react';
import { useQueries } from '@tanstack/react-query';
import _startCase from 'lodash-es/startCase';
import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import ExternalLink from '@/components/generic/button/ExternalLink';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { environmentShortNames, namespaceKeys, resourceKeys } from '@/constants';
import { Cluster, ResourceRequestsEnv, ResourceRequests } from '@/prisma/client';
import { getPdbPolicyStatus, getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { cn } from '@/utils/js';
import QuotasBudgetEstimation from './QuotasBudgetEstimation';
import QuotasChangeInfo from './QuotasChangeInfo';
import QuotasDescription from './QuotasDescription';

const resourceUnit = {
  cpu: 'Core',
  memory: 'GiB',
  storage: 'GiB',
  gpu: '',
};

const resourceMaxValue = {
  cpu: 64,
  memory: 128,
  storage: 512,
  gpu: 8,
} as const;

export default function Quotas({
  disabled,
  cluster,
  isGoldDR,
  licencePlate,
  originalResourceRequests,
  quotaContactRequired = false,
  canManageGpu = false,
}: {
  disabled: boolean;
  cluster?: Cluster;
  isGoldDR?: boolean;
  licencePlate?: string;
  originalResourceRequests?: ResourceRequestsEnv;
  quotaContactRequired?: boolean;
  canManageGpu?: boolean;
}) {
  const { watch } = useFormContext();

  const [resourceRequests, formCluster] = watch(['resourceRequests', 'cluster']);

  const currentCluster = cluster ?? formCluster;

  const canShowGpu = canManageGpu && (currentCluster === Cluster.EMERALD || currentCluster === Cluster.KLAB2);

  const visibleResourceKeys = resourceKeys.filter((resourceKey) => resourceKey !== 'gpu' || canShowGpu);

  const subnetInformation = useQueries({
    queries: ['dev', 'test', 'prod', 'tools'].map((environment) => {
      return {
        queryKey: ['emerald-subnet', licencePlate, currentCluster, environment],
        queryFn: () => getSubnetForEmerald(licencePlate!, environment),
        enabled: currentCluster === Cluster.EMERALD && !!licencePlate,
      };
    }),
  });

  const pdbPolicyReports = useQueries({
    queries: namespaceKeys.map((namespace) => ({
      queryKey: ['pdb-policy-report', licencePlate, currentCluster, environmentShortNames[namespace]],
      queryFn: () => getPdbPolicyStatus(licencePlate!, currentCluster!, environmentShortNames[namespace]),
      enabled: !!licencePlate && !!currentCluster,
      staleTime: 60_000,
      retry: false,
    })),
  });

  const pdbIssues = pdbPolicyReports.flatMap((query, index) => {
    const namespace = namespaceKeys[index];

    return (query.data?.issues ?? []).map((issue) => ({
      ...issue,
      namespace,
    }));
  });

  const isPdbPolicyLoading = pdbPolicyReports.some((query) => query.isLoading);
  const hasPdbPolicyError = pdbPolicyReports.some((query) => query.isError);

  const getResourceValue = (resource: ResourceRequests | undefined, resourceKey: (typeof resourceKeys)[number]) => {
    if (resourceKey === 'gpu') {
      return resource?.gpu ?? 0;
    }

    return resource?.[resourceKey];
  };

  return (
    <>
      <QuotasDescription />
      {isPdbPolicyLoading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-600">
          <Loader size="sm" type="dots" />
          Checking PodDisruptionBudget status…
        </div>
      )}

      {pdbIssues.length > 0 && (
        <Alert
          variant="light"
          color="red"
          title="PodDisruptionBudget configuration issues"
          icon={<IconExclamationCircle size={20} />}
          className="mt-6"
        >
          <p className="mb-3">The following namespaces contain PodDisruptionBudgets that may block pod eviction:</p>

          <div className="space-y-3">
            {pdbIssues.map((issue) => (
              <div
                key={`${issue.namespace}-${issue.reportName}-${issue.rule}`}
                className="rounded-md border border-red-200 bg-white/60 px-3 py-2"
              >
                <p className="font-semibold">{_startCase(issue.namespace)} Namespace</p>

                {issue.resourceName && (
                  <p className="text-sm">
                    <strong>Resource:</strong> {issue.resourceName}
                  </p>
                )}

                {issue.message && <p className="text-sm text-gray-700">{issue.message}</p>}
              </div>
            ))}
          </div>
        </Alert>
      )}

      {hasPdbPolicyError && (
        <Alert
          variant="light"
          color="yellow"
          title="Unable to check all PodDisruptionBudget statuses"
          icon={<IconExclamationCircle size={20} />}
          className="mt-6"
        >
          Registry could not retrieve the PolicyReport for one or more namespaces.
        </Alert>
      )}

      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-4 xl:gap-x-4 gap-y-8 sm:grid-cols-8 ">
        {namespaceKeys.map((namespace, index) => {
          const originalVal = originalResourceRequests?.[namespace];
          const hasOriginalVal = !!originalVal;

          const newVal = (resourceRequests[namespace] || {}) as ResourceRequests;
          const changed =
            hasOriginalVal &&
            visibleResourceKeys.some(
              (resourceKey) => getResourceValue(originalVal, resourceKey) !== getResourceValue(newVal, resourceKey),
            );

          let subnetInfo: ReactNode = null;
          if (currentCluster === Cluster.EMERALD) {
            if (subnetInformation[index].isLoading) {
              subnetInfo = <Loader color="blue" type="dots" />;
            } else if (subnetInformation[index].data) {
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

          let clusterLink: ReactNode = null;
          if (licencePlate && currentCluster) {
            clusterLink = (
              <ExternalLink
                href={`https://console.apps.${currentCluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}-${environmentShortNames[namespace]}`}
              >
                {licencePlate}-{environmentShortNames[namespace] || ''}
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

              {visibleResourceKeys.map((resourceKey) => {
                const oldval = String(getResourceValue(originalVal, resourceKey));
                const newval = String(getResourceValue(newVal, resourceKey));

                return (
                  <div key={resourceKey}>
                    <HookFormTextInput
                      label={
                        resourceUnit[resourceKey]
                          ? `${resourceKey.toUpperCase()} (${resourceUnit[resourceKey]})`
                          : resourceKey.toUpperCase()
                      }
                      name={`resourceRequests.${namespace}.${resourceKey}`}
                      type="number"
                      step={resourceKey === 'cpu' ? 0.5 : 1}
                      placeholder="0"
                      required
                      disabled={disabled}
                      classNames={{ wrapper: 'mt-3' }}
                      options={{ valueAsNumber: true }}
                      min={0}
                      max={resourceMaxValue[resourceKey]}
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

      <QuotasBudgetEstimation
        className="mt-10"
        originalData={originalResourceRequests}
        formData={resourceRequests}
        isGoldDR={isGoldDR ?? false}
      />
      {quotaContactRequired && <QuotasChangeInfo disabled={disabled} />}
    </>
  );
}
