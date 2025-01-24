'use client';

import { PasswordInput, PasswordInputProps } from '@mantine/core';
import _kebabCase from 'lodash-es/kebabCase';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/js';
import Label from '../Label';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
type OtherProps = Omit<InputProps, 'size'>;

const inputClasslist = [
  'block',
  'border-0',
  'disabled:bg-slate-50',
  'disabled:text-slate-500',
  'disabled:cursor-not-allowed',
  'focus:ring-2',
  'focus:ring-indigo-600',
  'invalid:ring-pink-600',
  'invalid:text-pink-600',
  'placeholder:text-gray-400',
  'py-2',
  'ring-1',
  'ring-gray-300',
  'ring-inset',
  'rounded-md',
  'shadow-sm',
  'sm:leading-6',
  'sm:text-sm',
  'text-gray-900',
  'w-full',
];

const inputClass = inputClasslist.join(' ');

export interface FormPasswordInputProps extends PasswordInputProps {
  id?: string;
  name: string;
  label?: string;
  inputProps?: OtherProps;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  copyable?: boolean;
  onCopy?: () => void;
  info?: string;
}

export default function FormPasswordInput({
  id,
  name,
  label,
  type = 'text',
  classNames,
  required,
  disabled,
  inputProps = {},
  copyable = false,
  onCopy,
  info,
  ...others
}: FormPasswordInputProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={cn('text-input', classNames?.wrapper)}>
      {label && (
        <Label
          htmlFor={id}
          className={classNames?.label}
          required={required}
          copyable={copyable}
          onCopy={onCopy}
          info={info}
        >
          {label}
        </Label>
      )}
      <PasswordInput
        id={id}
        name={name}
        disabled={disabled}
        autoComplete="off"
        {...inputProps}
        {...others}
        variant="unstyled"
        classNames={{ input: 'overflow-visible', innerInput: cn(inputClass, classNames?.input) }}
      />
    </div>
  );
}
