'use client';

import _isFunction from 'lodash-es/isFunction';
import _kebabCase from 'lodash-es/kebabCase';
import { ChangeEvent, TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/js';
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
  const {
    onChange: inputOnChange,
    value: inputValue,
    defaultValue: inputDefaultValue,
    maxLength: inputMaxLength,
    ref: inputRef,
    ...restInputProps
  } = inputProps;
  const {
    onChange: otherOnChange,
    value: otherValue,
    defaultValue: otherDefaultValue,
    maxLength: otherMaxLength,
    ...restOthers
  } = others;

  // Both RHF register props and direct value/defaultValue props are supported.
  // Direct props take precedence when both are provided to avoid surprising parent-controlled behavior.
  const controlledValue = otherValue ?? inputValue;
  const isControlled = typeof controlledValue !== 'undefined';
  const maxLength = otherMaxLength ?? inputMaxLength;
  const defaultValue = otherDefaultValue ?? inputDefaultValue;
  const [characterCount, setCharacterCount] = useState(() => {
    const initialValue = isControlled ? controlledValue : defaultValue;
    return String(initialValue ?? '').length;
  });

  useEffect(() => {
    if (isControlled) {
      setCharacterCount(String(controlledValue ?? '').length);
    }
  }, [controlledValue, isControlled]);

  useEffect(() => {
    if (!isControlled && _ref.current) {
      setCharacterCount(_ref.current.value.length);
    }
  }, [isControlled]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(event.target.value.length);
    inputOnChange?.(event);
    otherOnChange?.(event);
  };

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
        autoComplete="off"
        {...restInputProps}
        {...restOthers}
        {...(isControlled ? { value: controlledValue } : { defaultValue })}
        maxLength={maxLength}
        onChange={handleChange}
        // Required to bind three potential refs:
        // 1. From the inputProps ex) react-hook-form.
        // 2. From the this component instance itself.
        ref={(el) => {
          if (!el) return;

          [_ref, inputRef].forEach((rf) => {
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
      <div className="mt-1 text-right text-xs text-gray-500">
        {typeof maxLength === 'number' ? `${characterCount} / ${maxLength}` : ''}
      </div>
    </div>
  );
}
