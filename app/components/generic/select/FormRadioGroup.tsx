'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/js';

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function FormRadioGroup({
  id,
  label,
  options,
  required,
  disabled,
  radioProps = {},
  value,
  defaultValue,
  onChange = (value: string) => {},
  classNames,
}: Readonly<{
  id: string;
  label?: string;
  options: { label: string; value: string; disabled?: boolean }[];
  required?: boolean;
  disabled?: boolean;
  radioProps?: RadioProps;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  classNames?: {
    wrapper?: string;
    label?: string;
    radioWrapper?: string;
    radio?: string;
    radioLabel?: string;
  };
}>) {
  return (
    <div className={cn('space-y-2', classNames?.wrapper ?? '')}>
      {label && (
        <label className={cn('block text-sm font-medium leading-6 text-gray-900', classNames?.label ?? '')}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex gap-2">
        {options.map((option, index) => {
          const checked = value === undefined ? defaultValue === option.value : value === option.value;
          return (
            <label
              key={`${option.value}-${index}`}
              className={cn('flex items-center gap-2 text-sm text-gray-900', classNames?.radioWrapper ?? '')}
            >
              <input
                type="radio"
                id={`${id}-${option.value}`}
                name={id}
                value={option.value}
                disabled={disabled || option.disabled}
                checked={value !== undefined ? checked : undefined}
                defaultChecked={value === undefined ? checked : undefined}
                onChange={() => onChange(option.value)}
                className={cn(
                  'm-0 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50',
                  classNames?.radio ?? '',
                )}
                {...radioProps}
              />

              <span className={cn(classNames?.radioLabel ?? '')}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
