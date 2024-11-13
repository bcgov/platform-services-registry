'use client';

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils';
import FormError from '../FormError';
import { HookFormRules } from '../types';
import FormMultiSelect, { FormMultiSelectProps } from './FormMultiSelect';

export default function HookFormMultiSelect<T extends FieldValues>({
  id,
  name,
  label,
  error,
  rules,
  data,
  classNames,
  disabled = false,
  ...others
}: Omit<FormMultiSelectProps, 'name' | 'onChange' | 'onBlur' | 'value'> & {
  rules?: HookFormRules<T>;
  name: Path<T>;
  error?: string;
}) {
  const { control } = useFormContext<T>();
  const { wrapper, ...restClassnames } = classNames ?? {};

  return (
    <div className={cn('hook-multi-select', wrapper)}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <FormMultiSelect
              id={id}
              name={name}
              label={label}
              data={data}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              disabled={disabled}
              {...others}
              classNames={restClassnames}
            />
          );
        }}
      />
      <FormError field={name} className="mt-1" message={error} />
    </div>
  );
}
