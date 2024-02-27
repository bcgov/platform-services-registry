'use client';

import classNames from '@/components/utils/classnames';
import { useFormContext } from 'react-hook-form';
import { providers, ministriesNames, AGMinistries } from '@/constants';
import { useState } from 'react';
import AGMinistryCheckBox from '@/components/form/AGMinistryCheckBox';

export default function ProjectDescriptionPublic({
  disabled,
  providerDisabled,
  isCreatePage,
  isAGMinistry,
  setIsAGMinistry,
}: {
  disabled?: boolean;
  providerDisabled?: boolean;
  isCreatePage?: boolean;
  isAGMinistry?: boolean;
  setIsAGMinistry?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [isCheckBoxShown, setIsCheckBoxShown] = useState<boolean>(false);

  const handleSelectMinistryChange = (event: { target: { value: string } }) => {
    if (AGMinistries.indexOf(event.target.value) !== -1) {
      setIsCheckBoxShown(true);
      if (setIsAGMinistry) setIsAGMinistry(false);
    }
  };

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-4">
        BC Gov’s Landing Zone in AWS
      </h1>
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-4 text-gray-900 2xl:mt-14">
        1. Product Description
      </h2>
      {isCreatePage && (
        <p className="font-bcsans text-base leading-6 mt-5">
          If this is your first time on the Public Cloud Platform you need to book an alignment meeting with the Public
          Cloud Accelerator Service team. Reach out to
          {
            <a className="text-blue-600 dark:text-blue-500 hover:underline" href="mailto:cloud.pathfinder@gov.bc.ca">
              {' '}
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
              {...register('name')}
            />
          </div>
          <p className={classNames(errors.name ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
            Please provide a descriptive product name with no acronyms {errors.name?.message?.toString()}
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
          <label htmlFor="ministry" className="block text-sm font-medium leading-6 text-gray-900">
            Ministry
          </label>
          <div className="mt-2">
            <select
              disabled={disabled}
              id="ministry"
              {...register('ministry')}
              onChange={handleSelectMinistryChange}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            >
              <option value="">Select Ministry</option>
              {ministriesNames.map((ministry) => (
                <option key={ministry.id} value={ministry.name}>
                  {ministry.humanFriendlyName}
                </option>
              ))}
            </select>

            <p className={classNames(errors.ministry ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Select the government ministry that this product belongs to
            </p>
            {isCheckBoxShown && (
              <AGMinistryCheckBox
                disabled={disabled}
                isCheckBoxShown={isCheckBoxShown}
                isAGMinistry={isAGMinistry}
                setIsAGMinistry={setIsAGMinistry}
              />
            )}
          </div>
        </div>

        <div className="sm:col-span-3 sm:ml-10">
          <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
            Cloud Service Provider
          </label>
          <div className="mt-2">
            <select
              disabled={disabled || providerDisabled}
              {...register('provider')}
              className={classNames(
                'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                disabled || providerDisabled
                  ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
                  : '',
              )}
            >
              <option value="">Select Provider</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
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
    </div>
  );
}
