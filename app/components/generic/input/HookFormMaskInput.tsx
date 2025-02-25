'use client';

import _get from 'lodash-es/get';
import { Controller, FieldValues, RegisterOptions, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils/js';
import FormError from '../FormError';
import { HookFormRules } from '../types';
import FormMaskInput, { FormMaskInputProps } from './FormMaskInput';

export default function HookFormMaskInput<T extends FieldValues>({
  id,
  name,
  options,
  label,
  error,
  rules,
  classNames,
  disabled,
  ...others
}: Omit<FormMaskInputProps, 'name'> & {
  name: Path<T>;
  options?: RegisterOptions<T, Path<T>> | undefined;
  error?: string;
  rules?: HookFormRules<T>;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<T>();
  const formError = _get(errors, name);
  const _error = error ?? (formError && String(formError?.message));
  const showError = !!formError && !disabled;

  return (
    <div className={classNames?.wrapper}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <FormMaskInput
              id={id}
              name={name}
              label={label}
              onAccept={onChange}
              onBlur={onBlur}
              value={value}
              disabled={disabled}
              {...others}
              classNames={{
                label: cn(classNames?.label, {
                  'text-pink-600': showError,
                }),
                input: cn(classNames?.input, {
                  'ring-pink-600 text-pink-600': showError,
                }),
              }}
            />
          );
        }}
      />
      {showError && <FormError field={name} className="mt-1" message={_error} />}
    </div>
  );
}
