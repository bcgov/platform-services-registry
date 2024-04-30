'use client';

import { InputHTMLAttributes, RefObject, ReactNode } from 'react';
import classnames from 'classnames';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function FormCheckbox({
  id,
  label,
  ref,
  checked,
  disabled,
  inputProps = {},
  onChange = (v: boolean) => {},
  hasError = false,
  children,
  error,
  className,
}: {
  id: string;
  label?: string;
  ref?: RefObject<HTMLInputElement>;
  checked?: boolean;
  disabled?: boolean;
  inputProps?: InputProps;
  onChange?: (v: boolean) => void;
  hasError?: boolean;
  children?: ReactNode;
  error?: ReactNode;
  className?: {
    label?: string;
    input?: string;
  };
}) {
  return (
    <div className="flex font-bcsans">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        {...inputProps}
        className={classnames(
          'h-4 w-4 mt-1 border-black-400 text-indigo-600 focus:ring-indigo-600',
          className?.input ?? '',
        )}
      />
      <div className="ml-3">
        <label htmlFor={id} className={classnames('text-gray-900 select-none cursor-pointer', className?.label ?? '')}>
          {children ?? label}
        </label>
        {hasError && <div>{error}</div>}
      </div>
    </div>
  );
}
