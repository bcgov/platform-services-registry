import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';
import FormSelect from '@/components/generic/select/FormSelect';
import { providers, ministryOptions } from '@/constants';

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
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext();

  return (
    <div className="">
      <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-4">1. Product Description</h2>
      {mode === 'create' && (
        <p className="text-base leading-6 mt-5">
          If this is your first time on the Public Cloud Platform you need to book an alignment meeting with the Public
          Cloud Accelerator Service team. Reach out to
          {
            <a className="text-blue-600 dark:text-blue-500 hover:underline" href="mailto:cloud.pathfinder@gov.bc.ca">
              Cloud.Pathfinder@gov.bc.ca{' '}
            </a>
          }
          to get started.
        </p>
      )}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="col-span-full">
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
            Product Name
          </label>
          <div className="mt-2">
            <input
              autoComplete="off"
              disabled={disabled}
              type="text"
              placeholder="Enter product name"
              className={classNames(
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
          <p className={classNames(errors.name ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
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
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            />
          </div>
          <p className={classNames(errors.description ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
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

          <p className={classNames(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Select the government ministry that this product belongs to.
          </p>
          {['create', 'edit'].includes(mode) && <AGMinistryCheckBox disabled={disabled} />}
        </div>

        <div className="sm:col-span-3 sm:ml-10">
          <FormSelect
            id="provider"
            label="Cloud Service Provider"
            disabled={disabled || providerDisabled}
            options={[{ label: 'Select Provider', value: '' }, ...providers.map((v) => ({ label: v, value: v }))]}
            selectProps={register('provider')}
          />
          <p className={classNames(errors.provider ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
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
      </div>
    </div>
  );
}
