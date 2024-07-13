'use client';

import { MultiSelect } from '@mantine/core';
import _get from 'lodash-es/get';
import { Controller, useFormContext } from 'react-hook-form';

export default function AccountRoles({ allRoles }: { allRoles: string[] }) {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name="roles"
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <MultiSelect
              label="API Account Roles"
              placeholder="select..."
              data={allRoles}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              searchable
              classNames={{ label: 'block text-sm font-bold leading-6 text-gray-900 mb-1' }}
            />
          );
        }}
      />
    </>
  );
}
