'use client';

import _get from 'lodash-es/get';
import { FieldValues, RegisterOptions, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils';
import FormError from '../FormError';
import FormTextInput, { FormTextInputProps } from './FormTextInput';

export default function HookFormTextInput<T extends FieldValues>({
  id,
  name,
  options,
  label,
  error,
  classNames,
  disabled,
  ...others
}: Omit<FormTextInputProps, 'name' | 'inputProps'> & {
  name: Path<T>;
  options?: RegisterOptions<T, Path<T>> | undefined;
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
      <FormTextInput
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
