'use client';

import _get from 'lodash-es/get';
import { FieldValues, RegisterOptions, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils/js';
import FormError from '../FormError';
import FormPasswordInput, { FormPasswordInputProps } from './FormPasswordInput';

export default function HookFormPasswordInput<T extends FieldValues>({
  id,
  name,
  options,
  label,
  error,
  classNames,
  disabled,
  ...others
}: Omit<FormPasswordInputProps, 'name' | 'inputProps'> & {
  name: Path<T>;
  options?: RegisterOptions<T, Path<T>>;
  error?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const formError = _get(errors, name);
  const _error = error ?? (formError && String(formError?.message));
  const showError = !!formError && !disabled;

  return (
    <div className={classNames?.wrapper}>
      <FormPasswordInput
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
      {showError && <FormError field={name} className="mt-1" message={_error} />}
    </div>
  );
}
