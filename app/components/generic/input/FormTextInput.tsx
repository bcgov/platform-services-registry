'use client';

import _kebabCase from 'lodash-es/kebabCase';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/js';
import Label from '../Label';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

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
  'shadow-xs',
  'sm:leading-6',
  'sm:text-sm',
  'text-gray-900',
  'w-full',
];

const inputClass = inputClasslist.join(' ');

export interface FormTextInputProps extends InputProps {
  id?: string;
  name: string;
  label?: string;
  inputProps?: InputProps;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  copyable?: boolean;
  onCopy?: () => void;
  info?: string;
}

export default function FormTextInput({
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
}: FormTextInputProps) {
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
      <input
        type={type}
        id={id}
        name={name}
        disabled={disabled}
        autoComplete="off"
        {...inputProps}
        {...others}
        className={cn(inputClass, classNames?.input)}
      />
    </div>
  );
}
