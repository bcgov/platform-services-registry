import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import classNames from '@/utils/classnames';
import { PrivateCloudProject, Quota } from '@prisma/client';
import { DefaultCpuOptionsSchema, DefaultMemoryOptionsSchema, DefaultStorageOptionsSchema } from '@/schema';

type CpuOptionKeys = z.infer<typeof DefaultCpuOptionsSchema>;
type MemoryOptionKeys = z.infer<typeof DefaultMemoryOptionsSchema>;
type StorageOptionKeys = z.infer<typeof DefaultStorageOptionsSchema>;

type QuotaOptions<K extends string = any> = {
  [key in K]: string;
};

export const defaultCpuOptionsLookup: QuotaOptions<CpuOptionKeys> = {
  CPU_REQUEST_0_5_LIMIT_1_5: '0.5 CPU Request, 1.5 CPU Limit',
  CPU_REQUEST_1_LIMIT_2: '1 CPU Request, 2 CPU Limit',
  CPU_REQUEST_2_LIMIT_4: '2 CPU Request, 4 CPU Limit',
  CPU_REQUEST_4_LIMIT_8: '4 CPU Request, 8 CPU Limit',
  CPU_REQUEST_8_LIMIT_16: '8 CPU Request, 16 CPU Limit',
  CPU_REQUEST_16_LIMIT_32: '16 CPU Request, 32 CPU Limit',
  CPU_REQUEST_32_LIMIT_64: '32 CPU Request, 64 CPU Limit',
  CPU_REQUEST_64_LIMIT_128: '64 CPU Request, 128 CPU Limit',
};

export const defaultMemoryOptionsLookup: QuotaOptions<MemoryOptionKeys> = {
  MEMORY_REQUEST_2_LIMIT_4: '2 GB Request, 4 GB Limit',
  MEMORY_REQUEST_4_LIMIT_8: '4 GB Request, 8 GB Limit',
  MEMORY_REQUEST_8_LIMIT_16: '8 GB Request, 16 GB Limit',
  MEMORY_REQUEST_16_LIMIT_32: '16 GB Request, 32 GB Limit',
  MEMORY_REQUEST_32_LIMIT_64: '32 GB Request, 64 GB Limit',
  MEMORY_REQUEST_64_LIMIT_128: '64 GB Request, 128 GB Limit',
};

export const defaultStorageOptionsLookup: QuotaOptions<StorageOptionKeys> = {
  STORAGE_1: '1 GB',
  STORAGE_2: '2 GB',
  STORAGE_4: '4 GB',
  STORAGE_16: '16 GB',
  STORAGE_32: '32 GB',
  STORAGE_64: '64 GB',
  STORAGE_128: '128 GB',
  STORAGE_256: '256 GB',
  STORAGE_512: '512 GB',
};

type QuotaOptionsLookup = {
  cpu: QuotaOptions;
  memory: QuotaOptions;
  storage: QuotaOptions;
};

const quotaOptionsLookup: QuotaOptionsLookup = {
  cpu: defaultCpuOptionsLookup,
  memory: defaultMemoryOptionsLookup,
  storage: defaultStorageOptionsLookup,
};

function QuotaInput({
  quotaName,
  nameSpace,
  licensePlate,
  selectOptions,
  disabled,
  quota,
}: {
  quotaName: 'cpu' | 'memory' | 'storage';
  nameSpace: 'production' | 'test' | 'development' | 'tools';
  licensePlate: string;
  selectOptions: QuotaOptions;
  disabled: boolean;
  quota: string | null;
}) {
  const {
    register,
    formState: { errors },
    getValues,
  } = useFormContext();

  // Get the current quota value
  const initialValues = getValues();
  const initialQuota = initialValues[nameSpace + 'Quota'];
  const currentQuota = initialQuota?.[quotaName];

  // Make quotaName start with uppercase letter
  const quotaNameStartUpperCase = quotaName.charAt(0).toUpperCase() + quotaName.slice(1);

  return (
    <div className="mb-4">
      <label htmlFor={quotaName} className="block text-sm leading-6 font-bold text-gray-900 mt-8">
        {quotaName.toUpperCase()}
      </label>
      <div className="mt-2">
        <select
          defaultValue={''}
          id={quotaName + nameSpace}
          {...register(nameSpace + 'Quota.' + quotaName)}
          disabled={disabled}
          className={classNames(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
            disabled
              ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
              : '',
          )}
        >
          <option value="" disabled>
            Select {quotaNameStartUpperCase}
          </option>
          {Object.entries(selectOptions).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
          {!Object.keys(selectOptions).includes(currentQuota) && (
            <option key={currentQuota} value={currentQuota}>
              {currentQuota}
            </option>
          )}
        </select>
        {(errors?.[nameSpace + 'Quota'] as { [key: string]: any })?.[quotaName] && (
          <p className="text-red-400 mt-3 text-sm leading-6">
            Select the {quotaName} for the {nameSpace} namespace
          </p>
        )}
        {quota ? (
          <div>
            <p className="mt-3 text-sm leading-6 text-gray-700">
              <b>Current {quotaName}: </b>
              {selectOptions[quota] || currentQuota}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

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
        <a
          href="https://docs.developer.gov.bc.ca/request-quota-increase-for-openshift-project-set/"
          className="text-blue-500 hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          Quota Increase Request Process
        </a>
        . Any Quota Requests without supporting information
        <b> will not </b> be processed.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-x-8 xl:gap-x-16 gap-y-8 sm:grid-cols-8 ">
        {(['production', 'test', 'tools', 'development'] as const).map((nameSpace) => (
          <div className="sm:col-span-2" key={nameSpace}>
            <h3 className="font-bcsans text-base 2xl:text-lg font-semibold leading-7 text-gray-900">
              {nameSpace.charAt(0).toUpperCase() + nameSpace.slice(1)} Namespace
            </h3>

            <span>
              <a
                className="text-blue-500 hover:text-blue-400"
                href={`https://console.apps.${currentProject?.cluster}.devops.gov.bc.ca/k8s/cluster/projects/${licensePlate}${namespaceSuffixes[nameSpace]}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {licensePlate}
                {namespaceSuffixes[nameSpace] || ''}
              </a>
            </span>

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
