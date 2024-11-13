import { useSession } from 'next-auth/react';
import { Controller, useFormContext } from 'react-hook-form';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import MailLink from '@/components/generic/button/MailLink';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import FormSelect from '@/components/generic/select/FormSelect';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import {
  ministryOptions,
  providerOptions,
  getAllowedOptions,
  reasonForSelectingCloudProviderOptions,
  publicCloudTeamEmail,
} from '@/constants';
import { cn } from '@/utils';
import HookFormTextInput from '../generic/input/HookFormTextInput';

function stripSpecialCharacters(text: string) {
  const pattern = /[^A-Za-z0-9///.:+=@_ ]/g;
  return text.replace(pattern, '');
}

export default function ProjectDescriptionPublic({
  mode,
  disabled,
  providerDisabled,
}: {
  mode: string;
  disabled?: boolean;
  providerDisabled?: boolean;
}) {
  const { data: session } = useSession();

  const {
    register,
    formState: { errors },
    getValues,
    setValue,
    control,
  } = useFormContext();

  if (!session) return null;

  return (
    <div className="">
      {mode === 'create' && (
        <p className="text-base leading-6 mt-5">
          If this is your first time on the Public Cloud Platform you need to book an alignment meeting with the Public
          Cloud Accelerator Service team. Reach out to <MailLink to={publicCloudTeamEmail} /> to get started.
        </p>
      )}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <HookFormTextInput
          label="Product name"
          name="name"
          placeholder="Enter product name"
          disabled={disabled}
          required
          options={{
            onChange: (e) => {
              setValue('name', stripSpecialCharacters(e.target.value));
            },
          }}
          error="Please provide a descriptive product name with no acronyms. (Only /. : + = @ _ special symbols are allowed)"
          classNames={{ wrapper: 'col-span-full mt-2' }}
        />

        <HookFormTextarea
          label="Description"
          name="description"
          placeholder="Enter description..."
          required
          error="Please include high level consideration for the technical architecture of the solution if available"
          classNames={{ wrapper: 'col-span-full' }}
          disabled={disabled}
        />

        <div className="sm:col-span-3 sm:mr-10">
          <FormSelect
            id="ministry"
            label="Ministry"
            disabled={disabled}
            options={[{ label: 'Select Ministry', value: '' }, ...ministryOptions]}
            selectProps={register('ministry')}
          />

          <p className={cn(errors.ministry ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
            Select the government ministry that this product belongs to.
          </p>
          {['create', 'edit'].includes(mode) && <AGMinistryCheckBox disabled={disabled} />}
        </div>

        <div className="sm:col-span-3 sm:ml-10">
          <FormSelect
            id="provider"
            label="Cloud Service Provider"
            disabled={disabled || providerDisabled}
            options={[
              { label: 'Select Provider', value: '' },
              ...(disabled ? providerOptions : getAllowedOptions(session)),
            ]}
            selectProps={register('provider')}
          />
          <p className={cn(errors.provider ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
            Select the Cloud Service Provider. Read more about Public Cloud Service Providers{' '}
            <a
              href="https://digital.gov.bc.ca/cloud/services/public/providers/"
              className="text-blue-500 hover:text-blue-700"
            >
              here
            </a>
            .
          </p>
        </div>

        <HookFormMultiSelect
          name="providerSelectionReasons"
          label="Select reason for choosing cloud provider"
          data={reasonForSelectingCloudProviderOptions}
          classNames={{ wrapper: 'sm:col-span-3 sm:mr-10' }}
          required
          error="Please select the main reason that led to your choice of the cloud provider"
          disabled={disabled}
        />

        <HookFormTextarea
          label="Description of reason(s) for selecting cloud provider"
          name="providerSelectionReasonsNote"
          placeholder="Enter reason(s)..."
          required
          error="Please provide a short description of the selected reason (maximum of 1000 characters)"
          classNames={{ wrapper: 'sm:col-span-3 sm:ml-10' }}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
