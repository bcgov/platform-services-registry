import { PrivateCloudProject, Quota } from '@prisma/client';
import classNames from 'classnames';
import _startCase from 'lodash-es/startCase';
import { useFormContext } from 'react-hook-form';
import QuotasChangeInfo from '@/components/form/QuotasChangeInfo';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { resourceOptions } from '@/constants';
import QuotaInput from './QuotaInput';

const namespaceSuffixes = {
  development: '-dev',
  test: '-test',
  production: '-prod',
  tools: '-tools',
};

type namespaceKeyType = keyof typeof namespaceSuffixes;

const namespaceKeys = Object.keys(namespaceSuffixes) as namespaceKeyType[];

export default function Quotas({
  licencePlate,
  disabled,
  currentProject,
}: {
  licencePlate: string;
  disabled: boolean;
  currentProject?: PrivateCloudProject | null | undefined;
}) {
  const formData = useFormContext();
  const newValues = formData.getValues();

  if (!currentProject) return null;

  return (
    <>
      <p className="text-base leading-6 mt-5">
        All quota increase requests require <span className="font-bold">Platform Services Team&rsquo;s</span>
        &nbsp;approval, and must have supporting information as per the&nbsp;
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-adjustment-for-openshift-project-set/">
          Quota Increase Request Process
        </ExternalLink>
        . Any Quota Requests without supporting information&nbsp;
        <span className="font-bold text-red-600 uppercase">will not</span> be processed.
      </p>
      <div className="mt-10 mb-5 grid grid-cols-1 gap-x-4 xl:gap-x-4 gap-y-8 sm:grid-cols-8 ">
        {namespaceKeys.map((namespace) => {
          const quotaField = (namespace + 'Quota') as keyof PrivateCloudProject;
          const originalEnvQuota = currentProject[quotaField] as Quota;
          const newEnvQuota = newValues[quotaField];
          const hasResourceChange =
            newEnvQuota?.cpu !== originalEnvQuota?.cpu ||
            newEnvQuota?.memory !== originalEnvQuota?.memory ||
            newEnvQuota?.storage !== originalEnvQuota?.storage;

          return (
            <div
              key={namespace}
              className={classNames('sm:col-span-2 py-3 px-5 rounded-lg border-2', {
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
      <QuotasChangeInfo disabled={disabled} />
    </>
  );
}
