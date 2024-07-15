'use client';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import classNames from 'classnames';
import _get from 'lodash-es/get';
import { useFieldArray, useFormContext } from 'react-hook-form';

export default function AccountMembers() {
  const {
    register,
    control,
    formState: { errors },
    getValues,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  const values = getValues();

  return (
    <>
      <div className="block text-sm font-bold leading-6 text-gray-900 mt-2 mb-1">Member Emails</div>
      <ul>
        {fields.map((item, index) => (
          <li key={item.id}>
            <div className="flex mb-1">
              <input
                autoComplete="off"
                className={classNames(
                  'flex-auto rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
                  {
                    'border-solid border-1 border-red-600 focus:ring-red-600 text-red-600': _get(
                      errors,
                      `users.${index}.email`,
                    ),
                  },
                )}
                {...register(`users.${index}.email`)}
              />
              <Button color="red" onClick={() => remove(index)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {values.users.length < 20 && (
        <Button color="green" size="xs" leftSection={<IconPlus />} onClick={() => append({ email: '' })}>
          Add New
        </Button>
      )}
    </>
  );
}
