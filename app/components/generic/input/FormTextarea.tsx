'use client';

import _isFunction from 'lodash-es/isFunction';
import _kebabCase from 'lodash-es/kebabCase';
import { TextareaHTMLAttributes, useRef, useState } from 'react';
import { cn } from '@/utils/js';
import CopyableButton from '../button/CopyableButton';
import Label from '../Label';

interface InputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

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
  'py-1.5',
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

export interface FormTextareaProps extends InputProps {
  id?: string;
  name: string;
  label?: string;
  copyable?: boolean;
  // Display a live character counter below the textarea. When `maxLength` is
  // also set, the counter renders as `current / maxLength`.
  showCharCount?: boolean;
  inputProps?: InputProps & { ref?: any };
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
}

export default function FormTextarea({
  id,
  name,
  label,
  rows = 5,
  classNames,
  required,
  disabled,
  maxLength,
  showCharCount = false,
  copyable = false,
  inputProps = {},
  ...others
}: FormTextareaProps) {
  if (!id) id = _kebabCase(name);
  const _ref = useRef<HTMLTextAreaElement>(null);
  const [count, setCount] = useState(0);

  return (
    <div className={cn('textarea', classNames?.wrapper)}>
      {label && (
        <Label
          htmlFor={id}
          className={classNames?.label}
          required={required}
          copyable={copyable}
          onCopy={() => {
            if (!_ref.current) return '';
            return _ref.current.value;
          }}
        >
          {label}
        </Label>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete="off"
        {...inputProps}
        {...others}
        // Track the length locally and forward the event to both possible
        // consumers: react-hook-form's `register` handler (via inputProps) and
        // a controlled caller's handler (via others). Declared after the
        // spreads so this wrapper wins and neither handler is dropped.
        onChange={(e) => {
          setCount(e.currentTarget.value.length);
          inputProps.onChange?.(e);
          others.onChange?.(e);
        }}
        // Required to bind three potential refs:
        // 1. From the inputProps ex) react-hook-form.
        // 2. From the this component instance itself.
        ref={(el) => {
          if (!el) return;

          // Sync the counter with the initial/current value (uncontrolled
          // react-hook-form fields populate the DOM without firing onChange).
          setCount(el.value.length);

          [_ref, inputProps.ref].forEach((rf) => {
            if (!rf) return;

            if (_isFunction(rf)) {
              rf(el);
            } else {
              rf.current = el;
            }
          });
        }}
        className={cn(inputClass, classNames?.input)}
      />
      {showCharCount && (
        <div className="mt-1 text-xs text-right text-gray-500">
          {count}
          {maxLength ? ` / ${maxLength}` : ''}
        </div>
      )}
    </div>
  );
}
