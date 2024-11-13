'use client';

import _kebabCase from 'lodash-es/kebabCase';
import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils';
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
  'shadow-sm',
  'sm:leading-6',
  'sm:text-sm',
  'text-gray-900',
  'w-full',
  '[appearance:textfield]',
  '[&::-webkit-outer-spin-button]:appearance-none',
  '[&::-webkit-inner-spin-button]:appearance-none',
  'pl-7',
  'pr-12',
];

const inputClass = inputClasslist.join(' ');

export interface FormDollarInputProps extends InputProps {
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

export default function FormDollarInput({
  id,
  name,
  label,
  classNames,
  required,
  disabled,
  inputProps = {},
  copyable = false,
  onCopy,
  info,
  ...others
}: FormDollarInputProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={classNames?.wrapper}>
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
      <div className="relative mt-2 rounded-md shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          id={id}
          name={name}
          disabled={disabled}
          autoComplete="off"
          step="0.01"
          {...inputProps}
          {...others}
          type="number"
          className={cn(inputClass, classNames?.input)}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-gray-500 sm:text-sm" id="price-currency">
            USD
          </span>
        </div>
      </div>
    </div>
  );
}
