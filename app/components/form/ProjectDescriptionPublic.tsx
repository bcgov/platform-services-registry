import { useSession } from 'next-auth/react';
import { Controller, useFormContext } from 'react-hook-form';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import MailLink from '@/components/generic/button/MailLink';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import FormSelect from '@/components/generic/select/FormSelect';
import {
  ministryOptions,
  providerOptions,
  getAllowedOptions,
  reasonForSelectingCloudProviderOptions,
  publicCloudTeamEmail,
} from '@/constants';
import { cn } from '@/utils';

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
        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
            Product name
          </label>
          <div className="mt-2">
            <input
              autoComplete="off"
              disabled={disabled}
              type="text"
              placeholder="Enter product name"
              className={cn(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
              {...register('name', {
                onChange: (e) => {
                  setValue('name', stripSpecialCharacters(e.target.value));
                },
              })}
            />
          </div>
          <p className={cn(errors.name ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Please provide a descriptive product name with no acronyms. (Only /. : + = @ _ special symbols are allowed)
          </p>
        </div>

        <div className="col-span-full">
          <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
            Description
          </label>
          <div className="mt-2">
            <textarea
              disabled={disabled}
              id="about"
              placeholder="Enter a description..."
              {...register('description')}
              rows={3}
              className={cn(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            />
          </div>
          <p className={cn(errors.description ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Please include high level consideration for the technical architecture of the solution if available
          </p>
        </div>
        <div className="sm:col-span-3 sm:mr-10">
          <FormSelect
            id="ministry"
            label="Ministry"
            disabled={disabled}
            options={[{ label: 'Select Ministry', value: '' }, ...ministryOptions]}
            selectProps={register('ministry')}
          />

          <p className={cn(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
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
          <p className={cn(errors.provider ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
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

        <div className="sm:col-span-3 sm:mr-10">
          <Controller
            name="providerSelectionReasons"
            control={control}
            defaultValue={[]}
            render={({ field: { onChange, value, onBlur } }) => (
              <FormMultiSelect
                name="providerSelectionReasons"
                label="Select reason for choosing cloud provider"
                data={reasonForSelectingCloudProviderOptions}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                classNames={{
                  wrapper: 'mb-4',
                  label: 'text-lg font-bold mb-2',
                  input: 'focus:border-blue-500 border-1.5',
                }}
              />
            )}
          />

          <p
            className={cn(
              errors.providerSelectionReasons ? 'text-red-400' : '',
              'mt-3 text-sm leading-6 text-gray-600',
            )}
          >
            Please select the main reason that led to your choice of the cloud provider.
          </p>
        </div>

        <div className="sm:col-span-3 sm:ml-10">
          <label htmlFor="providerSelectionReasonsNote" className="block text-sm font-medium leading-6 text-gray-900">
            Description of reason&#40;s&#41; for selecting cloud provider
          </label>
          <div className="mt-2">
            <textarea
              disabled={disabled}
              id="providerSelectionReasonsNote"
              placeholder="Enter a description of the reason for choosing cloud proider..."
              {...register('providerSelectionReasonsNote', {
                maxLength: {
                  value: 1000,
                  message: 'The maximum length is 1000 characters.',
                },
              })}
              rows={3}
              className={cn(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            />
          </div>
          <p
            className={cn(
              errors.providerSelectionReasonsNote ? 'text-red-400' : '',
              'mt-3 text-sm leading-6 text-gray-600',
            )}
          >
            Please provide a short description of the selected reason &#40;maximum of 1000 characters&#41;
          </p>
        </div>
      </div>
    </div>
  );
}
