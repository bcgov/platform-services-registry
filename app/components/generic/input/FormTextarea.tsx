'use client';

import classnames from 'classnames';
import _isFunction from 'lodash-es/isFunction';
import _kebabCase from 'lodash-es/kebabCase';
import { TextareaHTMLAttributes, useRef } from 'react';
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
  'shadow-sm',
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
  copyable = false,
  inputProps = {},
  ...others
}: FormTextareaProps) {
  if (!id) id = _kebabCase(name);
  const _ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={classNames?.wrapper}>
      {label && (
        <Label
          htmlFor={id}
          className={classNames?.label}
          required={required}
          leftSection={
            copyable ? (
              <CopyableButton
                onClick={() => {
                  if (!_ref.current) return '';
                  return _ref.current.value;
                }}
              />
            ) : null
          }
        >
          {label}
        </Label>
      )}
      <textarea
        id={id}
        name={name}
        rows={rows}
        disabled={disabled}
        autoComplete="off"
        {...inputProps}
        {...others}
        // Required to bind three potential refs:
        // 1. From the inputProps ex) react-hook-form.
        // 2. From the this component instance itself.
        ref={(el) => {
          if (!el) return;

          [_ref, inputProps.ref].forEach((rf) => {
            if (!rf) return;

            if (_isFunction(rf)) {
              rf(el);
            } else {
              rf.current = el;
            }
          });
        }}
        className={classnames(inputClass, classNames?.input)}
      />
    </div>
  );
}
