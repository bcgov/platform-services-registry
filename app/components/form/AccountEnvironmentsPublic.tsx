import { Alert, Button } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import FormCheckbox from '@/components/generic/checkbox/FormCheckbox';
import { publicCloudEnvironments, PublicCloudEnvironmentKey } from '@/constants/public-cloud';
import { Provider } from '@/prisma/client';
interface EnvironmentsEnabled {
  production: boolean;
  productionRequiresNetworking?: boolean;
  development: boolean;
  developmentRequiresNetworking?: boolean;
  test: boolean;
  testRequiresNetworking?: boolean;
  tools: boolean;
  toolsRequiresNetworking?: boolean;
}

type EnvironmentKey = PublicCloudEnvironmentKey;
const environments = publicCloudEnvironments;

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
    watch,
    setValue,
  } = useFormContext();

  const isAzure = watch('provider') === Provider.AZURE;
  const requiresNetworking = watch('requiresNetworking');

  const renderNetworkingCheckbox = (key: EnvironmentKey) => {
    if (!isAzure) return null;
    const environmentEnabled = watch(`environmentsEnabled.${key}`);
    const networkingField = `environmentsEnabled.${key}RequiresNetworking`;

    return (
      <div className="ml-4 mt-1 border-l border-gray-300 pl-3">
        <FormCheckbox
          id={`${key}-requires-networking`}
          inputProps={register(networkingField)}
          disabled={disabled || !requiresNetworking || !environmentEnabled}
        >
          Requires networking
        </FormCheckbox>
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex flex-col mt-2">
        {!disabled && (
          <div>
            <Button
              color="primary"
              size="compact-sm"
              onClick={() => {
                environments.forEach(({ key }) => {
                  setValue(`environmentsEnabled.${key}`, true, { shouldDirty: true });
                });
              }}
            >
              Select All
            </Button>
            <Button
              color="primary"
              size="compact-sm"
              onClick={() => {
                environments.forEach(({ key }) => {
                  if (!selected?.[key]) {
                    setValue(`environmentsEnabled.${key}`, false, { shouldDirty: true });
                    setValue(`environmentsEnabled.${key}RequiresNetworking`, false, { shouldDirty: true });
                  }
                });
              }}
              className="ml-1"
            >
              Select None
            </Button>
          </div>
        )}

        {environments.map(({ key, label }) => {
          return (
            <div className="mt-1" key={key}>
              <FormCheckbox
                id={key}
                inputProps={{
                  ...register(`environmentsEnabled.${key}`, {
                    onChange: (e) => {
                      if (!e.target.checked) {
                        setValue(`environmentsEnabled.${key}RequiresNetworking`, false, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    },
                  }),
                }}
                disabled={disabled || selected?.[key]}
              >
                {label}
              </FormCheckbox>

              {renderNetworkingCheckbox(key)}
            </div>
          );
        })}
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
