import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import _get from 'lodash-es/get';
import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';

interface EnvironmentsEnabled {
  production: boolean;
  development: boolean;
  test: boolean;
  tools: boolean;
}

export default function AccountEnvironmentsPublic({
  mode,
  disabled,
  selected,
}: {
  mode: string;
  disabled?: boolean;
  selected?: EnvironmentsEnabled;
}) {
  const {
    register,
    formState: { errors },
    getValues,
    setValue,
  } = useFormContext();

  return (
    <div className="">
      <div className="flex flex-col mt-2">
        {!disabled && (
          <div>
            <button
              type="button"
              onClick={() => {
                [
                  'environmentsEnabled.production',
                  'environmentsEnabled.development',
                  'environmentsEnabled.test',
                  'environmentsEnabled.tools',
                ].forEach((key) => {
                  setValue(key, true, { shouldDirty: true });
                });
              }}
              className="rounded-md bg-blue-600 text-white px-3 py-1 text-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => {
                ['production', 'development', 'test', 'tools'].forEach((key) => {
                  if (!selected || !selected[key as keyof EnvironmentsEnabled]) {
                    setValue(`environmentsEnabled.${key}`, false, { shouldDirty: true });
                  }
                });
              }}
              className="rounded-md bg-blue-600 text-white px-3 py-1 text-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ml-1"
            >
              Select None
            </button>
          </div>
        )}

        <div className="mt-1">
          <FormCheckbox
            id="production"
            inputProps={register('environmentsEnabled.production')}
            disabled={disabled || selected?.production}
          >
            Production Account
          </FormCheckbox>
        </div>
        <div className="mt-1">
          <FormCheckbox
            id="development"
            inputProps={register('environmentsEnabled.development')}
            disabled={disabled || selected?.development}
          >
            Development Account
          </FormCheckbox>
        </div>
        <div className="mt-1">
          <FormCheckbox
            id="test"
            inputProps={register('environmentsEnabled.test')}
            disabled={disabled || selected?.test}
          >
            Test Account
          </FormCheckbox>
        </div>
        <div className="mt-1">
          <FormCheckbox
            id="tools"
            inputProps={register('environmentsEnabled.tools')}
            disabled={disabled || selected?.tools}
          >
            Tools Account
          </FormCheckbox>
        </div>

        <p className="mt-2 text-sm leading-6 text-gray-600">Select how many accounts you want for your project set.</p>
        <Alert variant="light" color="blue" title="Important note" icon={<IconInfoCircle />}>
          It is not possible to remove accounts once created in your project set. You are free to add account later,
          after your project set creation, but you will not have the ability to remove created accounts.
        </Alert>

        {errors.environmentsEnabled && <p className="text-red-400 mt-1">At least one environment must be selected.</p>}
      </div>
    </div>
  );
}
