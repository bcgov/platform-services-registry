'use client';

import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import _get from 'lodash-es/get';
import { useFieldArray, useFormContext } from 'react-hook-form';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import Label from '@/components/generic/Label';
import { cn } from '@/utils';

export default function AccountMembers({
  className = '',
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const { control, getValues } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  const values = getValues();

  return (
    <div className={cn(className)}>
      <Label htmlFor="member-email">Member Email</Label>
      <ul>
        {fields.map((item, index) => {
          const itemKey = `users.${index}.email`;

          return (
            <li key={item.id}>
              <div className="flex mb-1">
                <HookFormTextInput
                  name={itemKey}
                  placeholder="example@example.com"
                  classNames={{ wrapper: 'flex-auto' }}
                  disabled={disabled}
                />

                {!disabled && (
                  <Button color="red" size="sm" onClick={() => remove(index)} className="ml-1">
                    Delete
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {!disabled && values.users.length < 20 && (
        <Button color="green" size="xs" leftSection={<IconPlus />} onClick={() => append({ email: '' })}>
          Add New
        </Button>
      )}
    </div>
  );
}
