'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { SecurityConfig, ProjectContext } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import _get from 'lodash-es/get';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { success, failure } from '@/components/notification';
import { getSecurityConfig, upsertSecurityConfig } from '@/services/backend/security-config';
import { securityConfigSchema } from '@/validation-schemas/security-config';

export default function Repository({ params: getParams }: { params: Promise<{ licencePlate: string }> }) {
  const [params, setParams] = useState<{ licencePlate: string }>({ licencePlate: '' });

  useEffect(() => {
    getParams.then((v) => setParams(v));
  }, [getParams]);

  const methods = useForm<SecurityConfig>({
    resolver: zodResolver(securityConfigSchema),
    defaultValues: {
      context: ProjectContext.PRIVATE,
      clusterOrProvider: '',
      licencePlate: params.licencePlate,
      repositories: [{ url: 'https://' }],
    },
  });

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = methods;

  const {
    data: current,
    isLoading: isFetching,
    isError: isFetchingError,
    error: fetchingError,
  } = useQuery<{ config: SecurityConfig; project: { cluster: string; provider: string } }, Error>({
    queryKey: ['securityConfig', params.licencePlate],
    queryFn: () => getSecurityConfig(params.licencePlate, ProjectContext.PRIVATE),
    enabled: !!params.licencePlate,
  });

  const {
    mutateAsync,
    isPending: isUpdating,
    isError: isUpdatingError,
    error: updatingError,
  } = useMutation({
    mutationFn: upsertSecurityConfig,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'repositories',
  });

  useEffect(() => {
    if (!current) return;

    if (current.project?.cluster) setValue('clusterOrProvider', current.project.cluster);
    if (current.config?.repositories) setValue('repositories', current.config.repositories);
  }, [setValue, current]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (isFetchingError) {
    return <div>{String(fetchingError)}</div>;
  }

  if (isUpdating) {
    return <div>Updating...</div>;
  }

  if (isUpdatingError) {
    return <div>{String(updatingError)}</div>;
  }

  const values = getValues();

  return (
    <div>
      <h2 className="text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 mb-2">Repository URLs</h2>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(async (data) => {
            await mutateAsync(data);
            success();
          })}
        >
          <ul>
            {fields.map((item, index) => (
              <li key={item.id}>
                <div className="flex mb-1">
                  <HookFormTextInput
                    name={`repositories.${index}.url`}
                    placeholder="https://"
                    classNames={{ wrapper: 'flex-auto' }}
                  />

                  <Button color="danger" onClick={() => remove(index)} className="ml-1">
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {values.repositories.length < 10 && (
            <Button color="primary" onClick={() => append({ url: 'https://' })}>
              Add New
            </Button>
          )}

          <Button type="submit" color="success" className="ml-1">
            Submit
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
