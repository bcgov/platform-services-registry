'use client';

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';
import FormError from '../FormError';
import { HookFormRules } from '../types';
import FormSingleSelect, { FormSingleSelectProps } from './FormSingleSelect';

export default function HookFormSingleSelect<T extends FieldValues>({
  id,
  name,
  label,
  error,
  rules,
  data,
  classNames,
  disabled = false,
  showError = true,
}: Omit<FormSingleSelectProps, 'name' | 'onChange' | 'onBlur' | 'value'> & {
  rules?: HookFormRules<T>;
  name: Path<T>;
  showError?: boolean;
  error?: string;
}) {
  const { control } = useFormContext<T>();

  return (
    <>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <FormSingleSelect
              id={id}
              name={name}
              label={label}
              data={data}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              disabled={disabled}
              classNames={classNames}
            />
          );
        }}
      />
      {showError && <FormError field={name} className="mt-1" message={error} />}
    </>
  );
}
