import { PrivateCloudProject } from '@prisma/client';
import ExternalLink from '@/components/generic/button/ExternalLink';
import QuotaInput from './QuotaInput';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '../../constants';

const quotaOptionsLookup = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
};

export default function Quotas({
  licensePlate,
  disabled,
  currentProject,
}: {
  licensePlate: string;
  disabled: boolean;
  currentProject?: PrivateCloudProject | null | undefined;
}) {
  const namespaceSuffixes = {
    production: '-prod',
    tools: '-tools',
    test: '-test',
    development: '-dev',
  };
  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        3. Quotas
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        All quota increase requests require <b> Platform Services Team’s </b>
        approval, and must have supporting information as per the{' '}
        <ExternalLink href="https://docs.developer.gov.bc.ca/request-quota-increase-for-openshift-project-set/">
          Quota Increase Request Process
        </ExternalLink>
        . Any Quota Requests without supporting information
        <b> will not </b> be processed.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-x-8 xl:gap-x-16 gap-y-8 sm:grid-cols-8 ">
        {(['production', 'test', 'tools', 'development'] as const).map((nameSpace) => (
          <div className="sm:col-span-2" key={nameSpace}>
            <h3 className="font-bcsans text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
              {nameSpace.charAt(0).toUpperCase() + nameSpace.slice(1)} Namespace
            </h3>
            <ExternalLink
              href={`https://console.apps.${currentProject?.cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licensePlate}${namespaceSuffixes[nameSpace]}`}
            >
              {licensePlate}
              {namespaceSuffixes[nameSpace] || ''}
            </ExternalLink>
            {(['cpu', 'memory', 'storage'] as const).map((quotaName) => (
              <QuotaInput
                key={quotaName}
                quotaName={quotaName}
                selectOptions={quotaOptionsLookup[quotaName]}
                licensePlate={licensePlate}
                nameSpace={nameSpace}
                disabled={disabled}
                quota={(currentProject as { [key: string]: any })?.[nameSpace + 'Quota'][quotaName]}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
