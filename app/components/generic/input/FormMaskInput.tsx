'use client';

import _kebabCase from 'lodash-es/kebabCase';
import { IMaskInput, ReactMaskProps } from 'react-imask';
import { cn } from '@/utils/js';
import Label from '../Label';

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

export interface FormMaskInputProps {
  id?: string;
  name: string;
  label?: string;
  placeholder?: string;
  mask?: string;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  required?: boolean;
  disabled?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  info?: string;
  onAccept?: (value: string) => void;
  onBlur?: () => void;
  value?: string;
}

export default function FormMaskInput({
  id,
  name,
  label,
  placeholder = '+1 (999) 999-9999',
  mask = '+1 (000) 000-0000',
  classNames,
  required,
  disabled,
  copyable = false,
  onCopy,
  info,
  onAccept,
  onBlur,
  value,
}: FormMaskInputProps) {
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
      <IMaskInput
        id={id}
        name={name}
        disabled={disabled}
        autoComplete="off"
        mask={mask}
        placeholder={placeholder}
        unmask
        value={value}
        onAccept={onAccept}
        onBlur={onBlur}
        className={cn(inputClass, classNames?.input)}
      />
    </div>
  );
}
