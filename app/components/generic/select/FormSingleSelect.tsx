'use client';

import { Select, ComboboxData, ComboboxItem } from '@mantine/core';
import _isNil from 'lodash-es/isNil';
import _kebabCase from 'lodash-es/kebabCase';
import { FocusEventHandler } from 'react';
import { cn } from '@/utils/js';
import Label from '../Label';

export interface FormSingleSelectProps {
  id?: string;
  name: string;
  label?: string;
  data: ComboboxData;
  onChange: (value: string, option: ComboboxItem) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  value: string;
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
  searchable?: boolean;
}

export default function FormSingleSelect({
  id,
  name,
  label,
  classNames,
  data,
  onChange,
  onBlur,
  value,
  disabled = false,
  searchable = true,
}: FormSingleSelectProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={cn('select-single', classNames?.wrapper)}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      <Select
        placeholder="select..."
        data={data}
        onChange={(val, option) => {
          if (!_isNil(val)) onChange(val, option);
        }}
        onBlur={onBlur}
        value={value}
        searchable={searchable}
        disabled={disabled}
        classNames={{ input: cn('text-md', classNames?.input) }}
      />
    </div>
  );
}
