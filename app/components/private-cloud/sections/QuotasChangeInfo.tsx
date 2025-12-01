import { Alert } from '@mantine/core';
import { IconInfoCircle, IconExclamationCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import ExternalLink from '@/components/generic/button/ExternalLink';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { getQuotaChangeStatus } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { cn } from '@/utils/js';

export default function QuotasChangeInfo({ disabled, className }: { disabled: boolean; className?: string }) {
  const [privateProductState, privateSnap] = usePrivateProductState();
  const { watch, setValue, getValues } = useFormContext();

  const [resourceRequestsWatch] = watch(['resourceRequests']);

  const { data: quotaChangeStatus, isLoading } = useQuery({
    queryKey: [privateSnap.licencePlate, privateSnap.currentProduct, resourceRequestsWatch],
    queryFn: () => {
      const { resourceRequests } = getValues();
      return getQuotaChangeStatus(privateSnap.licencePlate, resourceRequests);
    },
  });

  useEffect(() => {
    if (!quotaChangeStatus) return;

    if (quotaChangeStatus.isEligibleForAutoApproval) {
      setValue('quotaContactName', '');
      setValue('quotaContactEmail', '');
      setValue('quotaJustification', '');
    }

    privateProductState.editQuotaChangeStatus = quotaChangeStatus;
  }, [quotaChangeStatus]);

  if (isLoading || !quotaChangeStatus) return null;
  if (!quotaChangeStatus.hasChange) return null;

  if (quotaChangeStatus.isEligibleForAutoApproval) {
    return (
      <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />}>
        The quota changes you made are eligible for auto-approval.
      </Alert>
    );
  }

  return (
    <div className={cn(className)}>
      <Alert className="mb-2" color="warning" title="" icon={<IconExclamationCircle />}>
        The quota changes you made require admin review. Please provide the following information:
      </Alert>
      <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900">Contact name</h3>
      <p className="text-sm leading-6 text-gray-600">
        Provide the first and last name of the product contact handling this request. This person will be contacted by
        the Platform Services team with any questions we may have about the request.&nbsp;
        <span className="font-bold">This person does not need to be a Product Contact.</span>
      </p>

      <HookFormTextInput name="quotaContactName" disabled={disabled} required classNames={{ wrapper: 'mt-2' }} />

      <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900 mt-4">Contact email</h3>
      <p className="text-sm leading-6 text-gray-600">
        Provide the email of the product contact handling this request. This should be a professional email, but
        it&nbsp;<span className="font-bold">does not need to be an IDIR email address.</span>
      </p>

      <HookFormTextInput name="quotaContactEmail" disabled={disabled} required classNames={{ wrapper: 'mt-2' }} />

      <h3 className="text-lg font-semibold leading-7 text-gray-900 mt-4">Justification of quota increase</h3>
      <p className="leading-6 text-gray-600">Please clearly state the following:</p>
      <ol className="list-decimal pl-5 font-bold">
        <li>
          Reason for quota increase:&nbsp;
          <span className="font-normal">
            Explain why you need more resources, such as expected growth, bursty workload patterns, or specific project
            requirements.
          </span>
        </li>
        <li>
          Current resource usage:&nbsp;
          <span className="font-normal">
            Provide details on how many resources the important parts of your product currently consume. Additionally,
            if possible, inform us how your project&apos;s resource usage will change if we increase your quota.
          </span>
        </li>
        <li>
          Steps taken to manage current workload:&nbsp;
          <span className="font-normal">
            Describe the actions you&apos;ve taken to accommodate your product&apos;s workload within your current
            quota.
          </span>
        </li>
      </ol>
      <p className="mt-2">
        For a more detailed description of what the Platform Services team needs to approve your quota changes, please
        review the documentation&nbsp;
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-adjustment-for-openshift-project-set/">
          on the quota increase process.
        </ExternalLink>
        &nbsp; Having difficulty answering the questions?&nbsp;
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-adjustment-for-openshift-project-set/#examples-of-requests">
          Read through some of the example answers to get a better idea of what information to include.
        </ExternalLink>
      </p>

      <HookFormTextarea
        label="Description of reason(s) for selecting cloud provider"
        name="quotaJustification"
        placeholder="Enter a justification..."
        required
        classNames={{ wrapper: 'mt-2' }}
        disabled={disabled}
      />
    </div>
  );
}
