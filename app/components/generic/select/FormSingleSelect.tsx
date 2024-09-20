'use client';

import { Select, ComboboxData, ComboboxItem } from '@mantine/core';
import classnames from 'classnames';
import _kebabCase from 'lodash-es/kebabCase';
import { FocusEventHandler } from 'react';
import Label from '../Label';

export interface FormSingleSelectProps {
  id?: string;
  name: string;
  label?: string;
  data: ComboboxData;
  onChange: (value: string, option: ComboboxItem) => void;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  value: string;
  disabled?: boolean;
  classNames?: {
    wrapper?: string;
    label?: string;
    input?: string;
  };
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
}: FormSingleSelectProps) {
  if (!id) id = _kebabCase(name);

  return (
    <div className={classNames?.wrapper}>
      {label && (
        <Label htmlFor={id} className={classNames?.label}>
          {label}
        </Label>
      )}

      <Select
        placeholder="select..."
        data={data}
        onChange={(val, option) => {
          if (val) onChange(val, option);
        }}
        onBlur={onBlur}
        value={value}
        searchable
        disabled={disabled}
        classNames={{ input: classnames('text-md', classNames?.input) }}
      />
    </div>
  );
}
