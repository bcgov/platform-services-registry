import { PrivateCloudProject } from '@prisma/client';
import { useFormContext } from 'react-hook-form';
import QuotasChangeInfo from '@/components/form/QuotasChangeInfo';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '../../constants';
import QuotaInput from './QuotaInput';

const quotaOptionsLookup = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
};

export default function Quotas({
  licencePlate,
  disabled,
  currentProject,
}: {
  licencePlate: string;
  disabled: boolean;
  currentProject?: PrivateCloudProject | null | undefined;
}) {
  const namespaceSuffixes = {
    production: '-prod',
    tools: '-tools',
    test: '-test',
    development: '-dev',
  };

  const formData = useFormContext();
  const initialValues = formData.getValues();

  return (
    <div>
      <p className="text-base leading-6 mt-5">
        All quota increase requests require <b> Platform Services Team’s </b>
        approval, and must have supporting information as per the{' '}
        <ExternalLink href="https://docs.developer.gov.bc.ca/request-quota-increase-for-openshift-project-set/">
          Quota Increase Request Process
        </ExternalLink>
        . Any Quota Requests without supporting information
        <b> will not </b> be processed.
      </p>
      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-8 xl:gap-x-8 gap-y-8 sm:grid-cols-8 ">
        {(['development', 'test', 'production', 'tools'] as const).map((nameSpace) => (
          <div
            // quota !== currentQuota
            className={`sm:col-span-2 ${
              initialValues[nameSpace + 'Quota']?.cpu !==
                (currentProject as { [key: string]: any })?.[nameSpace + 'Quota']?.cpu ||
              initialValues[nameSpace + 'Quota']?.memory !==
                (currentProject as { [key: string]: any })?.[nameSpace + 'Quota']?.memory ||
              initialValues[nameSpace + 'Quota']?.storage !==
                (currentProject as { [key: string]: any })?.[nameSpace + 'Quota']?.storage
                ? 'border-2 border-purple-800 p-4 rounded-lg shadow-[0_0_15px_2px_rgba(59,130,246,0.2)]'
                : ''
            }`}
            key={nameSpace}
          >
            <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
              {nameSpace.charAt(0).toUpperCase() + nameSpace.slice(1)} Namespace
            </h3>
            <ExternalLink
              href={`https://console.apps.${currentProject?.cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licencePlate}${namespaceSuffixes[nameSpace]}`}
            >
              {licencePlate}
              {namespaceSuffixes[nameSpace] || ''}
            </ExternalLink>
            {(['cpu', 'memory', 'storage'] as const).map((quotaName) => (
              <QuotaInput
                key={quotaName}
                quotaName={quotaName}
                selectOptions={quotaOptionsLookup[quotaName]}
                licencePlate={licencePlate}
                nameSpace={nameSpace}
                disabled={disabled}
                quota={(currentProject as { [key: string]: any })?.[nameSpace + 'Quota'][quotaName]}
              />
            ))}
          </div>
        ))}
      </div>
      <QuotasChangeInfo disabled={disabled} />
    </div>
  );
}
