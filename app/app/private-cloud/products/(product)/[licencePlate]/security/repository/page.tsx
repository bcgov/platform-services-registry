'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notifications } from '@mantine/notifications';
import { SecurityConfig, $Enums } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import _get from 'lodash-es/get';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { SecurityConfigRequestBodySchema } from '@/schema';
import { getSecurityConfig, upsertSecurityConfig } from '@/services/backend/security-config';

export default function Repository({ params }: { params: { licencePlate: string } }) {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<SecurityConfig>({
    resolver: zodResolver(SecurityConfigRequestBodySchema),
    defaultValues: {
      context: $Enums.ProjectContext.PRIVATE,
      clusterOrProvider: '',
      licencePlate: params.licencePlate,
      repositories: [{ url: 'https://' }],
    },
  });

  const {
    data: current,
    isLoading: isFetching,
    isError: isFetchingError,
    error: fetchingError,
  } = useQuery<{ config: SecurityConfig; project: { cluster: string; provider: string } }, Error>({
    queryKey: ['securityConfig', params.licencePlate],
    queryFn: () => getSecurityConfig(params.licencePlate, $Enums.ProjectContext.PRIVATE),
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
      <form
        onSubmit={handleSubmit(async (data) => {
          await mutateAsync(data);
          notifications.show({
            color: 'green',
            title: 'Success',
            message: 'Successfully updated!',
            autoClose: 5000,
          });
        })}
      >
        <ul>
          {fields.map((item, index) => (
            <li key={item.id}>
              <div className="flex mb-1">
                <input
                  autoComplete="off"
                  className={classNames(
                    'flex-auto rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
                  )}
                  {...register(`repositories.${index}.url`)}
                />

                <button
                  type="button"
                  className="ml-2 rounded-md bg-red-600 text-white px-4 py-2.5 text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-32"
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
              {_get(errors, `repositories.${index}.url`) && (
                <span className="text-red-600">{_get(errors, `repositories.${index}.url.message`)}</span>
              )}
            </li>
          ))}
        </ul>

        {values.repositories.length < 10 && (
          <button
            type="button"
            className="rounded-md bg-blue-400 text-white px-4 py-2.5 text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-32"
            onClick={() => append({ url: 'https://' })}
          >
            Add New
          </button>
        )}

        <button
          type="submit"
          className="ml-2 rounded-md bg-green-600 text-white px-4 py-2.5 text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-32"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
