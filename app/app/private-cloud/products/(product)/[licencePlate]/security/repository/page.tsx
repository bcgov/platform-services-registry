'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFieldArray } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { success } from '@/components/notification';
import { ProjectContext } from '@/prisma/client';
import { getSecurityConfig, upsertSecurityConfig } from '@/services/backend/security-config';
import { SecurityConfig, SecurityConfigInput, securityConfigSchema } from '@/validation-schemas';

interface ModelResult<T> {
  readonly data: T | null;
  readonly args: unknown;
}

interface SecurityConfigResponse {
  readonly config: ModelResult<SecurityConfig>;
  readonly project: ModelResult<{
    cluster: string;
    repositories: SecurityConfig['repositories'];
  }>;
}

export default function Repository({ params: getParams }: { params: Promise<{ licencePlate: string }> }) {
  const [params, setParams] = useState<{ licencePlate: string }>({ licencePlate: '' });

  useEffect(() => {
    getParams.then((v) => setParams(v));
  }, [getParams]);

  const methods = useForm<SecurityConfigInput, unknown, SecurityConfig>({
    resolver: zodResolver(securityConfigSchema),
    defaultValues: {
      context: ProjectContext.PRIVATE,
      clusterOrProvider: '',
      licencePlate: params.licencePlate,
      repositories: [],
    },
  });

  const { control, handleSubmit, setValue } = methods;

  const {
    data: current,
    isLoading: isFetching,
    isError: isFetchingError,
    error: fetchingError,
  } = useQuery<SecurityConfigResponse, Error>({
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
    const project = current?.project.data;

    if (!project) return;

    setValue('licencePlate', params.licencePlate);
    setValue('clusterOrProvider', project.cluster);
    setValue('repositories', project.repositories ?? []);
  }, [current, params.licencePlate, setValue]);

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

                  <Button type="button" color="danger" onClick={() => remove(index)} className="ml-1">
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {fields.length < 10 && (
            <Button type="button" color="primary" onClick={() => append({ url: '' })}>
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
