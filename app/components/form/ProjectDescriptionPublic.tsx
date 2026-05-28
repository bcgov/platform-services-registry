import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSnapshot } from 'valtio';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import MailLink from '@/components/generic/button/MailLink';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import FormSelect from '@/components/generic/select/FormSelect';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import {
  providerOptions,
  getAllowedOptions,
  reasonForSelectingCloudProviderOptions,
  publicCloudTeamEmail,
} from '@/constants';
import { Provider } from '@/prisma/client';
import { appState } from '@/states/global';
import { cn } from '@/utils/js';
import HookFormTextInput from '../generic/input/HookFormTextInput';
import FormRadioGroup from '../generic/select/FormRadioGroup';

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
  const appSnapshot = useSnapshot(appState);
  const { data: session } = useSession();
  const networkingDisabled = !session?.permissions.editPublicCloudNetworking;
  const {
    register,
    formState: { errors, submitCount },
    getValues,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useFormContext();
  const provider = watch('provider');

  useEffect(() => {
    if (provider !== Provider.AZURE) {
      setValue('requiresNetworking', false, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setValue('networkingReason', '', {
        shouldDirty: true,
        shouldValidate: true,
      });

      [
        'environmentsEnabled.productionRequiresNetworking',
        'environmentsEnabled.developmentRequiresNetworking',
        'environmentsEnabled.testRequiresNetworking',
        'environmentsEnabled.toolsRequiresNetworking',
      ].forEach((key) => {
        setValue(key, false, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    }
  }, [provider, setValue]);

  const requiresNetworking = watch('requiresNetworking');
  const networkingReason = watch('networkingReason');

  useEffect(() => {
    if (submitCount === 0) return;

    if (requiresNetworking && !networkingReason?.trim()) {
      setError('networkingReason', {
        type: 'manual',
        message: 'Networking reason is required.',
      });
    } else {
      clearErrors('networkingReason');
    }
  }, [submitCount, requiresNetworking, networkingReason, setError, clearErrors]);

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
            id="organizationId"
            label="Ministry"
            disabled={disabled}
            options={[{ label: 'Select Ministry', value: '' }, ...appSnapshot.info.ORGANIZATION_OPTIONS]}
            selectProps={register('organizationId')}
          />

          <p className={cn(errors.organizationId ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
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
              ...(disabled ? providerOptions : getAllowedOptions(mode === 'create')),
            ]}
            selectProps={register('provider')}
          />
          <p className={cn(errors.provider ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
            Select the Cloud Service Provider. Read more about Public Cloud Service Providers{' '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://digital.gov.bc.ca/technology/cloud/public/intro/#providers"
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

        {provider === Provider.AZURE && (
          <div className="sm:col-span-3 sm:mr-10">
            <FormRadioGroup
              id="requiresNetworking"
              label="Does your project require networking?"
              options={[
                { label: 'No', value: 'false' },
                { label: 'Yes', value: 'true' },
              ]}
              value={String(watch('requiresNetworking') ?? '')}
              onChange={(value) => {
                const requiresNetworking = value === 'true';

                setValue('requiresNetworking', requiresNetworking, {
                  shouldDirty: true,
                  shouldValidate: false,
                });

                if (!requiresNetworking) {
                  setValue('networkingReason', '', {
                    shouldDirty: true,
                    shouldValidate: false,
                  });
                }
              }}
              disabled={disabled || networkingDisabled}
            />

            <p className="mt-3 text-sm leading-6 text-gray-600">
              You can enable this later if needed. Not sure?{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://citz-do.atlassian.net/servicedesk/customer/portal/3/group/11/create/228"
                className="text-blue-500 hover:text-blue-700"
              >
                Book a quick consult
              </a>
              {'.'}
            </p>

            {watch('requiresNetworking') && (
              <HookFormTextarea
                label="Please describe why your project requires networking"
                name="networkingReason"
                placeholder="Enter networking requirements..."
                required
                classNames={{ wrapper: 'sm:col-span-3 sm:mr-10' }}
                disabled={disabled || networkingDisabled}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
