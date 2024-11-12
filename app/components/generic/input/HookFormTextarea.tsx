'use client';

import _get from 'lodash-es/get';
import { FieldValues, RegisterOptions, Path, useFormContext } from 'react-hook-form';
import { cn } from '@/utils';
import FormError from '../FormError';
import FormTextarea, { FormTextareaProps } from './FormTextarea';

export default function HookFormTextarea<T extends FieldValues>({
  id,
  name,
  options,
  label,
  classNames,
  disabled,
  copyable,
  ...others
}: Omit<FormTextareaProps, 'name' | 'inputProps'> & {
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
      <FormTextarea
        id={id}
        name={name}
        label={label || (copyable ? ' ' : '')}
        copyable={copyable}
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
