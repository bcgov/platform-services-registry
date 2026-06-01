'use client';

import { Tooltip } from '@mantine/core';
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
    <fieldset className={cn('space-y-2', classNames?.wrapper ?? '')}>
      {label && (
        <legend className={cn('block text-sm font-medium leading-6 text-gray-900', classNames?.label ?? '')}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </legend>
      )}

      <div className="flex gap-2">
        {options.map((option, index) => {
          const checked = value === undefined ? defaultValue === option.value : value === option.value;
          return (
            <label
              key={`${option.value}-${index}`}
              className={cn('flex items-center gap-2 text-sm text-gray-900', classNames?.radioWrapper ?? '')}
            >
              <Tooltip label="Select Yes if your landing zone requires a Virtual Network (vNet) for private connectivity between Azure resources. Select No if no network is needed.">
                <input
                  type="radio"
                  id={`${id}-${option.value}`}
                  name={id}
                  value={option.value}
                  disabled={disabled || option.disabled}
                  checked={value === undefined ? undefined : checked}
                  defaultChecked={value === undefined ? checked : undefined}
                  onChange={() => onChange(option.value)}
                  required={required}
                  className={cn(
                    'm-0 h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50',
                    classNames?.radio ?? '',
                  )}
                  {...radioProps}
                />
              </Tooltip>
              <span className={cn(classNames?.radioLabel ?? '')}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
