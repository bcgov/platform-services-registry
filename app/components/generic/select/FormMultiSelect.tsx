'use client';

import { MultiSelect, ComboboxData } from '@mantine/core';
import classnames from 'classnames';
import _kebabCase from 'lodash-es/kebabCase';
import { FocusEventHandler } from 'react';
import Label from '../Label';

export interface FormMultiSelectProps {
  id?: string;
  name: string;
  label?: string;
  data: ComboboxData;
  onChange: (value: string[]) => void;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  value: string[];
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
}

export default function FormMultiSelect({
  id,
  name,
  label,
  classNames,
  data,
  onChange,
  onBlur,
  value,
  disabled = false,
}: FormMultiSelectProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={classNames?.wrapper}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      <MultiSelect
        placeholder="select..."
        data={data}
        onChange={onChange}
        onBlur={onBlur}
        value={value}
        searchable
        disabled={disabled}
        classNames={{ input: classnames('text-md', classNames?.input) }}
      />
    </div>
  );
}
