'use client';

import classnames from 'classnames';
import { SelectHTMLAttributes, ChangeEventHandler, RefObject } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export default function FormSelect({
  id,
  label,
  options,
  ref,
  required,
  disabled,
  selectProps = {},
  defaultValue,
  onChange = (value: string) => {},
  className,
}: {
  id: string;
  label: string;
  options: { label: string; value: string; disabled?: boolean }[];
  ref?: RefObject<HTMLSelectElement>;
  selectProps?: SelectProps;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: {
    label?: string;
    input?: string;
  };
}) {
  return (
    <>
      {label && (
        <label
          htmlFor={id}
          className={classnames('block text-sm font-medium leading-6 text-gray-900 mb-2', className?.label ?? '')}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={id}
        autoComplete={id}
        disabled={disabled === true}
        className={classnames(
          'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500',
          className?.input ?? '',
        )}
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        {...selectProps}
      >
        {options.map((option, index) => {
          return (
            <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled === true}>
              {option.label}
            </option>
          );
        })}
      </select>
    </>
  );
}
