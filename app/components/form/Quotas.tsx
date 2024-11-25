import { Loader } from '@mantine/core';
import { Cluster, PrivateCloudProject, Quota } from '@prisma/client';
import { useQueries } from '@tanstack/react-query';
import _replace from 'lodash-es/replace';
import _startCase from 'lodash-es/startCase';
import { useFormContext } from 'react-hook-form';
import QuotasChangeInfo from '@/components/form/QuotasChangeInfo';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { resourceOptions } from '@/constants';
import { getSubnetForEmerald } from '@/services/backend/private-cloud/products';
import { cn } from '@/utils';
import QuotaInput from './QuotaInput';

const namespaceSuffixes = {
  development: '-dev',
  test: '-test',
  production: '-prod',
  tools: '-tools',
};

type namespaceKeyType = keyof typeof namespaceSuffixes;

const namespaceKeys = Object.keys(namespaceSuffixes) as namespaceKeyType[];

const environments = Object.values(namespaceSuffixes).map((value) => _replace(value, '-', ''));

export default function Quotas({
  licencePlate,
  disabled,
  currentProject,
  quotaContactRequired = false,
}: {
  licencePlate: string;
  disabled: boolean;
  currentProject?: PrivateCloudProject | null | undefined;
  quotaContactRequired?: boolean;
}) {
  const { watch } = useFormContext();

  const [developmentQuota, testQuota, toolsQuota, productionQuota] = watch([
    'developmentQuota',
    'testQuota',
    'toolsQuota',
    'productionQuota',
  ]);

  const subnetInformation = useQueries({
    queries: environments.map((environment) => {
      return {
        queryKey: [licencePlate, environment],
        queryFn: () => getSubnetForEmerald(licencePlate, environment),
        enabled: currentProject?.cluster === Cluster.EMERALD && !!licencePlate,
      };
    }),
  });

  if (!currentProject) return null;

  const newValues = {
    developmentQuota,
    testQuota,
    toolsQuota,
    productionQuota,
  };

  return (
    <>
      <p className="text-base leading-6 mt-5">
        Increasing your quota requires the Platform Services Team&rsquo;s approval, and must have supporting information
        as per our&nbsp;
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-adjustment-for-openshift-project-set/">
          quota adjustment documentation
        </ExternalLink>
        . Any quota increases without supporting information&nbsp;
        <span className="font-bold text-red-600 uppercase">will not</span> be processed.
      </p>
      <p className="text-base leading-6 mt-5">
        If your request for more CPU and Memory meets all of the following requirements, it will be automatically
        approved:
        <ol className="list-decimal pl-5">
          <li>Your namespace’s current usage exceeds 85% of its total limit.</li>
          <li>Your namespace’s resource utilization rate is at least 35%.</li>
          <li>You are increasing your quota allotment to the next tier only.</li>
        </ol>
      </p>
      <p className="text-base leading-6 mt-5">
        If your request for more Storage meets all of the following requirements, it will be automatically approved:
        <ol className="list-decimal pl-5">
          <li>Your namespace’s current usage exceeds 80% of its PVC limit.</li>
          <li>You are increasing your quota allotment to the next tier only.</li>
        </ol>
      </p>

      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-4 xl:gap-x-4 gap-y-8 sm:grid-cols-8 ">
        {namespaceKeys.map((namespace, index) => {
          const quotaField = (namespace + 'Quota') as keyof typeof newValues;
          const originalEnvQuota = currentProject[quotaField] as Quota;
          const newEnvQuota = newValues[quotaField];
          const hasResourceChange =
            newEnvQuota?.cpu !== originalEnvQuota?.cpu ||
            newEnvQuota?.memory !== originalEnvQuota?.memory ||
            newEnvQuota?.storage !== originalEnvQuota?.storage;

          return (
            <div
              key={namespace}
              className={cn('sm:col-span-2 py-3 px-5 rounded-lg border-2', {
                'border-purple-800 shadow-[0_0_15px_2px_rgba(59,130,246,0.2)]': hasResourceChange,
                'border-transparent': !hasResourceChange,
              })}
            >
              <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
                {_startCase(namespace)} Namespace
              </h3>
              <ExternalLink
                href={`https://console.apps.${currentProject.cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}${namespaceSuffixes[namespace]}`}
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

              {(['cpu', 'memory', 'storage'] as const).map((quotaName) => (
                <QuotaInput
                  key={quotaName}
                  quotaName={quotaName}
                  selectOptions={resourceOptions[quotaName]}
                  licencePlate={licencePlate}
                  nameSpace={namespace}
                  disabled={disabled}
                  quota={(currentProject as { [key: string]: any })?.[namespace + 'Quota'][quotaName]}
                />
              ))}
            </div>
          );
        })}
      </div>
      {quotaContactRequired && <QuotasChangeInfo disabled={disabled} />}
    </>
  );
}
