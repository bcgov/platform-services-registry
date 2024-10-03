import { Alert } from '@mantine/core';
import { IconInfoCircle, IconExclamationCircle } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import _get from 'lodash-es/get';
import { useEffect, useState } from 'react';
import { FieldError, FieldErrorsImpl, Merge, useFieldArray, useFormContext } from 'react-hook-form';
import { getQuotaChangeStatus } from '@/services/backend/private-cloud/products';
import { usePrivateProductState } from '@/states/global';
import { Quotas } from '@/validation-schemas/private-cloud';
import ExternalLink from '../generic/button/ExternalLink';

function FormError({ error }: { error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> }) {
  if (!error) return null;

  return <div className="text-sm text-red-600 mb-2">{String(error.message)}</div>;
}

export default function QuotasChangeInfo({ disabled, className }: { disabled: boolean; className?: string }) {
  const [privateProductState, privateSnap] = usePrivateProductState();
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext();

  // Monitor specific values to trigger component re-rendering.
  const quotaChanges = watch([
    'developmentQuota.cpu',
    'developmentQuota.memory',
    'developmentQuota.storage',
    'testQuota.cpu',
    'testQuota.memory',
    'testQuota.storage',
    'productionQuota.cpu',
    'productionQuota.memory',
    'productionQuota.storage',
    'toolsQuota.cpu',
    'toolsQuota.memory',
    'toolsQuota.storage',
  ]);

  const { data: quotaChangeStatus, isLoading } = useQuery({
    queryKey: [privateSnap.licencePlate, privateSnap.currentProduct, quotaChanges],
    queryFn: () => {
      const { developmentQuota, testQuota, productionQuota, toolsQuota } = getValues();
      return getQuotaChangeStatus(privateSnap.licencePlate, {
        developmentQuota,
        testQuota,
        productionQuota,
        toolsQuota,
      } as Quotas);
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
    <div className={classNames(className)}>
      <Alert className="mb-2" color="warning" title="" icon={<IconExclamationCircle />}>
        The quota changes you made require admin review. Please provide the following information:
      </Alert>
      <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900">Contact name</h3>
      <p className="text-sm leading-6 text-gray-600">
        Provide the first and last name of the product contact handling this request. This person will be contacted by
        the Platform Services team with any questions we may have about the request.{' '}
        <span className="font-bold">This person does not need to be a Product Contact.</span>
      </p>
      <div className="mt-2">
        <input
          id="quotaContactName"
          autoComplete="off"
          disabled={disabled}
          type="text"
          placeholder=""
          className={classNames(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            disabled
              ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
              : '',
          )}
          {...register('quotaContactName')}
        />
        <FormError error={_get(errors, 'quotaContactName')} />
      </div>
      <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900 mt-4">Contact email</h3>
      <p className="text-sm leading-6 text-gray-600">
        Provide the email of the product contact handling this request. This should be a professional email, but it{' '}
        <span className="font-bold">does not need to be an IDIR email address.</span>
      </p>
      <div className="mt-2">
        <input
          id="quotaContactEmail"
          autoComplete="off"
          disabled={disabled}
          type="text"
          placeholder=""
          className={classNames(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            disabled
              ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
              : '',
          )}
          {...register('quotaContactEmail')}
        />
        <FormError error={_get(errors, 'quotaContactEmail')} />
      </div>
      <h3 className="text-base 2xl:text-lg font-semibold leading-7 text-gray-900 mt-4">
        Justification of quota request
      </h3>
      <p className="text-sm leading-6 text-gray-600">Please clearly state the following:</p>
      <ol className="list-decimal pl-5 font-bold">
        <li>
          Reason for quota increase resources:{' '}
          <span className="font-normal">
            Explain why you need more resources, such as expected growth, bursty workload patterns, or specific project
            requirements.
          </span>
        </li>
        <li>
          Current resource usage:{' '}
          <span className="font-normal">
            Provide details on how many resources the important parts of your product currently consume. Additionally,
            if possible, inform us how your project&apos;s resource usage will change if we increase your quota.
          </span>
        </li>
        <li>
          Steps taken to manage current workload:{' '}
          <span className="font-normal">
            Describe the actions you&apos;ve taken to accommodate your product&apos;s workload within your current
            quota.
          </span>
        </li>
      </ol>
      <p className="mt-2">
        For a more detailed description of what the Platform Services team needs to approve your quota changes, please
        review the documentation{' '}
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-increase-for-openshift-project-set">
          on the quota increase process.
        </ExternalLink>{' '}
        Having difficulty answering the questions?{' '}
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-increase-for-openshift-project-set/#examples-of-requests">
          Read through some of the example answers to get a better idea of what information to include.
        </ExternalLink>
      </p>
      <div className="mt-2">
        <textarea
          disabled={disabled}
          id="quotaJustification"
          placeholder="Enter a justification..."
          {...register('quotaJustification')}
          rows={3}
          className={classNames(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            disabled
              ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
              : '',
          )}
        />
        <FormError error={_get(errors, 'quotaJustification')} />
      </div>
    </div>
  );
}
