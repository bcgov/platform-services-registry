'use client';

import _get from 'lodash-es/get';
import { FieldValues, RegisterOptions, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils/js';
import FormError from '../FormError';
import FormDollarInput, { FormDollarInputProps } from './FormDollarInput';

export default function HookFormDollarInput<T extends FieldValues>({
  id,
  name,
  options,
  label,
  classNames,
  disabled,
  ...others
}: Omit<FormDollarInputProps, 'name' | 'inputProps'> & {
  name: Path<T>;
  options?: RegisterOptions<T, Path<T>> | undefined;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = _get(errors, name);
  const showError = !!error && !disabled;

  return (
    <div className={classNames?.wrapper}>
      <FormDollarInput
        id={id}
        name={name}
        label={label}
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
        inputProps={register(name, options)}
      />
      {showError && <FormError field={name} className="mt-1" />}
    </div>
  );
}
